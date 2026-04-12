import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Carbon Loading & Skeleton - Composants de chargement inspirés d'IBM Carbon Design System
 * Style IBM : animations fluides, skeleton screens, loading spinners
 */

/* ============================================
   Loading Spinner
   ============================================ */

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary-foreground",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label = "Loading...", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
        {label && <span className="sr-only">{label}</span>}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

/* ============================================
   Skeleton
   ============================================ */

const skeletonVariants = cva(
  "animate-pulse rounded bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        light: "bg-muted/50",
        text: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
  circle?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, circle, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          skeletonVariants({ variant }),
          circle && "rounded-full",
          className
        )}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

/* ============================================
   Skeleton Presets
   ============================================ */

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? "60%" : "100%"}
          variant="text"
        />
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("rounded-lg border border-border p-6 space-y-4", className)}>
      <Skeleton height={24} width="60%" />
      <SkeletonText lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton height={36} width={100} />
        <Skeleton height={36} width={100} />
      </div>
    </div>
  )
}

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height={20} width={`${100 / columns}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              height={16}
              width={`${100 / columns}%`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ============================================
   Loading Overlay
   ============================================ */

export interface LoadingOverlayProps {
  loading?: boolean
  children: React.ReactNode
  label?: string
  className?: string
  spinnerSize?: "sm" | "default" | "lg" | "xl"
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading = false,
  children,
  label = "Loading...",
  className,
  spinnerSize = "lg",
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <LoadingSpinner size={spinnerSize} label={label} />
        </div>
      )}
    </div>
  )
}

LoadingOverlay.displayName = "LoadingOverlay"

/* ============================================
   Loading Bar (Linear Progress)
   ============================================ */

export interface LoadingBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number // 0-100, undefined for indeterminate
  variant?: "default" | "success" | "warning" | "error"
}

const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ className, progress, variant = "default", ...props }, ref) => {
    const colorClasses = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
    }

    const isIndeterminate = progress === undefined

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-1 w-full overflow-hidden bg-muted", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-300",
            colorClasses[variant],
            isIndeterminate && "animate-[loading-bar_2s_ease-in-out_infinite]"
          )}
          style={{
            width: isIndeterminate ? "30%" : `${progress}%`,
          }}
        />
      </div>
    )
  }
)
LoadingBar.displayName = "LoadingBar"

export {
  LoadingSpinner,
  Skeleton,
  LoadingOverlay,
  LoadingBar,
  spinnerVariants,
  skeletonVariants,
}
