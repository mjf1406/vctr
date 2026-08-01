/** True when the SPA was built for the local Docker self-host stack. */
export function isSelfHosted(): boolean {
  return import.meta.env.VITE_SELF_HOSTED === "true";
}
