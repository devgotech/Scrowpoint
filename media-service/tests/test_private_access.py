import os
import tempfile
import time
import unittest

import jwt
from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import FileResponse

_MEDIA_DIRECTORY = tempfile.TemporaryDirectory()
os.environ["STORAGE_BACKEND"] = "local"
os.environ["LOCAL_STORAGE_DIR"] = _MEDIA_DIRECTORY.name
os.environ["JWT_SECRET"] = "private-media-test-secret-with-at-least-32-bytes"

from app.main import get_private_file, storage


def make_request(token=None):
    headers = []
    if token:
        headers.append((b"authorization", f"Bearer {token}".encode("ascii")))
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/private/kyc_vault/test.webp",
            "headers": headers,
        }
    )


def make_token(role):
    return jwt.encode(
        {
            "userId": "00000000-0000-0000-0000-000000000001",
            "role": role,
            "iss": "buyers-high-escrow",
            "exp": int(time.time()) + 60,
        },
        os.environ["JWT_SECRET"],
        algorithm="HS256",
    )


class PrivateMediaAccessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        stored = storage.store_file(b"private test file", "kyc_vault")
        cls.storage_key = stored["storageKey"]

    def test_requires_admin_authentication(self):
        with self.assertRaises(HTTPException) as error:
            get_private_file(self.storage_key, make_request())
        self.assertEqual(error.exception.status_code, 401)

    def test_rejects_non_admin_users(self):
        with self.assertRaises(HTTPException) as error:
            get_private_file(self.storage_key, make_request(make_token("buyer")))
        self.assertEqual(error.exception.status_code, 403)

    def test_admin_can_retrieve_private_local_file(self):
        response = get_private_file(self.storage_key, make_request(make_token("admin")))
        self.assertIsInstance(response, FileResponse)
        self.assertEqual(response.headers["cache-control"], "no-store")


if __name__ == "__main__":
    unittest.main()
