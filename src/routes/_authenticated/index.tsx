import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/")({
  component: function Index() {
    const { t } = useTranslation("auth");

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("welcomeTitle")}</h1>
      </main>
    );
  },
});
