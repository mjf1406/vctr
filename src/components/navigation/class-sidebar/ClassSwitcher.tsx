import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ClassFormCredenza } from "@/components/classes/ClassFormCredenza";
import { useCreateClass } from "@/hooks/classes/useCreateClass";
import { useActiveClasses } from "@/hooks/classes/useClasses";
import type { ClassDoc } from "@/lib/classes/classes";
import type { ClassFormValues } from "@/lib/classes/classFormSchema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";

type ClassSwitcherProps = {
  currentClass: ClassDoc;
};

export function ClassSwitcher({ currentClass }: ClassSwitcherProps) {
  const { t } = useTranslation("classes");
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const { data: classes = [] } = useActiveClasses();
  const createClass = useCreateClass();
  const [createOpen, setCreateOpen] = useState(false);

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleCreate = async (values: ClassFormValues) => {
    const created = await createClass.mutateAsync({
      name: values.name,
      year: values.year,
      description: values.description,
      icon: values.icon,
    });
    closeMobileSidebar();
    void navigate({
      to: "/class/$classId",
      params: { classId: created._id },
    });
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                {currentClass.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentClass.name}</span>
                <span className="truncate text-xs text-muted-foreground">{currentClass.year}</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("switchClasses")}
                </DropdownMenuLabel>
                {classes.map((classDoc) => (
                  <DropdownMenuItem
                    key={classDoc._id}
                    className="gap-2 p-2"
                    onClick={() => {
                      closeMobileSidebar();
                      void navigate({
                        to: "/class/$classId",
                        params: { classId: classDoc._id },
                      });
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border text-xs font-medium">
                      {classDoc.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="truncate">{classDoc.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onClick={() => setCreateOpen(true)}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t("addClass")}</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ClassFormCredenza
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
      />
    </>
  );
}
