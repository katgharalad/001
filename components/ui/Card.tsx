import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'alt' | 'teal'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-bg-card border-accent-primary/20',
      alt: 'bg-bg-card-alt border-accent-primary/10',
      teal: 'bg-bg-card border-accent-teal/20',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative group rounded-lg border transition-all duration-300',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* Top gradient line on hover - 2x more prominent */}
        <span className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out bg-gradient-to-r w-full mx-auto from-transparent via-blue-400 via-cyan-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)] group-hover:shadow-[0_0_16px_rgba(96,165,250,1)]" />
        
        {/* Content */}
        {children}
        
        {/* Bottom gradient line on hover - 2x more prominent */}
        <span className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out bg-gradient-to-r w-full mx-auto from-transparent via-blue-400 via-cyan-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)] group-hover:shadow-[0_0_16px_rgba(96,165,250,1)]" />
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }

