/**
 * S3 Direct Client Upload Utility for Scrowpoint.
 *
 * Requirements (UI Context Spec 5, §4):
 * - Direct upload architecture: Prevents large media uploads (e.g., 50MB 4K unboxing videos,
 *   KYC passport images, dispute evidence) from overloading the Next.js/frontend application server.
 * - Three-step flow:
 *   1. Requests a presigned S3 PUT URL from the Go core backend (/api/media/presign).
 *   2. Streams the file directly to private storage with transfer progress.
 *   3. Asks the backend to verify the stored object's size and content type.
 * - Does NOT use heavy AWS SDK packages; uses native fetch() exclusively.
 * - Robust error handling with descriptive exceptions.
 */

export interface PresignRequestPayload {
  fileType: string;
  fileSize: number;
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
  fileUrl?: string;
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

interface CompleteResponseData {
  fileUrl?: string;
  key: string;
  sizeBytes: number;
}

function uploadWithProgress(
  url: string,
  file: File,
  signal?: AbortSignal,
  onProgress?: (percentage: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();

    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      signal?.removeEventListener("abort", abort);
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `Storage upload failed [${request.status}]: ${
              request.responseText || request.statusText
            }`
          )
        );
      }
    };
    request.onerror = () => {
      signal?.removeEventListener("abort", abort);
      reject(new Error("Network error while uploading to storage."));
    };
    request.onabort = () => {
      signal?.removeEventListener("abort", abort);
      reject(new DOMException("Upload cancelled.", "AbortError"));
    };
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    request.send(file);
  });
}

/**
 * Uploads a file directly to S3-compatible private storage using a backend-generated URL.
 *
 * @param file - The HTML5 File object to upload.
 * @param referenceId - Context identifier (e.g. Dispute ID, Listing ID, User KYC ID).
 * @param options - Optional configurations (endpoint, cancellation signal, progress).
 * @returns Promise resolving to an UploadResult containing the fileUrl and s3Key.
 * @throws Error if authorization, upload, or object verification fails.
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
  const token =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("sp_auth_token") ||
        localStorage.getItem("sp_access_token") ||
        localStorage.getItem("bh_access_token");

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
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      signal: options?.signal,
      body: JSON.stringify({
        fileType,
        fileSize: file.size,
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
  // Step 2: Stream the original file directly to storage and report progress.
  // --------------------------------------------------------------------------
  try {
    await uploadWithProgress(
      presignData.uploadUrl,
      file,
      options?.signal,
      options?.onProgress
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Direct S3 upload failed: ${String(err)}`);
  }

  // --------------------------------------------------------------------------
  const completeRes = await fetch("/api/media/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal: options?.signal,
    body: JSON.stringify({
      key: presignData.key || presignData.s3Key,
      fileType,
    }),
  });
  if (!completeRes.ok) {
    const message = await completeRes.text().catch(() => "");
    throw new Error(
      `Upload verification failed [${completeRes.status}]: ${
        message || completeRes.statusText
      }`
    );
  }
  const completePayload = await completeRes.json();
  const completed = (completePayload.data ?? completePayload) as CompleteResponseData;

  // Step 3: Compute final asset coordinates
  // --------------------------------------------------------------------------
  const finalKey = completed.key || presignData.key || presignData.s3Key;
  if (!finalKey) {
    throw new Error("Upload verification returned no storage key.");
  }

  return {
    ...(completed.fileUrl || presignData.fileUrl
      ? { fileUrl: completed.fileUrl || presignData.fileUrl }
      : {}),
    s3Key: finalKey,
    referenceId,
    fileName,
    fileType,
    size: completed.sizeBytes,
  };
}

export default uploadToPresignedUrl;
