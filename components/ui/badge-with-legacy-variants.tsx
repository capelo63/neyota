import * as React from "react"
import { Badge as ShadcnBadge, badgeVariants } from "./badge"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Extended badge variants to support legacy variants
const extendedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // shadcn/ui variants
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",

        // Legacy variants mapped to appropriate styles
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        success:
          "border-transparent bg-success text-white hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-white hover:bg-warning/80",
        error:
          "border-transparent bg-error text-white hover:bg-error/80",
        info:
          "border-transparent bg-info text-white hover:bg-info/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeWithLegacyVariantsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof extendedBadgeVariants> {}

function BadgeWithLegacyVariants({ className, variant, ...props }: BadgeWithLegacyVariantsProps) {
  return (
    <div className={cn(extendedBadgeVariants({ variant }), className)} {...props} />
  )
}

export { BadgeWithLegacyVariants, extendedBadgeVariants }
