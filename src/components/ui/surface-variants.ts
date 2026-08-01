import { cva, type VariantProps } from "class-variance-authority";

export const surfaceVariants = cva("", {
  variants: {
    tier: {
      // Borderless float: edge comes from wash + shadow against --page-wash.
      card: "rounded-2xl bg-[image:var(--surface-wash)] bg-card text-card-foreground",
      // People: radial wash pattern, rounder silhouette, soft ring — distinct from class cards.
      member:
        "rounded-3xl bg-[image:var(--member-surface-wash)] bg-card text-card-foreground shadow-(--shadow-member) ring-1 ring-foreground/10",
      elevated:
        "rounded-2xl bg-popover text-popover-foreground shadow-(--shadow-elevated) ring-1 ring-foreground/5",
    },
    interactive: {
      // Lift on intent: stronger motion + wash/shadow only when the surface is actionable.
      true: "transition-[box-shadow,transform,background-image] duration-200 hover:-translate-y-0.5 hover:bg-[image:var(--surface-wash-hover)] hover:shadow-(--shadow-surface-hover)",
      false: "",
    },
    selected: {
      // Selected glow plane: brand-tinted wash + rim without neon.
      true: "bg-[image:var(--surface-wash-selected)] shadow-(--shadow-surface-selected) ring-1 ring-primary/20",
      false: "",
    },
  },
  compoundVariants: [
    {
      tier: "card",
      interactive: false,
      selected: false,
      class: "shadow-(--shadow-surface-quiet)",
    },
    {
      tier: "card",
      interactive: true,
      selected: false,
      class: "shadow-(--shadow-surface)",
    },
  ],
  defaultVariants: {
    tier: "card",
    interactive: false,
    selected: false,
  },
});

/** Nested content pockets for hierarchy inside a surface. */
export const surfacePocketVariants = cva("rounded-xl", {
  variants: {
    tone: {
      primary: "bg-[image:var(--surface-pocket-primary)] p-3 shadow-(--shadow-pocket)",
      secondary: "bg-muted/45 px-3 py-2 text-muted-foreground",
      inset: "bg-muted/30 px-3 py-2 shadow-[inset_0_1px_2px_oklch(0_0_0/6%)]",
    },
  },
  defaultVariants: {
    tone: "secondary",
  },
});

export type SurfaceVariants = VariantProps<typeof surfaceVariants>;
export type SurfacePocketVariants = VariantProps<typeof surfacePocketVariants>;
