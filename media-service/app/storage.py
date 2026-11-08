"""
Storage for public listing media and private KYC/dispute files.
"""

import hashlib
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Dict

logger = logging.getLogger("buyers_high_media.storage")


class StorageService:
    PUBLIC_FOLDERS = {"listing_media", "gadgets"}
    PRIVATE_FOLDERS = {"kyc_vault", "dispute_evidence"}
    ALLOWED_FOLDERS = PUBLIC_FOLDERS | PRIVATE_FOLDERS

    def __init__(self):
        self.backend = os.getenv("STORAGE_BACKEND", "local").lower()
        self.local_dir = Path(os.getenv("LOCAL_STORAGE_DIR", "/tmp/buyers_high_media"))
        public_base_url = os.getenv("CDN_BASE_URL")
        self.cdn_base = (public_base_url or "http://localhost:8000/media").rstrip("/")
        self.public_bucket = os.getenv("S3_PUBLIC_BUCKET_NAME", "")
        self.private_bucket = os.getenv("S3_PRIVATE_BUCKET_NAME", "")
        self.s3_client = None

        if self.backend == "local":
            self.local_dir.mkdir(parents=True, exist_ok=True)
            for folder in self.ALLOWED_FOLDERS:
                (self.local_dir / folder).mkdir(parents=True, exist_ok=True)
        elif self.backend == "s3":
            if not self.public_bucket or not self.private_bucket:
                raise ValueError(
                    "S3_PUBLIC_BUCKET_NAME and S3_PRIVATE_BUCKET_NAME are required "
                    "when STORAGE_BACKEND=s3"
                )
            if not public_base_url:
                raise ValueError("CDN_BASE_URL is required when STORAGE_BACKEND=s3")

            import boto3

            client_options: Dict[str, Any] = {
                "region_name": os.getenv("S3_REGION", "eu-west-1"),
            }
            endpoint_url = os.getenv("S3_ENDPOINT_URL")
            if endpoint_url:
                client_options["endpoint_url"] = endpoint_url

            access_key = os.getenv("AWS_ACCESS_KEY_ID")
            secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            if access_key:
                client_options["aws_access_key_id"] = access_key
            if secret_key:
                client_options["aws_secret_access_key"] = secret_key

            self.s3_client = boto3.client("s3", **client_options)
        else:
            raise ValueError("STORAGE_BACKEND must be either 'local' or 's3'")

        logger.info("StorageService initialized with %s storage", self.backend.upper())

    @staticmethod
    def _normalize_private_key(storage_key: str) -> str:
        key_path = PurePosixPath(storage_key)
        if (
            key_path.is_absolute()
            or "\\" in storage_key
            or "\x00" in storage_key
            or any(part in {"", ".", ".."} for part in key_path.parts)
            or len(key_path.parts) < 2
            or key_path.parts[0] not in StorageService.PRIVATE_FOLDERS
        ):
            raise ValueError("Invalid private storage key")
        return key_path.as_posix()

    def store_file(
        self,
        file_bytes: bytes,
        folder: str,
        extension: str = "webp",
    ) -> Dict[str, Any]:
        if folder not in self.ALLOWED_FOLDERS:
            raise ValueError("Unsupported storage category")

        is_private = folder in self.PRIVATE_FOLDERS
        checksum = hashlib.sha256(file_bytes).hexdigest()
        date_prefix = datetime.now(timezone.utc).strftime("%Y%m%d")
        filename = f"{date_prefix}_{uuid.uuid4().hex}.{extension.lower().lstrip('.')}"
        storage_key = f"{folder}/{filename}"

        if self.backend == "local":
            target_path = self.local_dir / folder / filename
            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.write_bytes(file_bytes)
        else:
            bucket = self.private_bucket if is_private else self.public_bucket
            self.s3_client.put_object(
                Bucket=bucket,
                Key=storage_key,
                Body=file_bytes,
                ContentType=f"image/{extension.lower().lstrip('.')}",
                CacheControl="private, no-store" if is_private else "public, max-age=31536000, immutable",
            )

        return {
            "mediaUrl": None if is_private else f"{self.cdn_base}/{storage_key}",
            "storageKey": storage_key,
            "sha256Checksum": checksum,
            "sizeBytes": len(file_bytes),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }

    def get_private_file_path(self, storage_key: str) -> Path:
        normalized_key = self._normalize_private_key(storage_key)
        root = self.local_dir.resolve()
        target = (root / Path(*PurePosixPath(normalized_key).parts)).resolve()
        if not target.is_relative_to(root):
            raise ValueError("Invalid private storage key")
        return target

    def create_private_download_url(self, storage_key: str, expires_in: int = 300) -> str:
        if self.backend != "s3" or self.s3_client is None:
            raise RuntimeError("Signed download URLs are only available with S3 storage")
        normalized_key = self._normalize_private_key(storage_key)
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.private_bucket,
                "Key": normalized_key,
                "ResponseCacheControl": "no-store",
            },
            ExpiresIn=expires_in,
        )
