import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  GraduationCap,
  History,
  LayoutDashboard,
  Mail,
  Settings2,
  Shield,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
import type { ClassDoc } from "@/lib/classes/classes";
import { cn } from "@/lib/utils";

type ClassNavTo =
  | "/class/$classId"
  | "/class/$classId/settings"
  | "/class/$classId/activity"
  | "/class/$classId/teachers"
  | "/class/$classId/assistant-teachers"
  | "/class/$classId/students"
  | "/class/$classId/guardians"
  | "/class/$classId/invitations";

type NavItem = {
  title: string;
  icon: LucideIcon;
  to: ClassNavTo;
};

function pathFor(to: ClassNavTo, classId: string): string {
  switch (to) {
    case "/class/$classId":
      return `/class/${classId}`;
    case "/class/$classId/settings":
      return `/class/${classId}/settings`;
    case "/class/$classId/activity":
      return `/class/${classId}/activity`;
    case "/class/$classId/teachers":
      return `/class/${classId}/teachers`;
    case "/class/$classId/assistant-teachers":
      return `/class/${classId}/assistant-teachers`;
    case "/class/$classId/students":
      return `/class/${classId}/students`;
    case "/class/$classId/guardians":
      return `/class/${classId}/guardians`;
    case "/class/$classId/invitations":
      return `/class/${classId}/invitations`;
  }
}

export function ClassNavMain({ classDoc }: { classDoc: ClassDoc }) {
  const { t } = useTranslation("classes");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isMobile, state, setOpenMobile } = useSidebar();
  const classId = classDoc._id;
  const peopleCollapsed = state === "collapsed" && !isMobile;

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const topItems: Array<NavItem> = [
    {
      title: t("navDashboard"),
      icon: LayoutDashboard,
      to: "/class/$classId",
    },
    {
      title: t("navActivityLog"),
      icon: History,
      to: "/class/$classId/activity",
    },
    {
      title: t("navSettings"),
      icon: Settings2,
      to: "/class/$classId/settings",
    },
  ];

  const peopleItems: Array<NavItem> = [
    {
      title: t("navTeachers"),
      icon: GraduationCap,
      to: "/class/$classId/teachers",
    },
    {
      title: t("navAssistantTeachers"),
      icon: UserRound,
      to: "/class/$classId/assistant-teachers",
    },
    {
      title: t("navStudents"),
      icon: Users,
      to: "/class/$classId/students",
    },
    {
      title: t("navGuardians"),
      icon: Shield,
      to: "/class/$classId/guardians",
    },
    {
      title: t("navInvitations"),
      icon: Mail,
      to: "/class/$classId/invitations",
    },
  ];

  const peopleActive = peopleItems.some((item) => pathname === pathFor(item.to, classId));
  const [peopleOpen, setPeopleOpen] = useState(false);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t("pageTitle")}</SidebarGroupLabel>
        <SidebarMenu>
          {topItems.map((item) => {
            const href = pathFor(item.to, classId);
            const isActive =
              item.to === "/class/$classId"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={<Link to={item.to} params={{ classId }} onClick={closeMobileSidebar} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarMenu>
          {peopleCollapsed ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton tooltip={t("navGroupPeople")} isActive={peopleActive} />
                  }
                >
                  <Users />
                  <span>{t("navGroupPeople")}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  align="start"
                  side="right"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {t("navGroupPeople")}
                    </DropdownMenuLabel>
                    {peopleItems.map((item) => {
                      return (
                        <DropdownMenuItem
                          key={item.to}
                          className="gap-2 p-2"
                          render={
                            <Link to={item.to} params={{ classId }} onClick={closeMobileSidebar} />
                          }
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              open={peopleOpen || peopleActive}
              onOpenChange={setPeopleOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
                  <Users />
                  <span>{t("navGroupPeople")}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto transition-transform group-data-[collapsible=icon]:hidden",
                      (peopleOpen || peopleActive) && "rotate-90",
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {peopleItems.map((item) => {
                      const href = pathFor(item.to, classId);
                      const isActive = pathname === href;
                      return (
                        <SidebarMenuSubItem key={item.to}>
                          <SidebarMenuSubButton
                            isActive={isActive}
                            render={
                              <Link
                                to={item.to}
                                params={{ classId }}
                                onClick={closeMobileSidebar}
                              />
                            }
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
