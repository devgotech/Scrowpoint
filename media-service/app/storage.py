"""
Buyer's High Secure Object Storage Microservice Component
Handles saving sanitized media and returning secure CDN / object storage URLs.
Supports local directory storage (testing/development) and cloud object store adapters (S3/GCS in production).
"""

import hashlib
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("buyers_high_media.storage")


class StorageService:
    """
    Manages partitioned, tamper-evident object storage for Buyer's High media assets.
    Enforces path traversal defenses, generates cryptographically random identifiers,
    and supports both Local and AWS S3 backends for testing and production readiness.
    """

    ALLOWED_FOLDERS = {"listing_media", "kyc_vault", "dispute_evidence", "gadgets"}

    def __init__(self):
        self.backend = os.getenv("STORAGE_BACKEND", "local").lower()
        self.local_dir = Path(os.getenv("LOCAL_STORAGE_DIR", "/tmp/buyers_high_media"))
        self.cdn_base = os.getenv("CDN_BASE_URL", "http://localhost:8000/media").rstrip("/")
        self.s3_bucket = os.getenv("S3_BUCKET_NAME", "buyers-high-secure-media-vault")
        self.aws_region = os.getenv("AWS_REGION", "eu-west-1")

        self.s3_client = None

        if self.backend == "local":
            self.local_dir.mkdir(parents=True, exist_ok=True)
            for folder in self.ALLOWED_FOLDERS:
                (self.local_dir / folder).mkdir(parents=True, exist_ok=True)
            logger.info("StorageService initialized in LOCAL mode: %s", self.local_dir)

        elif self.backend == "s3":
            try:
                import boto3
                self.s3_client = boto3.client(
                    "s3",
                    region_name=self.aws_region,
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
                )
                logger.info("StorageService initialized in S3 mode. Bucket: %s", self.s3_bucket)
            except Exception as e:
                logger.warning("Failed to initialize boto3 S3 client: %s. Falling back to local storage.", e)
                self.backend = "local"
                self.local_dir.mkdir(parents=True, exist_ok=True)
                for folder in self.ALLOWED_FOLDERS:
                    (self.local_dir / folder).mkdir(parents=True, exist_ok=True)

    def store_file(
        self,
        file_bytes: bytes,
        folder: str,
        extension: str = "webp"
    ) -> Dict[str, Any]:
        """
        Stores sanitized bytes into a segregated partition and returns storage metadata.

        Args:
            file_bytes: Sanitized image bytes.
            folder: Partition key ('listing_media', 'kyc_vault', or 'dispute_evidence').
            extension: File extension without leading period (default: 'webp').

        Returns:
            Dict containing mediaUrl, sha256Checksum, sizeBytes, and storagePath.
        """
        # 1. Folder validation & path traversal defense
        clean_folder = re.sub(r"[^a-zA-Z0-9_\-]", "", folder)
        if clean_folder not in self.ALLOWED_FOLDERS:
            clean_folder = "listing_media"

        # 2. Cryptographic checksum calculation (for non-repudiation and dispute evidence)
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        # 3. Collision-resistant partitioned filename: YYYYMMDD_UUIDv4.ext
        date_prefix = datetime.now(timezone.utc).strftime("%Y%m%d")
        unique_token = uuid.uuid4().hex
        filename = f"{date_prefix}_{unique_token}.{extension.lower().lstrip('.')}"
        relative_path = f"{clean_folder}/{filename}"

        # 4. Save to target backend
        if self.backend == "local":
            target_dir = self.local_dir / clean_folder
            target_dir.mkdir(parents=True, exist_ok=True)
            target_path = target_dir / filename
            with open(target_path, "wb") as f:
                f.write(file_bytes)

        elif self.backend == "s3" and self.s3_client:
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=relative_path,
                Body=file_bytes,
                ContentType=f"image/{extension}",
                ServerSideEncryption="AES256"
            )

        # 5. Build public or CDN URL
        media_url = f"{self.cdn_base}/{relative_path}"

        return {
            "mediaUrl": media_url,
            "sha256Checksum": sha256_hash,
            "sizeBytes": len(file_bytes),
            "storagePath": relative_path,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
