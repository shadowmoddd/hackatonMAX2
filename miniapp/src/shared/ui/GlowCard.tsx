import { ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children: ReactNode
  glow?: 'violet' | 'cyan' | 'gold' | 'none'
  className?: string
  style?: CSSProperties
  onClick?: () => void
  animate?: boolean
}

const glowStyles: Record<string, CSSProperties> = {
  violet: { boxShadow: '0 0 24px rgba(124, 58, 237, 0.35), 0 0 48px rgba(124, 58, 237, 0.1)' },
  cyan: { boxShadow: '0 0 24px rgba(6, 182, 212, 0.35), 0 0 48px rgba(6, 182, 212, 0.1)' },
  gold: { boxShadow: '0 0 24px rgba(245, 158, 11, 0.35), 0 0 48px rgba(245, 158, 11, 0.1)' },
  none: {}
}

export default function GlowCard({
  children,
  glow = 'violet',
  className,
  style,
  onClick,
  animate = false
}: GlowCardProps) {
  const baseStyle: CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    transition: 'box-shadow 0.3s, transform 0.2s',
    cursor: onClick ? 'pointer' : 'default',
    ...glowStyles[glow],
    ...style
  }

  if (animate) {
    return (
      <motion.div
        style={baseStyle}
        className={className}
        onClick={onClick}
        whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.99 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div style={baseStyle} className={className} onClick={onClick}>
      {children}
    </div>
  )
}
