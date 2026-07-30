import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "../theme/theme-toggle";
import { NavUser } from "@/components/navigation/NavUser";
import { Logo } from "@/components/brand/Logo";
import { ConnectionStatus } from "@/components/navigation/ConnectionStatus";

export function Navbar() {
  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
      <div className="relative mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Logo />
        </Link>
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4">
          <Link
            to="/join"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("join")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          <NavUser variant="avatar" />
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
