import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/_class/class/$classId/students")({
  component: function ClassStudentsPage() {
    const { t } = useTranslation("classes");

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("navStudents")}</h1>
        <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
      </div>
    );
  },
});
