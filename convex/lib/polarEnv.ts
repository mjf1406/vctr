/**
 * Polar credentials selected by `POLAR_SERVER`.
 * Sandbox and production tokens/secrets can both live on one deployment.
 * Values are read lazily so schema evaluation never touches `process.env`.
 */
function polarServer(): "sandbox" | "production" {
  const value = process.env.POLAR_SERVER ?? "sandbox";
  return value === "production" ? "production" : "sandbox";
}

export const POLAR_ENV = {
  get server() {
    return polarServer();
  },
  get organizationToken() {
    const isSandbox = polarServer() === "sandbox";
    return (
      (isSandbox ? process.env.POLAR_SANDBOX_ACCESS_TOKEN : process.env.POLAR_ACCESS_TOKEN) ?? ""
    );
  },
  get webhookSecret() {
    const isSandbox = polarServer() === "sandbox";
    return (
      (isSandbox ? process.env.POLAR_SANDBOX_WEBHOOK_SECRET : process.env.POLAR_WEBHOOK_SECRET) ??
      ""
    );
  },
  get monthlyProductId() {
    return process.env.POLAR_PRODUCT_MONTHLY_ID ?? "";
  },
  get yearlyProductId() {
    return process.env.POLAR_PRODUCT_YEARLY_ID ?? "";
  },
};
