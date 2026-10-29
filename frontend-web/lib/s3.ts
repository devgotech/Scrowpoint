/**
 * S3 Direct Client Upload Utility for Scrowpoint.
 *
 * Requirements (UI Context Spec 5, §4):
 * - Direct upload architecture: Prevents large media uploads (e.g., 50MB 4K unboxing videos,
 *   KYC passport images, dispute evidence) from overloading the Next.js/frontend application server.
 * - Two-step flow:
 *   1. Requests a presigned S3 PUT URL from the Go core backend (/api/media/presign).
 *   2. Directly streams/PUTs the raw binary file to the presigned S3 URL with the matching Content-Type.
 * - Does NOT use heavy AWS SDK packages; uses native fetch() exclusively.
 * - Robust error handling with descriptive exceptions.
 */

export interface PresignRequestPayload {
  fileName: string;
  fileType: string;
  referenceId: string;
}

export interface PresignResponseData {
  /** The presigned S3 upload URL (or local mock upload endpoint) */
  uploadUrl: string;
  /** The final public / CDN URL where the file can be retrieved */
  fileUrl?: string;
  /** The destination S3 object key (e.g., evidence/disp-123/unboxing.mp4) */
  key?: string;
  s3Key?: string;
  referenceId?: string;
}

export interface UploadResult {
  /** Final URL of the uploaded file */
  fileUrl: string;
  /** The S3 key where the object is stored */
  s3Key: string;
  /** Reference ID associated with this upload (e.g. Dispute ID, KYC Job ID) */
  referenceId: string;
  /** The original file name */
  fileName: string;
  /** The MIME type */
  fileType: string;
  /** File size in bytes */
  size: number;
}

export interface UploadOptions {
  /**
   * Optional custom backend presign endpoint.
   * Defaults to "/api/media/presign".
   */
  presignEndpoint?: string;
  /**
   * Optional AbortSignal to cancel in-flight uploads.
   */
  signal?: AbortSignal;
  /**
   * Optional progress callback reporting (0 to 100).
   */
  onProgress?: (percentage: number) => void;
}

/**
 * Uploads a file directly to AWS S3 using a backend-generated presigned URL.
 *
 * @param file - The HTML5 File object to upload.
 * @param referenceId - Context identifier (e.g. Dispute ID, Listing ID, User KYC ID).
 * @param options - Optional configurations (endpoint, cancellation signal, progress).
 * @returns Promise resolving to an UploadResult containing the fileUrl and s3Key.
 * @throws Error if presign request fails or S3 rejects the PUT payload.
 */
export async function uploadToPresignedUrl(
  file: File,
  referenceId: string,
  options?: UploadOptions
): Promise<UploadResult> {
  if (!file) {
    throw new Error("uploadToPresignedUrl: A valid File object is required.");
  }

  const endpoint = options?.presignEndpoint || "/api/media/presign";
  const fileType = file.type || "application/octet-stream";
  const fileName = file.name;

  // --------------------------------------------------------------------------
  // Step 1: Request presigned S3 URL from Go backend
  // --------------------------------------------------------------------------
  let presignData: PresignResponseData;

  try {
    const presignRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      signal: options?.signal,
      body: JSON.stringify({
        fileName,
        fileType,
        referenceId,
      } satisfies PresignRequestPayload),
    });

    if (!presignRes.ok) {
      const errText = await presignRes.text().catch(() => "");
      let parsedErr = `HTTP ${presignRes.status}: Failed to generate presigned upload URL`;
      try {
        const jsonErr = JSON.parse(errText);
        if (jsonErr.error) parsedErr = jsonErr.error;
        else if (jsonErr.message) parsedErr = jsonErr.message;
      } catch {
        if (errText) parsedErr = errText;
      }
      throw new Error(`Presign Request Failed: ${parsedErr}`);
    }

    const json = await presignRes.json();
    // Support either { data: { uploadUrl, key } } or flat response { uploadUrl, key }
    presignData = (json.data ?? json) as PresignResponseData;

    if (!presignData || !presignData.uploadUrl) {
      throw new Error("Invalid presign response: missing 'uploadUrl' in server response.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Failed to initialize upload: ${String(err)}`);
  }

  // --------------------------------------------------------------------------
  // Step 2: Execute direct PUT request to the S3 Presigned URL
  // --------------------------------------------------------------------------
  try {
    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: file,
      signal: options?.signal,
    });

    if (!uploadRes.ok) {
      const s3ErrorText = await uploadRes.text().catch(() => "");
      throw new Error(
        `S3 Upload Failed [${uploadRes.status} ${uploadRes.statusText}]: ${
          s3ErrorText || "Direct cloud storage rejected the payload."
        }`
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Direct S3 upload failed: ${String(err)}`);
  }

  // --------------------------------------------------------------------------
  // Step 3: Compute final asset coordinates
  // --------------------------------------------------------------------------
  const finalKey =
    presignData.key ||
    presignData.s3Key ||
    `evidence/${referenceId}/${fileName.replace(/\s+/g, "_")}`;

  // If a distinct public fileUrl was provided, prefer it; otherwise strip query params from the uploadUrl
  const finalUrl =
    presignData.fileUrl ||
    (presignData.uploadUrl.includes("?")
      ? presignData.uploadUrl.split("?")[0]
      : presignData.uploadUrl);

  return {
    fileUrl: finalUrl,
    s3Key: finalKey,
    referenceId,
    fileName,
    fileType,
    size: file.size,
  };
}

export default uploadToPresignedUrl;
