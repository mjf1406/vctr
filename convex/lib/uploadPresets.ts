/**
 * Shared upload preset definitions.
 * No Convex imports — safe to import from `src/` (same pattern as authzModel).
 */

const MB = 1024 * 1024;

export const UPLOAD_PRESET_KEYS = ["images", "documents", "audio"] as const;

export type UploadPresetKey = (typeof UPLOAD_PRESET_KEYS)[number];

export type UploadPresetDefinition = {
  key: UploadPresetKey;
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxSizeBytes: number;
};

export const UPLOAD_PRESET_DEFINITIONS: Record<UploadPresetKey, UploadPresetDefinition> = {
  images: {
    key: "images",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".ico"],
    maxSizeBytes: 10 * MB,
  },
  documents: {
    key: "documents",
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    allowedExtensions: [".pdf", ".doc", ".docx", ".txt"],
    maxSizeBytes: 20 * MB,
  },
  audio: {
    key: "audio",
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/flac",
      "audio/mp4",
      "audio/m4a",
      "audio/aac",
    ],
    allowedExtensions: [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".mp4"],
    maxSizeBytes: 50 * MB,
  },
};

export function isUploadPresetKey(value: string): value is UploadPresetKey {
  return (UPLOAD_PRESET_KEYS as ReadonlyArray<string>).includes(value);
}

export function getUploadPresetDefinition(presetKey: UploadPresetKey): UploadPresetDefinition {
  return UPLOAD_PRESET_DEFINITIONS[presetKey];
}

/**
 * Validate size and MIME against a preset.
 * Returns an error code string when invalid, otherwise null.
 */
export function validateUploadAgainstPreset(
  presetKey: UploadPresetKey,
  opts: { size: number; contentType: string | undefined },
): "invalid_size" | "invalid_type" | null {
  const preset = UPLOAD_PRESET_DEFINITIONS[presetKey];
  if (opts.size > preset.maxSizeBytes) {
    return "invalid_size";
  }
  const contentType = opts.contentType?.toLowerCase().split(";")[0]?.trim();
  if (!contentType || !preset.allowedMimeTypes.includes(contentType)) {
    return "invalid_type";
  }
  return null;
}
