import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Carbon IconButton - Bouton d'icône inspiré d'IBM Carbon Design System
 * Compatible avec @carbon/icons-react et lucide-react
 */

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 w-8 p-1.5", // 32px, icon ~20px
        default: "h-10 w-10 p-2", // 40px, icon ~24px
        lg: "h-12 w-12 p-2.5", // 48px, icon ~28px
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
  label: string // For accessibility
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

/**
 * IconButtonGroup - Groupe de boutons d'icône
 */
export interface IconButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  orientation?: "horizontal" | "vertical"
  attached?: boolean // Boutons attachés les uns aux autres
}

const IconButtonGroup = React.forwardRef<HTMLDivElement, IconButtonGroupProps>(
  ({ className, children, orientation = "horizontal", attached = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          attached
            ? orientation === "horizontal"
              ? "[&>button]:rounded-none [&>button:first-child]:rounded-l [&>button:last-child]:rounded-r [&>button:not(:last-child)]:border-r-0"
              : "[&>button]:rounded-none [&>button:first-child]:rounded-t [&>button:last-child]:rounded-b [&>button:not(:last-child)]:border-b-0"
            : "gap-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
IconButtonGroup.displayName = "IconButtonGroup"

export { IconButton, IconButtonGroup, iconButtonVariants }
