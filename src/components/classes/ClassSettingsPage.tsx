import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ClassFormCredenza,
  type ClassFormInitialValues,
} from "@/components/classes/ClassFormCredenza";
import { ClassIconDisplay } from "@/components/classes/ClassIconDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useClass } from "@/hooks/classes/useClass";
import { useUpdateClass } from "@/hooks/classes/useUpdateClass";
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

export function ClassSettingsPage({ classId }: ClassSettingsPageProps) {
  const { t, i18n } = useTranslation("classes");
  const { data: classDoc, isPending, isError, refetch, isAuthLoading } = useClass(classId);
  const updateClass = useUpdateClass();
  const [editOpen, setEditOpen] = useState(false);

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
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <ClassIconDisplay icon={classDoc.icon} />
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
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
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
            </div>
          </CardContent>
        </Card>
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
