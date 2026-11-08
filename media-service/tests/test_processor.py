import io
import unittest
from unittest.mock import patch

from PIL import Image

from app import processor


def make_image_bytes(image, image_format="JPEG", exif=None):
    buffer = io.BytesIO()
    image.save(buffer, format=image_format, exif=exif or b"")
    return buffer.getvalue()


class ImageProcessorTests(unittest.TestCase):
    def test_downscales_and_strips_exif_metadata(self):
        image = Image.new("RGB", (400, 200), color="red")
        exif = Image.Exif()
        exif[271] = "Scrowpoint test camera"
        exif[274] = 6
        image_bytes = make_image_bytes(image, exif=exif)

        result, content_type, width, height = processor.process_and_strip_exif(
            image_bytes,
            max_dimension=100,
        )

        with Image.open(io.BytesIO(result)) as processed:
            self.assertEqual(processed.format, "WEBP")
            self.assertEqual(processed.getexif(), {})
            self.assertNotIn("Scrowpoint test camera", str(processed.info))
        self.assertEqual(content_type, "image/webp")
        self.assertEqual((width, height), (50, 100))

    def test_preserves_transparency_in_webp_output(self):
        image = Image.new("RGBA", (16, 12), color=(200, 30, 20, 80))
        image_bytes = make_image_bytes(image, image_format="PNG")

        result, content_type, width, height = processor.process_and_strip_exif(image_bytes)

        with Image.open(io.BytesIO(result)) as processed:
            self.assertEqual(processed.mode, "RGBA")
            self.assertLess(processed.getpixel((0, 0))[3], 255)
        self.assertEqual(content_type, "image/webp")
        self.assertEqual((width, height), (16, 12))

    def test_rejects_empty_and_invalid_image_payloads(self):
        for payload in (b"", b"not an image"):
            with self.subTest(payload=payload):
                with self.assertRaises(processor.ImageProcessingError):
                    processor.process_and_strip_exif(payload)

    def test_rejects_payload_over_configured_size_limit(self):
        with patch.object(processor, "MAX_FILE_SIZE_BYTES", 8):
            with self.assertRaisesRegex(processor.ImageProcessingError, "exceeds maximum"):
                processor.process_and_strip_exif(b"123456789")


if __name__ == "__main__":
    unittest.main()
