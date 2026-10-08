import type { ReactNode } from 'react'
export function Parchment({
  title,
  label,
  children,
  className = '',
}: {
  title?: string
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`sx-d-parchment ${className}`}>
      {label && <p className="sx-d-eyebrow">{label}</p>}
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
}
