import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud } from "lucide-react";

import type { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { UploadQueue } from "@/components/upload/UploadQueue";
import { useUploadFiles } from "@/hooks/files/useUploadFiles";
import type { UploadPresetKey } from "@/lib/upload/acceptPresets";
import { getUploadPreset } from "@/lib/upload/acceptPresets";

export type FileDropzoneVariant = "default" | "compact";

type FileDropzoneProps = {
  presetKey?: UploadPresetKey;
  variant?: FileDropzoneVariant;
  /** When set, finalized uploads attach to this class library. */
  classId?: Id<"classes">;
  className?: string;
};

export function FileDropzone({
  presetKey = "images",
  variant = "default",
  classId,
  className,
}: FileDropzoneProps) {
  const { t } = useTranslation("upload");

  const preset = useMemo(() => getUploadPreset(presetKey), [presetKey]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { items, uploadFiles, abortFile, retryFile } = useUploadFiles(presetKey, { classId });

  const [dragDepth, setDragDepth] = useState(0);
  const isDragging = dragDepth > 0;

  const handleSelectClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      uploadFiles(Array.from(fileList));
    },
    [uploadFiles],
  );

  const label = preset.buttonLabelKey;
  const descriptionKey = preset.descriptionKey;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed bg-background px-4 py-3",
          isDragging && "ring-2 ring-primary/50",
          className,
        )}
        role="button"
        tabIndex={0}
        aria-label={t("selectFilesAria")}
        onClick={handleSelectClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectClick();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragDepth((d) => d + 1);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragDepth((d) => Math.max(0, d - 1))}
        onDrop={(e) => {
          e.preventDefault();
          setDragDepth(0);
          onFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <UploadCloud className="size-5 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{t(label)}</div>
              <EmptyDescription className="text-xs">{t(descriptionKey)}</EmptyDescription>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectClick();
            }}
          >
            {t(label)}
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={preset.accept}
          onChange={(e) => onFiles(e.currentTarget.files)}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Empty
        className={cn(
          "min-h-[320px] cursor-pointer select-none",
          isDragging && "ring-2 ring-primary/50",
          className,
        )}
        role="button"
        tabIndex={0}
        aria-label={t("dragDropAria")}
        onClick={handleSelectClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectClick();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragDepth((d) => d + 1);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragDepth((d) => Math.max(0, d - 1))}
        onDrop={(e) => {
          e.preventDefault();
          setDragDepth(0);
          onFiles(e.dataTransfer.files);
        }}
      >
        <EmptyHeader className="flex flex-col items-center justify-center gap-2">
          <EmptyMedia variant="icon" size="20">
            <UploadCloud className="text-foreground" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t("dragDropTitle")}</EmptyTitle>
          <EmptyDescription className="max-w-xs text-center">{t(descriptionKey)}</EmptyDescription>

          <div className="mt-4">
            <Button variant="default" size="lg" onClick={handleSelectClick}>
              {t(label)}
            </Button>
          </div>
        </EmptyHeader>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={preset.accept}
          onChange={(e) => onFiles(e.currentTarget.files)}
        />
      </Empty>

      {items.length > 0 && (
        <div className="mt-4">
          <UploadQueue items={items} onAbort={abortFile} onRetry={retryFile} />
        </div>
      )}
    </div>
  );
}
