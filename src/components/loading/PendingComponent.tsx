import { Spinner } from "../ui/spinner";

interface PendingComponentProps {
  message?: string;
}

export default function PendingComponent({ message = "Loading..." }: PendingComponentProps) {
  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-1">
        <Spinner className="size-12" />
        {message && <span className="text-muted-foreground text-lg">{message}</span>}
      </div>
    </div>
  );
}
