import os
import tempfile
import unittest
from unittest.mock import Mock, patch

from app.storage import StorageService


class StorageServiceTests(unittest.TestCase):
    def test_listing_media_returns_public_url(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(
                os.environ,
                {
                    "STORAGE_BACKEND": "local",
                    "LOCAL_STORAGE_DIR": directory,
                    "CDN_BASE_URL": "https://cdn.example.test",
                },
            ):
                storage = StorageService()
                record = storage.store_file(b"listing image", "listing_media")

        self.assertTrue(record["mediaUrl"].startswith("https://cdn.example.test/listing_media/"))
        self.assertTrue(record["storageKey"].startswith("listing_media/"))

    def test_private_media_has_no_public_url_and_is_stored_separately(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(
                os.environ,
                {
                    "STORAGE_BACKEND": "local",
                    "LOCAL_STORAGE_DIR": directory,
                    "CDN_BASE_URL": "https://cdn.example.test",
                },
            ):
                storage = StorageService()
                record = storage.store_file(b"identity document", "kyc_vault")
                private_file = storage.get_private_file_path(record["storageKey"])
                self.assertTrue(private_file.is_file())

        self.assertIsNone(record["mediaUrl"])
        self.assertTrue(record["storageKey"].startswith("kyc_vault/"))
        self.assertNotIn("/media/", record["storageKey"])

    def test_private_key_cannot_escape_private_folders(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(
                os.environ,
                {"STORAGE_BACKEND": "local", "LOCAL_STORAGE_DIR": directory},
            ):
                storage = StorageService()

            for key in ("listing_media/photo.webp", "kyc_vault/../secret.webp", r"kyc_vault\secret.webp"):
                with self.subTest(key=key):
                    with self.assertRaises(ValueError):
                        storage.get_private_file_path(key)

    def test_unknown_storage_category_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(
                os.environ,
                {"STORAGE_BACKEND": "local", "LOCAL_STORAGE_DIR": directory},
            ):
                storage = StorageService()
                with self.assertRaises(ValueError):
                    storage.store_file(b"not public", "../listing_media")

    @patch("boto3.client")
    def test_s3_uses_distinct_public_and_private_buckets(self, make_client):
        s3_client = Mock()
        s3_client.generate_presigned_url.return_value = "https://private.example.test/signed"
        make_client.return_value = s3_client
        with patch.dict(
            os.environ,
            {
                "STORAGE_BACKEND": "s3",
                "S3_REGION": "auto",
                "S3_ENDPOINT_URL": "https://account-id.r2.cloudflarestorage.com",
                "S3_PUBLIC_BUCKET_NAME": "public-media",
                "S3_PRIVATE_BUCKET_NAME": "private-media",
                "CDN_BASE_URL": "https://media.example.test",
            },
        ):
            storage = StorageService()
            public_record = storage.store_file(b"public image", "listing_media")
            private_record = storage.store_file(b"private image", "dispute_evidence")
            signed_url = storage.create_private_download_url(private_record["storageKey"])

        calls_by_bucket = {
            call.kwargs["Bucket"]: call.kwargs["Key"]
            for call in s3_client.put_object.call_args_list
        }
        self.assertIn("listing_media/", calls_by_bucket["public-media"])
        self.assertIn("dispute_evidence/", calls_by_bucket["private-media"])
        self.assertIsNotNone(public_record["mediaUrl"])
        self.assertIsNone(private_record["mediaUrl"])
        self.assertEqual(signed_url, "https://private.example.test/signed")
        self.assertEqual(s3_client.generate_presigned_url.call_args.kwargs["Params"]["Bucket"], "private-media")


if __name__ == "__main__":
    unittest.main()
