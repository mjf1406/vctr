import { useTranslation } from "react-i18next";

import { useClassPresenceContext } from "@/components/presence/classPresenceContext";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PresenceState } from "@/hooks/presence/useClassPresence";
import { getDisplayName, getInitials } from "@/lib/user/userDisplay";

const VISIBLE_LIMIT = 5;

function presenceLabel(
  entry: PresenceState,
  unnamedFallback: string,
): { name: string; initials: string } {
  const fields = { _id: entry.userId, name: entry.name };
  return {
    name: getDisplayName(fields, unnamedFallback),
    initials: getInitials(fields),
  };
}

function statusLabel(
  entry: PresenceState,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (entry.online) {
    return t("presenceOnlineNow");
  }
  const diffSec = Math.max(0, Math.floor((Date.now() - entry.lastDisconnected) / 1000));
  if (diffSec < 60) {
    return t("presenceLastSeenJustNow");
  }
  if (diffSec < 3600) {
    return t("presenceLastSeenMinutes", { count: Math.floor(diffSec / 60) });
  }
  if (diffSec < 86400) {
    return t("presenceLastSeenHours", { count: Math.floor(diffSec / 3600) });
  }
  return t("presenceLastSeenDays", { count: Math.floor(diffSec / 86400) });
}

function PresenceAvatar({
  entry,
  unnamedFallback,
  size = "sm",
}: {
  entry: PresenceState;
  unnamedFallback: string;
  size?: "sm" | "default";
}) {
  const { name, initials } = presenceLabel(entry, unnamedFallback);
  return (
    <Avatar size={size} className={entry.online ? undefined : "opacity-60"}>
      {entry.image ? (
        <AvatarImage src={entry.image} alt={name} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

export function ClassPresenceFacepile() {
  const { t } = useTranslation("classes");
  const { presenceState } = useClassPresenceContext();
  const unnamed = t("unnamedMember");

  if (presenceState === undefined) {
    return null;
  }

  const online = presenceState.filter((entry) => entry.online);
  if (online.length === 0) {
    return null;
  }

  const visible = online.slice(0, VISIBLE_LIMIT);
  const hidden = online.slice(VISIBLE_LIMIT);

  return (
    <div
      className="flex shrink-0 items-center"
      role="group"
      aria-label={t("presenceAriaLabel", { count: online.length })}
    >
      <AvatarGroup className="items-center">
        {visible.map((entry) => {
          const { name } = presenceLabel(entry, unnamed);
          return (
            <Tooltip key={entry.userId}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                <PresenceAvatar entry={entry} unnamedFallback={unnamed} />
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-medium">{name}</span>
                <span className="text-background/80"> · {statusLabel(entry, t)}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {hidden.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t("presenceMoreAriaLabel", { count: hidden.length })}
                />
              }
            >
              <AvatarGroupCount>+{hidden.length}</AvatarGroupCount>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("presenceListTitle")}</DropdownMenuLabel>
                {hidden.map((entry) => {
                  const { name } = presenceLabel(entry, unnamed);
                  return (
                    <DropdownMenuItem key={entry.userId} className="gap-2">
                      <PresenceAvatar entry={entry} unnamedFallback={unnamed} size="default" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {statusLabel(entry, t)}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </AvatarGroup>
    </div>
  );
}
