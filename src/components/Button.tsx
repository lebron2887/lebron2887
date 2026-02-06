import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-elegant focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    ghost: 'hover:bg-accent text-foreground',
    outline: 'border border-border hover:bg-accent',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    premium: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'w-10 h-10 p-0 flex items-center justify-center',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
