import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const SIZES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
];

function getColor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ name, src, size = 'md', className, color }: AvatarProps) {
  const gradient = color || getColor(name);

  if (src) {
    return (
      <img
        src={src} alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', SIZES[size], className)}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 bg-gradient-to-br select-none',
      gradient, SIZES[size], className
    )}>
      {getInitials(name)}
    </div>
  );
}
