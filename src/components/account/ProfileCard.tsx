import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadQueue } from "@/components/upload/UploadQueue";
import { useClearAvatar } from "@/hooks/user/useClearAvatar";
import { useUpdateAvatar } from "@/hooks/user/useUpdateAvatar";
import { useUpdateDisplayName } from "@/hooks/user/useUpdateDisplayName";
import { useUploadFiles } from "@/hooks/files/useUploadFiles";
import { isSelfHosted } from "@/lib/selfHosted";
import { getUploadPreset } from "@/lib/upload/acceptPresets";
import { getDisplayName, getInitials } from "@/lib/user/userDisplay";
import { splitFullName } from "@/lib/user/userName";
import { sanitizeAvatarUrl } from "../../../convex/lib/avatarUrl";

type ProfileUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatarFileId?: Id<"files"> | null;
};

type ProfileCardProps = {
  user: ProfileUser | null | undefined;
  isPending: boolean;
};

export function ProfileCard({ user, isPending }: ProfileCardProps) {
  const { t } = useTranslation("account");
  const editable = isSelfHosted();
  const updateName = useUpdateDisplayName();
  const updateAvatar = useUpdateAvatar();
  const clearAvatar = useClearAvatar();
  const { items, uploadFiles, abortFile, retryFile, isUploading } = useUploadFiles("images");
  const imagePreset = getUploadPreset("images");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const notifiedUploadsRef = useRef(new Set<string>());

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const parts = splitFullName(user.name);
    setFirstName(parts.firstName);
    setLastName(parts.lastName);
  }, [user]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    for (const item of items) {
      if (item.status !== "done" || item.fileId === undefined) continue;
      if (notifiedUploadsRef.current.has(item.id)) continue;
      notifiedUploadsRef.current.add(item.id);
      void updateAvatar.mutateAsync({ fileId: item.fileId }).then(() => {
        setLocalPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      });
    }
  }, [items, updateAvatar]);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const remoteImage = sanitizeAvatarUrl(user.image);
  const displayImage = localPreviewUrl ?? remoteImage;
  const isSavingName = updateName.isPending;
  const isAvatarBusy = isUploading || updateAvatar.isPending || clearAvatar.isPending;
  const hasCustomAvatar = user.avatarFileId != null || localPreviewUrl != null;

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    const nextErrors: { firstName?: string; lastName?: string } = {};
    if (!first) nextErrors.firstName = t("nameRequired");
    if (!last) nextErrors.lastName = t("nameRequired");
    setFieldErrors(nextErrors);
    if (nextErrors.firstName || nextErrors.lastName) return;

    void updateName.mutateAsync({ firstName: first, lastName: last });
  };

  const handleAvatarSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    uploadFiles([file]);
  };

  const handleClearAvatar = () => {
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    void clearAvatar.mutateAsync({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>
          {editable ? t("profileDescriptionEditable") : t("profileDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <Avatar className="size-14">
            {displayImage ? (
              <AvatarImage src={displayImage} alt={displayName} referrerPolicy="no-referrer" />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {editable ? (
            <div className="flex flex-col items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={imagePreset.accept}
                onChange={(e) => {
                  handleAvatarSelected(e.currentTarget.files);
                  e.currentTarget.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAvatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                {isAvatarBusy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {t("changeAvatar")}
              </Button>
              {hasCustomAvatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isAvatarBusy}
                  onClick={handleClearAvatar}
                >
                  {t("removeAvatar")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {editable ? (
          <form onSubmit={handleSave} className="flex min-w-0 flex-1 flex-col gap-4">
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={fieldErrors.firstName ? true : undefined}>
                  <FieldLabel htmlFor="profile-first-name">{t("firstNameLabel")}</FieldLabel>
                  <Input
                    id="profile-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSavingName}
                    aria-invalid={fieldErrors.firstName ? true : undefined}
                    placeholder={t("firstNamePlaceholder")}
                  />
                  {fieldErrors.firstName ? <FieldError>{fieldErrors.firstName}</FieldError> : null}
                </Field>
                <Field data-invalid={fieldErrors.lastName ? true : undefined}>
                  <FieldLabel htmlFor="profile-last-name">{t("lastNameLabel")}</FieldLabel>
                  <Input
                    id="profile-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSavingName}
                    aria-invalid={fieldErrors.lastName ? true : undefined}
                    placeholder={t("lastNamePlaceholder")}
                  />
                  {fieldErrors.lastName ? <FieldError>{fieldErrors.lastName}</FieldError> : null}
                </Field>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{t("emailLabel")}</span>
                <span className="truncate text-sm text-muted-foreground">
                  {user.email?.trim() || t("emailUnknown")}
                </span>
              </div>
            </FieldGroup>
            {items.length > 0 ? (
              <UploadQueue items={items} onAbort={abortFile} onRetry={retryFile} />
            ) : null}
            <div>
              <Button type="submit" size="sm" disabled={isSavingName}>
                {isSavingName ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {t("saveProfile")}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{t("nameLabel")}</dt>
              <dd className="truncate text-sm font-medium">{displayName}</dd>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{t("emailLabel")}</dt>
              <dd className="truncate text-sm text-muted-foreground">
                {user.email?.trim() || t("emailUnknown")}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
