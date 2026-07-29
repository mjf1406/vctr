import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ClassIconDisplay } from "@/components/classes/ClassIconDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { ClassViewMode } from "@/lib/classes/classSort";
import { cn } from "@/lib/utils";

type ClassDoc = Doc<"classes">;

type ClassCardProps = {
  classDoc: ClassDoc;
  viewMode: ClassViewMode;
  onEdit: (classDoc: ClassDoc) => void;
  onArchiveToggle: (classDoc: ClassDoc) => void;
  onDelete: (classDoc: ClassDoc) => void;
};

function formatTimestamp(value: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ClassCard({
  classDoc,
  viewMode,
  onEdit,
  onArchiveToggle,
  onDelete,
}: ClassCardProps) {
  const { t, i18n } = useTranslation("classes");
  const isArchived = classDoc.archivedAt !== undefined;
  const description = classDoc.description?.trim() || t("noDescription");

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("classActions")} />
        }
      >
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onEdit(classDoc)}>
            <PencilIcon />
            {t("editAction")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchiveToggle(classDoc)}>
            {isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
            {isArchived ? t("restoreAction") : t("archiveAction")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(classDoc)}>
            <Trash2Icon />
            {t("deleteAction")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10",
          isArchived && "opacity-80",
        )}
      >
        <ClassIconDisplay icon={classDoc.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate font-medium text-foreground">{classDoc.name}</p>
            <span className="text-sm text-muted-foreground">{classDoc.year}</span>
          </div>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>
        {menu}
      </div>
    );
  }

  return (
    <Card size="sm" className={cn(isArchived && "opacity-80")}>
      <CardHeader className="flex flex-row items-start gap-3">
        <ClassIconDisplay icon={classDoc.icon} />
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base font-semibold">{classDoc.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{classDoc.year}</p>
        </div>
        <div className="shrink-0">{menu}</div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <CardDescription className="line-clamp-3">{description}</CardDescription>
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
  );
}
