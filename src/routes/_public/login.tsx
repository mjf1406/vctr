import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { LogoBig } from "@/components/brand/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SignInWithGoogle } from "@/components/auth/SignInWithGoogle";
import { SignInWithPasswordLazy } from "@/components/auth/SignInWithPasswordLazy";
import { APP_CONFIG } from "@/config/app";
import { isPasswordAuthEnabled } from "@/lib/auth/authPassword";
import { getSafeAuthRedirect } from "@/lib/auth/authRedirect";
import PendingComponent from "@/components/loading/PendingComponent";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_public/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isLoading) {
      return;
    }
    if (context.auth.isAuthenticated) {
      throw redirect({
        href: getSafeAuthRedirect(search.redirect),
      });
    }
  },
  component: function LoginPage() {
    const { auth } = Route.useRouteContext();
    const { redirect: redirectTo } = Route.useSearch();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { t } = useTranslation(["auth", "common"]);
    const passwordEnabled = isPasswordAuthEnabled();

    if (auth.isLoading) {
      return <PendingComponent />;
    }

    if (auth.isAuthenticated) {
      return null;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md bg-input/30">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <LogoBig />
            </div>
            <div>
              <CardTitle className="text-2xl">{t("welcomeTitle")}</CardTitle>
              <CardDescription className="mt-2">
                {t("signInToContinue")}{" "}
                <a
                  href={APP_CONFIG.marketingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  {t("learnMore")}
                </a>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-8 flex flex-col gap-4">
            <div className="flex items-start gap-2 pb-2">
              <Checkbox
                id="terms-acceptance"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 bg-background"
              />
              <label
                htmlFor="terms-acceptance"
                className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
              >
                {t("agreePrefix")}{" "}
                <a
                  href={APP_CONFIG.privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("privacyPolicy")}
                </a>
                ,{" "}
                <a
                  href={APP_CONFIG.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("termsAndConditions")}
                </a>
                , {t("and")}{" "}
                <a
                  href={APP_CONFIG.cookieUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("cookiePolicy")}
                </a>
                .
              </label>
            </div>
            {passwordEnabled ? (
              <SignInWithPasswordLazy termsAccepted={termsAccepted} redirectTo={redirectTo} />
            ) : (
              <SignInWithGoogle termsAccepted={termsAccepted} redirectTo={redirectTo} />
            )}
            <p className="text-sm opacity-50">
              {passwordEnabled ? t("passwordAuthNote") : t("googleOnlyNote")}
            </p>
            <div className="mt-4 border-t pt-4">
              <p className="text-center text-xs text-muted-foreground">
                {t("appFooter")}{" "}
                <a
                  href={APP_CONFIG.marketingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  {t("learnMore")}
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
});
