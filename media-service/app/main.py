"""
Buyer's High Media Microservice
FastAPI entry point for secure image compression, EXIF metadata stripping,
and secure object storage upload across listings, KYC documents, and dispute evidence.
"""

from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .processor import (
    process_and_strip_exif,
    ImageProcessingError,
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE_BYTES
)
from .storage import StorageService

app = FastAPI(
    title="Buyer's High Media Microservice",
    description="Sanitizes, compresses, strips EXIF privacy data, and hosts gadget photos, KYC documents, and dispute evidence.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = StorageService()


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class MediaUploadResponse(BaseModel):
    mediaUrl: str = Field(..., description="Public CDN URL of the sanitized media file")
    mediaType: str = Field(..., description="Category partition: listing_media, kyc_document, or dispute_evidence")
    originalFilename: str = Field(..., description="Original client-supplied filename")
    sanitized: bool = Field(True, description="True when EXIF and private metadata were purged")
    sizeBytes: int = Field(..., description="Final optimized file size in bytes")
    sha256Checksum: str = Field(..., description="SHA-256 cryptographic hash of the saved asset")
    width: int = Field(..., description="Pixel width of optimized image")
    height: int = Field(..., description="Pixel height of optimized image")


class BatchUploadResponse(BaseModel):
    totalUploaded: int
    items: List[MediaUploadResponse]


# ============================================================================
# HEALTH & READINESS PROBES
# ============================================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "buyers_high_media_microservice",
        "version": "1.0.0",
        "storageBackend": storage.backend,
        "maxFileSizeBytes": MAX_FILE_SIZE_BYTES,
        "allowedMimeTypes": sorted(list(ALLOWED_IMAGE_TYPES))
    }


# ============================================================================
# REUSABLE SANITIZATION & PERSISTENCE HELPER
# ============================================================================

async def _process_and_store(
    file: UploadFile,
    folder: str,
    max_dimension: int,
    media_type_label: str
) -> MediaUploadResponse:
    # 1. MIME type validation
    if file.content_type and file.content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media type '{file.content_type}'. Allowed: {sorted(list(ALLOWED_IMAGE_TYPES))}"
        )

    # 2. Read bytes into memory
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed upload size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # 3. Process, normalize orientation, and strip EXIF
    try:
        sanitized_bytes, _, width, height = process_and_strip_exif(
            content,
            max_dimension=max_dimension,
            output_format="WEBP"
        )
    except ImageProcessingError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        )

    # 4. Store in segregated storage
    record = storage.store_file(
        file_bytes=sanitized_bytes,
        folder=folder,
        extension="webp"
    )

    return MediaUploadResponse(
        mediaUrl=record["mediaUrl"],
        mediaType=media_type_label,
        originalFilename=file.filename or "uploaded_media.jpg",
        sanitized=True,
        sizeBytes=record["sizeBytes"],
        sha256Checksum=record["sha256Checksum"],
        width=width,
        height=height
    )


# ============================================================================
# MEDIA UPLOAD ENDPOINTS
# ============================================================================

@app.post(
    "/upload/listing-media",
    response_model=MediaUploadResponse,
    summary="Upload and sanitize gadget listing photo"
)
@app.post(
    "/upload/gadget-photo",
    response_model=MediaUploadResponse,
    include_in_schema=False
)
async def upload_listing_media(file: UploadFile = File(...)):
    """
    Sanitizes gadget listing photo, removes EXIF location data,
    resizes to max 2048px, converts to WebP, and returns public CDN URL.
    """
    return await _process_and_store(
        file=file,
        folder="listing_media",
        max_dimension=2048,
        media_type_label="listing_media"
    )


@app.post(
    "/upload/id-document",
    response_model=MediaUploadResponse,
    summary="Upload and archive KYC government ID / biometric selfie"
)
@app.post(
    "/upload/kyc-doc",
    response_model=MediaUploadResponse,
    include_in_schema=False
)
async def upload_id_document(file: UploadFile = File(...)):
    """
    Processes sensitive government ID document or biometric selfie.
    Strips EXIF, compresses, and archives in segregated encrypted vault partition.
    """
    return await _process_and_store(
        file=file,
        folder="kyc_vault",
        max_dimension=1920,
        media_type_label="kyc_document"
    )


@app.post(
    "/upload/dispute-evidence",
    response_model=MediaUploadResponse,
    summary="Upload diagnostic or physical proof for dispute resolution"
)
async def upload_dispute_evidence(file: UploadFile = File(...)):
    """
    Uploads buyer diagnostic proof (e.g. battery health, IMEI, display faults)
    or seller packaging/serial proof. Strips EXIF and returns immutable evidence URL.
    """
    return await _process_and_store(
        file=file,
        folder="dispute_evidence",
        max_dimension=2048,
        media_type_label="dispute_evidence"
    )


@app.post(
    "/upload/batch",
    response_model=BatchUploadResponse,
    summary="Batch upload multiple media items (e.g. gadget listing photo gallery)"
)
async def upload_batch(files: List[UploadFile] = File(...)):
    """
    Batch upload up to 8 photos at once for a listing draft.
    Returns array of processed and sanitized media records.
    """
    if len(files) > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 8 media items can be uploaded in a single batch."
        )

    results: List[MediaUploadResponse] = []
    for f in files:
        res = await _process_and_store(
            file=f,
            folder="listing_media",
            max_dimension=2048,
            media_type_label="listing_media"
        )
        results.append(res)

    return BatchUploadResponse(
        totalUploaded=len(results),
        items=results
    )
