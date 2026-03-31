import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── CVA: Status Badge ─────────────────────────────────────────────────
// Componente próprio usando class-variance-authority para demonstrar
// domínio da ferramenta além dos primitivos gerados pelo shadcn/ui.

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold transition-colors',
  {
    variants: {
      variant: {
        income:   'bg-emerald-50 text-emerald-600',
        expense:  'bg-slate-50 text-slate-600',
        transfer: 'bg-blue-50 text-blue-600',
        warning:  'bg-amber-50 text-amber-600',
        success:  'bg-emerald-50 text-emerald-600',
        error:    'bg-red-50 text-red-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] tracking-wide',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'expense',
      size: 'sm',
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function StatusBadge({ className, variant, size, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { badgeVariants }
