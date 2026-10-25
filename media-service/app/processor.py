"""
Scrowpoint Image Processing Microservice Component
Handles image optimization, resolution downscaling, and total EXIF metadata stripping
to preserve buyer and seller privacy (removes GPS coordinates, device serials, camera models).
"""

import io
from typing import Tuple, Optional
from PIL import Image, ImageOps

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}

# 15 MB max file upload size limit
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024

# Default target dimensions and compression quality
DEFAULT_MAX_DIMENSION = 2048
COMPRESSION_QUALITY = 82


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
            f"Image exceeds maximum allowable size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
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
            # Using frombytes + tobytes is fast, memory-safe, and guaranteed zero metadata leakage
            clean_image = Image.frombytes(img.mode, img.size, img.tobytes())

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
