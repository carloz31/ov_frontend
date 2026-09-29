import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/Utils'

const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary-soft)] text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-[var(--success-soft)] text-[var(--success)]',
        warning: 'bg-[var(--warning-soft)] text-[#9c611b]',
        outline: 'border border-border bg-card text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
