import { useMutation } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import { toast } from "@/components/ui/toast-manager";
import { billingMessageFromError } from "@/lib/billing/errors";

export function useCustomerPortal() {
  const { t } = useTranslation("billing");
  const { t: tCommon } = useTranslation("common");
  const generateUrl = useAction(api.billingActions.generateCustomerPortalUrl);

  return useMutation({
    mutationFn: async () => {
      const returnUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const { url } = await generateUrl({ returnUrl });
      window.open(url, "_blank", "noopener,noreferrer");
      return url;
    },
    onError: (error: unknown) => {
      toast.add({
        type: "error",
        title: billingMessageFromError(error, t, t("portalFailed"), tCommon("rateLimited")),
      });
    },
  });
}
