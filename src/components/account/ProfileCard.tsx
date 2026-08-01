import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateDisplayName } from "@/hooks/user/useUpdateDisplayName";
import { isSelfHosted } from "@/lib/selfHosted";
import { getDisplayName, getInitials } from "@/lib/user/userDisplay";
import { splitFullName } from "@/lib/user/userName";
import { sanitizeAvatarUrl } from "../../../convex/lib/avatarUrl";

type ProfileUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type ProfileCardProps = {
  user: ProfileUser | null | undefined;
  isPending: boolean;
};

export function ProfileCard({ user, isPending }: ProfileCardProps) {
  const { t } = useTranslation("account");
  const editable = isSelfHosted();
  const updateName = useUpdateDisplayName();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  useEffect(() => {
    if (!user) return;
    const parts = splitFullName(user.name);
    setFirstName(parts.firstName);
    setLastName(parts.lastName);
  }, [user]);

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
  const safeImage = sanitizeAvatarUrl(user.image);
  const isSaving = updateName.isPending;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>
          {editable ? t("profileDescriptionEditable") : t("profileDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-14 shrink-0">
          {safeImage ? (
            <AvatarImage src={safeImage} alt={displayName} referrerPolicy="no-referrer" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
            <div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
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
