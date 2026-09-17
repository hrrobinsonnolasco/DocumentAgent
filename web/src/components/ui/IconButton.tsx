import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  size?: 'sm' | 'md'
}

export function IconButton({
  children,
  active,
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-[var(--color-surface-hover)] text-[var(--color-text)]',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
