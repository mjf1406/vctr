import { useTranslation } from "react-i18next";
import { Spinner } from "../ui/spinner";

interface PendingComponentProps {
  message?: string;
}

export default function PendingComponent({ message }: PendingComponentProps) {
  const { t } = useTranslation("common");
  const label = message ?? t("loading");

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-1">
        <Spinner className="size-12" />
        <span className="text-muted-foreground text-lg">{label}</span>
      </div>
    </div>
  );
}
