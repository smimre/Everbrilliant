import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]',
        success: 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]',
        warning: 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]',
        destructive: 'bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]',
        info: 'bg-[hsl(var(--info)/0.15)] text-[hsl(var(--info))]',
        secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
