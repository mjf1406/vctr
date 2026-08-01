import { z } from "zod";

/**
 * Must be set to `true` only when a Password provider is registered in
 * `convex/auth.ts`. The Vite env flag alone must never enable the UI.
 */
export const PASSWORD_PROVIDER_REGISTERED = true;

/** Build-time flag baked into the SPA (self-host Docker sets `VITE_AUTH_PASSWORD_ENABLED`). */
export function isPasswordAuthEnabled(): boolean {
  return PASSWORD_PROVIDER_REGISTERED && import.meta.env.VITE_AUTH_PASSWORD_ENABLED === "true";
}

export const passwordSignInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const passwordSignUpSchema = passwordSignInSchema
  .extend({
    name: z.string().trim().optional(),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

export type PasswordSignInValues = z.infer<typeof passwordSignInSchema>;
export type PasswordSignUpValues = z.infer<typeof passwordSignUpSchema>;
