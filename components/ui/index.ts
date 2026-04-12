// shadcn/ui components
// Export ButtonWithLoading as Button for backward compatibility with isLoading prop
export { ButtonWithLoading as Button } from './button-with-loading';
export { buttonVariants, Button as BaseButton } from './button';
export type { ButtonProps } from './button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from './card';

// Alias for backward compatibility
export { CardContent as CardBody } from './card';

// Export BadgeWithLegacyVariants as Badge for backward compatibility
export { BadgeWithLegacyVariants as Badge, extendedBadgeVariants as badgeVariants } from './badge-with-legacy-variants';
export { Badge as BaseBadge } from './badge';

// Export InputWithLabel as Input for backward compatibility with label prop
export { InputWithLabel as Input } from './input-with-label';
// Export base Input as BaseInput if needed
export { Input as BaseInput } from './input';

// Export CheckboxWithLabel as Checkbox for backward compatibility with label prop
export { CheckboxWithLabel as Checkbox } from './checkbox-with-label';
export { Checkbox as BaseCheckbox } from './checkbox';

// Export TextareaWithLabel as Textarea for backward compatibility with label prop
export { TextareaWithLabel as Textarea } from './textarea-with-label';
// Export base Textarea as BaseTextarea if needed
export { Textarea as BaseTextarea } from './textarea';

// Export SimpleSelect as Select for backward compatibility
export { SimpleSelect as Select } from './simple-select';
export type { SimpleSelectProps as SelectProps } from './simple-select';

// Export shadcn/ui Select components with Shadcn prefix
export {
  Select as ShadcnSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from './select';

export { Label } from './label';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Keep old Modal for now (to be migrated to Dialog)
export { Modal } from './Modal';
export type { ModalProps } from './Modal';
