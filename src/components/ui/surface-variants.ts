import { cva, type VariantProps } from "class-variance-authority";

export const surfaceVariants = cva("", {
  variants: {
    tier: {
      card: "rounded-2xl bg-[image:var(--surface-wash)] bg-card text-card-foreground shadow-(--shadow-surface) ring-1 ring-foreground/10",
      elevated:
        "rounded-2xl bg-popover text-popover-foreground shadow-(--shadow-elevated) ring-1 ring-foreground/5",
    },
    interactive: {
      true: "transition-[box-shadow,transform,background-color] duration-200 hover:-translate-y-px hover:bg-accent/40 hover:shadow-(--shadow-surface-hover)",
      false: "",
    },
  },
  defaultVariants: {
    tier: "card",
    interactive: false,
  },
});

export type SurfaceVariants = VariantProps<typeof surfaceVariants>;
