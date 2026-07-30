import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DeleteAccountCredenza } from "@/components/account/DeleteAccountCredenza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountDeletionBlockers } from "@/hooks/user/useAccountDeletionBlockers";
import { useDeleteAccount } from "@/hooks/user/useDeleteAccount";
import { useClasses } from "@/hooks/classes/useClasses";

type DangerZoneCardProps = {
  userId: string | undefined;
  email: string | null | undefined;
};

export function DangerZoneCard({ userId, email }: DangerZoneCardProps) {
  const { t } = useTranslation("account");
  const [open, setOpen] = useState(false);
  const deleteAccount = useDeleteAccount();
  const {
    data: blockers,
    isPending: blockersPending,
    isError: blockersError,
  } = useAccountDeletionBlockers();
  const { data: classes } = useClasses();

  const ownedClassCount = useMemo(() => {
    if (!userId || !classes) return 0;
    return classes.filter((classDoc) => classDoc.ownerId === userId).length;
  }, [classes, userId]);

  const blocked = (blockers?.length ?? 0) > 0;
  const ownsClasses = blockers?.includes("owns_classes") ?? false;
  const hasSubscription = blockers?.includes("active_subscription") ?? false;

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerTitle")}</CardTitle>
          <CardDescription>{t("dangerDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {blockersPending ? (
            <Skeleton className="h-16 w-full" />
          ) : blockersError ? (
            <p className="text-sm text-muted-foreground">{t("blockersLoadFailed")}</p>
          ) : blocked ? (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("deleteBlockedTitle")}</p>
              <ul className="list-disc pl-5">
                {ownsClasses ? (
                  <li>
                    {ownedClassCount > 0
                      ? t("deleteBlockedOwnsClassesCount", { count: ownedClassCount })
                      : t("deleteBlockedOwnsClasses")}{" "}
                    <Link to="/" className="underline underline-offset-2">
                      {t("deleteBlockedManageClasses")}
                    </Link>
                  </li>
                ) : null}
                {hasSubscription ? (
                  <li>
                    {t("deleteBlockedActiveSubscription")}{" "}
                    <Link to="/billing" className="underline underline-offset-2">
                      {t("manageBilling")}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("deleteReadyBody")}</p>
          )}

          <Button
            type="button"
            variant="destructive"
            className="w-full justify-center bg-destructive text-white hover:bg-destructive/90 sm:w-auto dark:bg-destructive dark:hover:bg-destructive/90"
            disabled={blockersPending || blocked || deleteAccount.isPending}
            onClick={() => setOpen(true)}
          >
            {t("deleteAccount")}
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountCredenza
        open={open}
        onOpenChange={setOpen}
        email={email}
        onConfirm={async (confirmation) => {
          await deleteAccount.mutateAsync({ confirmation });
        }}
      />
    </>
  );
}
