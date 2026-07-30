import { BanIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { formatCountdownUntil, formatLocalizedDateTime } from "@/i18n/formatDate";
import {
  isPendingJoinCode,
  joinCodeShareUrl,
  formatJoinCodeDisplay,
  remainingUses,
  type JoinCodePublic,
} from "@/lib/invitations/joinCodes";
import type { JoinCodeRole } from "@/lib/permissions/classPermissions";

type JoinCodeCardProps = {
  code: JoinCodePublic;
  classArchived: boolean;
  onRevoke: (code: JoinCodePublic) => void;
};

function roleLabelKey(role: JoinCodeRole): string {
  switch (role) {
    case "teacher":
      return "roleTeacher";
    case "assistant_teacher":
      return "roleAssistantTeacher";
    case "student":
      return "roleStudent";
    case "guardian":
      return "roleGuardian";
  }
}

export function JoinCodeCard({ code, classArchived, onRevoke }: JoinCodeCardProps) {
  const { t } = useTranslation("classes");
  const [now, setNow] = useState(() => Date.now());
  const pending = isPendingJoinCode(code);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const menuItems = useMemo<Array<ActionMenuItem>>(
    () => [
      {
        id: "revoke",
        label: t("revokeInvite"),
        icon: <BanIcon />,
        permission: "invitations:revoke",
        variant: "destructive",
        onSelect: () => onRevoke(code),
      },
    ],
    [code, onRevoke, t],
  );

  const remaining = remainingUses(code);
  const countdown = formatCountdownUntil(code.expiresAt, now);
  const displayCode = formatJoinCodeDisplay(code.code);
  const shareUrl = pending ? "" : joinCodeShareUrl(code.code);

  return (
    <Card size="sm" className={pending ? "opacity-70" : undefined}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-mono text-xl tracking-widest">
              {pending ? t("invitePendingCode") : displayCode}
            </CardTitle>
            {!pending ? (
              <>
                <CopyButton type="text" value={displayCode} aria-label={t("copyInviteCode")} />
                <CopyButton type="link" value={shareUrl} aria-label={t("copyInviteLink")} />
              </>
            ) : null}
          </div>
          <CardDescription>{t(roleLabelKey(code.role))}</CardDescription>
        </div>
        {!pending ? <ActionMenu items={menuItems} label={t("inviteCodeActions")} /> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        {classArchived ? (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary">{t("inviteArchivedBadge")}</Badge>
            <p className="text-muted-foreground">{t("inviteArchivedHint")}</p>
          </div>
        ) : null}
        <p>
          {t("inviteUsesSummary", {
            used: code.useCount,
            max: code.maxUses,
            remaining,
          })}
        </p>
        <p className="text-muted-foreground">
          {t("inviteExpiresAt", { date: formatLocalizedDateTime(code.expiresAt) })}
        </p>
        <p className="text-muted-foreground">{t("inviteTimeLeft", { countdown })}</p>
      </CardContent>
    </Card>
  );
}
