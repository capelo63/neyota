import * as React from "react"
import { Checkbox } from "./checkbox"
import { Label } from "./label"

export interface CheckboxWithLabelProps extends Omit<React.ComponentPropsWithoutRef<typeof Checkbox>, 'onChange' | 'onCheckedChange'> {
  label?: React.ReactNode
  error?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const CheckboxWithLabel = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  CheckboxWithLabelProps
>(({ label, error, id, onChange, checked, ...props }, ref) => {
  const checkboxId = id || `checkbox-${typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : 'checkbox'}`

  const handleCheckedChange = (newChecked: boolean) => {
    if (onChange) {
      // Create a synthetic event for compatibility
      const syntheticEvent = {
        target: { checked: newChecked },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  if (!label && !error) {
    return (
      <Checkbox
        ref={ref}
        id={checkboxId}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        {...props}
      />
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          ref={ref}
          id={checkboxId}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          {...props}
        />
        {label && (
          <Label
            htmlFor={checkboxId}
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </Label>
        )}
      </div>
      {error && <p className="text-sm text-destructive ml-6">{error}</p>}
    </div>
  )
})
CheckboxWithLabel.displayName = "CheckboxWithLabel"

export { CheckboxWithLabel }
