"""
Buyer's High Image Processing Microservice Component
Handles image optimization, resolution downscaling, and total EXIF metadata stripping
to preserve buyer and seller privacy (removes GPS coordinates, device serials, camera models).
Supports dynamic configuration via environment variables for testing and production.
"""

import io
import os
from typing import Tuple
from PIL import Image, ImageOps

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}

# Image Processing Limits loaded dynamically from environment
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "15"))
MAX_FILE_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
DEFAULT_MAX_DIMENSION = int(os.getenv("MAX_IMAGE_DIMENSION_PX", "2048"))
COMPRESSION_QUALITY = int(os.getenv("COMPRESSION_QUALITY", "85"))
STRIP_EXIF_ENABLED = os.getenv("STRIP_EXIF", "true").lower() in ("true", "1", "yes")


class ImageProcessingError(Exception):
    """Raised when an uploaded file cannot be parsed or sanitized as a valid image."""
    pass


def process_and_strip_exif(
    image_bytes: bytes,
    max_dimension: int = DEFAULT_MAX_DIMENSION,
    quality: int = COMPRESSION_QUALITY,
    output_format: str = "WEBP"
) -> Tuple[bytes, str, int, int]:
    """
    Strips all EXIF, XMP, and device metadata from input image bytes.
    Normalizes orientation, converts color mode to RGB/RGBA, proportionally
    downscales to max_dimension, and outputs optimized WebP bytes.

    Returns:
        Tuple of (sanitized_bytes, content_type, width, height)
    """
    if not image_bytes:
        raise ImageProcessingError("Uploaded image payload is empty.")

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise ImageProcessingError(
            f"Image exceeds maximum allowable size of {MAX_UPLOAD_SIZE_MB}MB."
        )

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # 1. Normalize orientation based on EXIF before stripping metadata
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                # If EXIF orientation tag is corrupt or absent, continue gracefully
                pass

            # 2. Determine target color profile (RGB for opaque, RGBA for alpha channel)
            has_alpha = (
                img.mode in ("RGBA", "LA")
                or (img.mode == "P" and "transparency" in img.info)
            )
            target_mode = "RGBA" if has_alpha else "RGB"

            if img.mode != target_mode:
                img = img.convert(target_mode)

            # 3. Create a brand-new in-memory image container without metadata dictionaries
            # If STRIP_EXIF is enabled, using frombytes + tobytes completely purges EXIF, GPS, and serials
            if STRIP_EXIF_ENABLED:
                clean_image = Image.frombytes(img.mode, img.size, img.tobytes())
            else:
                clean_image = img.copy()

            # 4. Proportional downscaling if width or height exceeds maximum allowed bound
            width, height = clean_image.size
            if width > max_dimension or height > max_dimension:
                clean_image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                width, height = clean_image.size

            # 5. Compress and output WebP format
            output_buffer = io.BytesIO()
            clean_image.save(
                output_buffer,
                format=output_format,
                quality=quality,
                optimize=True,
                method=6
            )

            processed_bytes = output_buffer.getvalue()
            content_type = f"image/{output_format.lower()}"
            return processed_bytes, content_type, width, height

    except Exception as e:
        raise ImageProcessingError(f"Failed to process and sanitize image: {str(e)}") from e
