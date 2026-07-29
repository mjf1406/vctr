import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentSession } from "@/hooks/user/useCurrentSession";

export const Route = createFileRoute("/_authenticated/_app/account")({
  component: function AccountPage() {
    const { t } = useTranslation("account");
    const { t: tCommon } = useTranslation("common");
    const { t: tAuth } = useTranslation("auth");
    const sessionQuery = useCurrentSession();

    const isSessionExpired =
      sessionQuery.data?.expirationTime !== undefined &&
      sessionQuery.data.expirationTime <= Date.now();

    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        {isSessionExpired && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="text-destructive" />
                {tCommon("signIn")}
              </CardTitle>
              <CardDescription>{tAuth("signInToContinue")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                size="lg"
                nativeButton={false}
                render={<Link to="/login" />}
              >
                {tCommon("signIn")}
              </Button>
            </CardContent>
          </Card>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t("paymentsTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("paymentsComingSoon")}</p>
        </div>
      </div>
    );
  },
});
