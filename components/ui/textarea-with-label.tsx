import * as React from "react"
import { Textarea } from "./textarea"
import { Label } from "./label"
import { cn } from "@/lib/utils"

export interface TextareaWithLabelProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const TextareaWithLabel = React.forwardRef<HTMLTextAreaElement, TextareaWithLabelProps>(
  ({ label, error, helperText, id, className, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`

    if (!label && !error && !helperText) {
      return <Textarea ref={ref} id={textareaId} className={cn(error && "border-destructive", className)} {...props} />
    }

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={textareaId}>{label}</Label>}
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    )
  }
)
TextareaWithLabel.displayName = "TextareaWithLabel"

export { TextareaWithLabel }
