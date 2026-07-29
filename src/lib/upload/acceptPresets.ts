export type UploadPresetKey = "images" | "documents" | "audio" | "any";

export type UploadPreset = {
  key: UploadPresetKey;
  accept: string;
  allowedExtensions: readonly string[];
  maxSizeBytes: number;
  descriptionKey: string;
  buttonLabelKey: string;
};

const MB = 1024 * 1024;

export const UPLOAD_PRESETS: Record<UploadPresetKey, UploadPreset> = {
  images: {
    key: "images",
    accept: "image/jpeg,image/png,image/webp,image/avif,image/x-icon,image/vnd.microsoft.icon",
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".ico"],
    maxSizeBytes: 10 * MB,
    descriptionKey: "supportsImages",
    buttonLabelKey: "selectImages",
  },
  documents: {
    key: "documents",
    accept:
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
    allowedExtensions: [".pdf", ".doc", ".docx", ".txt"],
    maxSizeBytes: 20 * MB,
    descriptionKey: "supportsDocuments",
    buttonLabelKey: "selectDocuments",
  },
  audio: {
    key: "audio",
    // Common audio types (HTML accept attribute accepts both mime types and vendor variants).
    accept:
      "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/flac,audio/mp4,audio/m4a,audio/aac",
    allowedExtensions: [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".mp4"],
    maxSizeBytes: 50 * MB,
    descriptionKey: "supportsAudio",
    buttonLabelKey: "selectAudio",
  },
  any: {
    key: "any",
    accept: "*/*",
    allowedExtensions: [],
    maxSizeBytes: 20 * MB,
    descriptionKey: "supportsAny",
    buttonLabelKey: "selectFiles",
  },
};

export function getUploadPreset(presetKey: UploadPresetKey): UploadPreset {
  return UPLOAD_PRESETS[presetKey];
}
