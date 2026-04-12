import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

/**
 * Carbon Notification - Composant de notification inspiré d'IBM Carbon Design System
 * Style IBM : inline notifications avec icônes à gauche et actions à droite
 */

const notificationVariants = cva(
  "relative flex items-start gap-[var(--spacing-04)] p-[var(--spacing-05)] border-l-4 transition-all duration-200",
  {
    variants: {
      variant: {
        info: "bg-info-light border-l-info text-info-dark",
        success: "bg-success-light border-l-success text-success-dark",
        warning: "bg-warning-light border-l-warning text-warning-dark",
        error: "bg-error-light border-l-error text-error-dark",
      },
      size: {
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "default",
    },
  }
)

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
  subtitle?: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({
    className,
    variant = "info",
    size,
    title,
    subtitle,
    dismissible = true,
    onDismiss,
    action,
    children,
    ...props
  }, ref) => {
    const Icon = iconMap[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(notificationVariants({ variant, size, className }))}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-sm opacity-90">
              {subtitle}
            </div>
          )}
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-start gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
            >
              {action.label}
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              className="hover:bg-black/10 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Notification.displayName = "Notification"

/**
 * ToastNotification - Notification en toast (position fixe)
 */
export interface ToastNotificationProps extends NotificationProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

const ToastNotification = React.forwardRef<HTMLDivElement, ToastNotificationProps>(
  ({ className, position = "top-right", ...props }, ref) => {
    const positionClasses = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
    }

    return (
      <div className={cn("fixed z-50 max-w-md", positionClasses[position])}>
        <Notification
          ref={ref}
          className={cn("shadow-lg animate-slide-down", className)}
          {...props}
        />
      </div>
    )
  }
)
ToastNotification.displayName = "ToastNotification"

export { Notification, ToastNotification, notificationVariants }
