import { ArchiveIcon, LayoutGridIcon, ListIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ClassSortDirection, ClassSortKey, ClassViewMode } from "@/lib/classes/classSort";

type ClassesToolbarProps = {
  sortKey: ClassSortKey;
  sortDirection: ClassSortDirection;
  viewMode: ClassViewMode;
  showArchived: boolean;
  searchQuery: string;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onSortChange: (key: ClassSortKey) => void;
  onViewModeChange: (mode: ClassViewMode) => void;
  onToggleArchived: () => void;
  onCreate: () => void;
};

function sortLabel(
  key: ClassSortKey,
  activeKey: ClassSortKey,
  direction: ClassSortDirection,
  labels: Record<ClassSortKey, string>,
): string {
  const base = labels[key];
  if (key !== activeKey) return base;
  // Name: ↓ = A–Z (asc), ↑ = Z–A (desc). Dates keep ↑ = asc / ↓ = desc.
  if (key === "name") {
    return `${base} ${direction === "asc" ? "↓" : "↑"}`;
  }
  return `${base} ${direction === "asc" ? "↑" : "↓"}`;
}

export function ClassesToolbar({
  sortKey,
  sortDirection,
  viewMode,
  showArchived,
  searchQuery,
  resultCount,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onToggleArchived,
  onCreate,
}: ClassesToolbarProps) {
  const { t } = useTranslation("classes");
  const labels: Record<ClassSortKey, string> = {
    name: t("sortName"),
    created: t("sortCreated"),
    updated: t("sortUpdated"),
  };

  const viewToggle = (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[viewMode]}
      onValueChange={(values) => {
        const next = values[0] as ClassViewMode | undefined;
        if (next) onViewModeChange(next);
      }}
    >
      <ToggleGroupItem value="grid" aria-label={t("viewGrid")}>
        <LayoutGridIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label={t("viewList")}>
        <ListIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );

  const archiveButton = (className?: string) => (
    <Button
      type="button"
      variant={showArchived ? "secondary" : "outline"}
      size="sm"
      className={className}
      onClick={onToggleArchived}
    >
      <ArchiveIcon data-icon="inline-start" />
      {showArchived ? t("hideArchived") : t("showArchived")}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("pageTitle")}</h1>
          <p className="hidden text-muted-foreground sm:block">{t("pageDescription")}</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button type="button" onClick={onCreate}>
            <PlusIcon data-icon="inline-start" />
            {t("createClass")}
          </Button>
          {viewToggle}
          {archiveButton()}
        </div>
      </div>

      <InputGroup className="max-w-md">
        <InputGroupInput
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          autoComplete="off"
          spellCheck={false}
        />
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText>{t("searchResults", { count: resultCount })}</InputGroupText>
          {searchQuery ? (
            <InputGroupButton
              size="icon-xs"
              aria-label={t("searchClear")}
              onClick={() => onSearchChange("")}
            >
              <XIcon />
            </InputGroupButton>
          ) : null}
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[sortKey]}
          onValueChange={(values) => {
            const next = values[0] as ClassSortKey | undefined;
            onSortChange(next ?? sortKey);
          }}
          className="flex-wrap"
        >
          {(["name", "created", "updated"] as const).map((key) => (
            <ToggleGroupItem key={key} value={key} className="px-3">
              {sortLabel(key, sortKey, sortDirection, labels)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="ms-auto sm:hidden">{viewToggle}</div>
      </div>

      <div className="flex flex-col gap-2 sm:hidden">
        <Button type="button" className="w-full" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          {t("createClass")}
        </Button>
        {archiveButton("w-full")}
      </div>
    </div>
  );
}
