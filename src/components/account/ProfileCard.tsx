import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayName, getInitials } from "@/lib/user/userDisplay";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profileTitle")}</CardTitle>
        <CardDescription>{t("profileDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-14">
          {safeImage ? (
            <AvatarImage src={safeImage} alt={displayName} referrerPolicy="no-referrer" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
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
      </CardContent>
    </Card>
  );
}
