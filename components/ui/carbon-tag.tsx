import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

/**
 * Carbon Tag - Composant de tag inspiré d'IBM Carbon Design System
 * Style IBM : petits, compacts, avec typographie spécifique
 */

const tagVariants = cva(
  "inline-flex items-center gap-1 font-mono text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-layer-02 text-foreground border border-border",
        red: "bg-error-light text-error-dark border border-error",
        green: "bg-success-light text-success-dark border border-success",
        blue: "bg-info-light text-info-dark border border-info",
        yellow: "bg-warning-light text-warning-dark border border-warning",
        gray: "bg-neutral-100 text-neutral-800 border border-neutral-300",
        outline: "bg-transparent text-foreground border border-border",
      },
      size: {
        sm: "h-5 px-2 text-[0.625rem]",    // 10px
        default: "h-6 px-2 text-xs",        // 12px
        lg: "h-7 px-3 text-sm",             // 14px
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant, size, rounded, dismissible, onDismiss, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(tagVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDismiss?.()
            }}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }
)
Tag.displayName = "Tag"

/**
 * TagGroup - Groupe de tags avec espacement cohérent
 */
export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TagGroup.displayName = "TagGroup"

export { Tag, TagGroup, tagVariants }
