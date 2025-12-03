import { ReactNode } from 'react'

interface SectionProps {
  id: string
  children: ReactNode
  className?: string
}

export default function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {children}
    </section>
  )
}



