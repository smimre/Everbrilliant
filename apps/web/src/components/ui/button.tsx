'use client';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] shadow-sm shadow-[hsl(var(--primary)/0.3)]',
        secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
        destructive: 'bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive)/0.9)]',
        success: 'bg-[hsl(var(--success))] text-white hover:opacity-90',
        ghost: 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
        outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
        link: 'text-[hsl(var(--primary))] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-7 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || !!loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
