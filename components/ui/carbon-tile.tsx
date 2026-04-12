import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Carbon Tiles - Composants de tuiles inspirés d'IBM Carbon Design System
 * Combinant les meilleures pratiques d'IBM Carbon avec shadcn/ui
 */

const tileVariants = cva(
  "relative block w-full transition-all duration-200 outline-offset-[-1px]",
  {
    variants: {
      variant: {
        default: "bg-background border border-border",
        clickable: "bg-background border border-border cursor-pointer hover:bg-layer-02 active:bg-layer-03",
        selectable: "bg-background border border-border cursor-pointer data-[selected=true]:border-primary data-[selected=true]:border-2",
        expandable: "bg-background border border-border cursor-pointer hover:bg-layer-02",
        ghost: "bg-transparent border-none hover:bg-layer-01",
      },
      padding: {
        default: "p-[var(--spacing-05)]", // 16px
        sm: "p-[var(--spacing-03)]",      // 8px
        lg: "p-[var(--spacing-06)]",      // 24px
        none: "p-0",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-md",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      rounded: "default",
    },
  }
)

export interface TileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  selected?: boolean
}

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, variant, padding, rounded, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-selected={selected}
        className={cn(tileVariants({ variant, padding, rounded, className }))}
        {...props}
      />
    )
  }
)
Tile.displayName = "Tile"

/**
 * ClickableTile - Une tuile cliquable avec états hover/active
 */
export interface ClickableTileProps extends Omit<TileProps, "variant"> {
  href?: string
  as?: "div" | "a" | "button"
}

const ClickableTile = React.forwardRef<HTMLDivElement, ClickableTileProps>(
  ({ className, as = "div", href, ...props }, ref) => {
    const Component = href ? "a" : as

    return (
      <Component
        ref={ref as any}
        href={href}
        className={cn(
          tileVariants({ variant: "clickable", className }),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        {...props}
      />
    )
  }
)
ClickableTile.displayName = "ClickableTile"

/**
 * SelectableTile - Une tuile sélectionnable (checkbox-like)
 */
export interface SelectableTileProps extends Omit<TileProps, "variant"> {
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
}

const SelectableTile = React.forwardRef<HTMLDivElement, SelectableTileProps>(
  ({ className, selected, onSelectedChange, children, ...props }, ref) => {
    const handleClick = () => {
      onSelectedChange?.(!selected)
    }

    return (
      <div
        ref={ref}
        role="checkbox"
        aria-checked={selected}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault()
            handleClick()
          }
        }}
        className={cn(
          tileVariants({ variant: "selectable", className }),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        data-selected={selected}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectableTile.displayName = "SelectableTile"

/**
 * ExpandableTile - Une tuile expandable avec contenu caché
 */
export interface ExpandableTileProps extends Omit<TileProps, "variant"> {
  title: React.ReactNode
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

const ExpandableTile = React.forwardRef<HTMLDivElement, ExpandableTileProps>(
  ({ className, title, expanded, onExpandedChange, children, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(expanded ?? false)

    const toggleExpanded = () => {
      const newValue = !isExpanded
      setIsExpanded(newValue)
      onExpandedChange?.(newValue)
    }

    React.useEffect(() => {
      if (expanded !== undefined) {
        setIsExpanded(expanded)
      }
    }, [expanded])

    return (
      <div
        ref={ref}
        className={cn(tileVariants({ variant: "expandable", className }))}
        {...props}
      >
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-between w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-expanded={isExpanded}
        >
          <div className="flex-1">{title}</div>
          <svg
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isExpanded && (
          <div className="mt-[var(--spacing-05)] pt-[var(--spacing-05)] border-t border-border animate-slide-down">
            {children}
          </div>
        )}
      </div>
    )
  }
)
ExpandableTile.displayName = "ExpandableTile"

export { Tile, ClickableTile, SelectableTile, ExpandableTile, tileVariants }
