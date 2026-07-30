import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useAction } from "convex/react";
import { useTranslation } from "react-i18next";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { api } from "../../../convex/_generated/api";
import { AsyncButton } from "@/components/ui/async-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "@/components/ui/toast-manager";
import { billingMessageFromError } from "@/lib/billing/errors";

type CheckoutButtonProps = {
  productId: string;
  theme: "dark" | "light";
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

/**
 * App-owned checkout trigger. Unlike `@convex-dev/polar`'s `CheckoutLink`,
 * this always clears pending UI and surfaces errors via toast.
 */
export function CheckoutButton({
  productId,
  theme,
  children,
  className,
  variant = "secondary",
}: CheckoutButtonProps) {
  const { t } = useTranslation("billing");
  const { t: tCommon } = useTranslation("common");
  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink);

  return (
    <AsyncButton
      type="button"
      variant={variant}
      className={className}
      onClick={async () => {
        try {
          PolarEmbedCheckout.init();
          const { url } = await generateCheckoutLink({
            productIds: [productId],
            origin: window.location.origin,
            successUrl: window.location.href,
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
