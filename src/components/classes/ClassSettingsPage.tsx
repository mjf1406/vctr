import { PencilIcon, Trash2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ClassFormCredenza,
  type ClassFormInitialValues,
} from "@/components/classes/ClassFormCredenza";
import { ClassIconDisplay } from "@/components/classes/ClassIconDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardPocket,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useClass } from "@/hooks/classes/useClass";
import { useClearClassBanner } from "@/hooks/classes/useClearClassBanner";
import { useSetClassBanner } from "@/hooks/classes/useSetClassBanner";
import { useUpdateClass } from "@/hooks/classes/useUpdateClass";
import { useClassFiles } from "@/hooks/files/useClassFiles";
import { useDeleteFile } from "@/hooks/files/useDeleteFile";
import { useFileBytes } from "@/hooks/files/useFileBytes";
import type { ClassFormValues } from "@/lib/classes/classFormSchema";
import type { Id } from "../../../convex/_generated/dataModel";

type ClassSettingsPageProps = {
  classId: Id<"classes">;
};

function formatTimestamp(value: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SettingsSkeleton() {
  return <Skeleton className="h-48 w-full max-w-2xl rounded-2xl" />;
}

function BannerPreview({ fileId }: { fileId: Id<"files"> }) {
  const { t } = useTranslation("classes");
  const { url, isPending, isError } = useFileBytes(fileId);

  if (isPending) {
    return <Skeleton className="aspect-[3/1] w-full rounded-lg" />;
  }
  if (isError || !url) {
    return <p className="text-sm text-muted-foreground">{t("bannerLoadFailed")}</p>;
  }
  return (
    <img
      src={url}
      alt={t("bannerPreviewAlt")}
      className="aspect-[3/1] w-full rounded-lg object-cover"
    />
  );
}

function formatFileSize(bytes: number, language: string): string {
  return new Intl.NumberFormat(language, {
    style: "unit",
    unit: "kilobyte",
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(bytes / 1024);
}

export function ClassSettingsPage({ classId }: ClassSettingsPageProps) {
  const { t, i18n } = useTranslation("classes");
  const { data: classDoc, isPending, isError, refetch, isAuthLoading } = useClass(classId);
  const { data: classFiles = [] } = useClassFiles(classId);
  const updateClass = useUpdateClass();
  const setBanner = useSetClassBanner();
  const clearBanner = useClearClassBanner();
  const deleteFile = useDeleteFile();
  const [editOpen, setEditOpen] = useState(false);

  const documentFiles = classFiles.filter((file) => file.preset === "documents");

  const showSkeleton = (isPending || isAuthLoading) && classDoc == null;

  const formInitialValues: ClassFormInitialValues | undefined = classDoc
    ? {
        name: classDoc.name,
        year: classDoc.year,
        description: classDoc.description,
        icon: classDoc.icon,
      }
    : undefined;

  const handleSubmit = async (values: ClassFormValues) => {
    await updateClass.mutateAsync({
      classId,
      name: values.name,
      year: values.year,
      description: values.description,
      icon: values.icon,
    });
  };

  const handleBannerUploaded = useCallback(
    (fileId: Id<"files">) => {
      setBanner.mutate({ classId, fileId });
    },
    [classId, setBanner],
  );

  const handleClearBanner = () => {
    clearBanner.mutate({ classId });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("navSettings")}</h1>
      </div>

      {showSkeleton ? <SettingsSkeleton /> : null}

      {!showSkeleton && isError ? (
        <ErrorState
          card
          onRetry={async () => {
            await refetch();
          }}
          description={t("loadFailed")}
        />
      ) : null}

      {!showSkeleton && !isError && classDoc ? (
        <>
          <Card className="max-w-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <CardPocket tone="primary" className="shrink-0 p-2">
                  <ClassIconDisplay icon={classDoc.icon} />
                </CardPocket>
                <div className="min-w-0">
                  <CardTitle className="text-lg font-semibold">{classDoc.name}</CardTitle>
                  <CardDescription>{classDoc.year}</CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t("editAction")}
                onClick={() => setEditOpen(true)}
              >
                <PencilIcon aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {classDoc.description?.trim() || t("noDescription")}
              </p>
              <CardPocket tone="secondary" className="flex flex-col gap-0.5 text-xs">
                <span>
                  {t("createdAt", {
                    date: formatTimestamp(classDoc._creationTime, i18n.language),
                  })}
                </span>
                <span>
                  {t("updatedAt", {
                    date: formatTimestamp(classDoc.updatedAt, i18n.language),
                  })}
                </span>
              </CardPocket>
            </CardContent>
          </Card>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t("bannerTitle")}</CardTitle>
              <CardDescription>{t("bannerDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {classDoc.bannerFileId ? (
                <div className="flex flex-col gap-3">
                  <BannerPreview fileId={classDoc.bannerFileId} />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={clearBanner.isPending}
                      onClick={handleClearBanner}
                    >
                      {t("bannerRemove")}
                    </Button>
                  </div>
                </div>
              ) : null}
              <FileDropzone
                title={t("bannerTitle")}
                variant="compact"
                presetKey="images"
                classId={classId}
                multiple={false}
                onUploaded={handleBannerUploaded}
              />
            </CardContent>
          </Card>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t("documentsUploadTitle")}</CardTitle>
              <CardDescription>{t("documentsUploadDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FileDropzone
                title={t("documentsUploadTitle")}
                variant="compact"
                presetKey="documents"
                classId={classId}
                multiple
              />
              {documentFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("documentsUploadEmpty")}</p>
              ) : (
                <ul className="flex flex-col gap-2" aria-label={t("documentsUploadListLabel")}>
                  {documentFiles.map((file) => (
                    <li
                      key={file._id}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size, i18n.language)} · {file.contentType}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("documentsUploadRemove")}
                        disabled={deleteFile.isPending}
                        onClick={() => {
                          deleteFile.mutate({ fileId: file._id, classId });
                        }}
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {classDoc ? (
        <ClassFormCredenza
          key={`edit:${classDoc._id}:${classDoc.updatedAt}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
