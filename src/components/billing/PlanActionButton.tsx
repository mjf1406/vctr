import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useAction } from "convex/react";
import { useTranslation } from "react-i18next";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { api } from "../../../convex/_generated/api";
import { AsyncButton } from "@/components/ui/async-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "@/components/ui/toast-manager";
import { useChangeSubscription } from "@/hooks/billing/useChangeSubscription";
import { billingMessageFromError } from "@/lib/billing/errors";

type PlanActionButtonProps = {
  productId: string;
  theme: "dark" | "light";
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  /** When true, switches the existing subscription instead of opening checkout. */
  changeExisting?: boolean;
};

/**
 * Checkout for new subscribers, or in-place plan change when already subscribed.
 */
export function PlanActionButton({
  productId,
  theme,
  children,
  className,
  variant = "secondary",
  changeExisting = false,
}: PlanActionButtonProps) {
  const { t } = useTranslation("billing");
  const { t: tCommon } = useTranslation("common");
  const generateCheckoutLink = useAction(api.billingActions.createCheckoutLink);
  const changeSubscription = useChangeSubscription();

  return (
    <AsyncButton
      type="button"
      variant={variant}
      className={className}
      pending={changeExisting ? changeSubscription.isPending : undefined}
      onClick={async () => {
        if (changeExisting) {
          await changeSubscription.mutateAsync({ productId });
          return;
        }

        try {
          PolarEmbedCheckout.init();
          const { url } = await generateCheckoutLink({
            productId,
          });
          await PolarEmbedCheckout.create(url, { theme });
        } catch (error) {
          toast.add({
            type: "error",
            title: billingMessageFromError(error, t, t("checkoutFailed"), tCommon("rateLimited")),
          });
          throw error;
        }
      }}
    >
      {children}
    </AsyncButton>
  );
}
