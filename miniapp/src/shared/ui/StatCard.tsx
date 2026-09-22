import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  icon: string | ReactNode
  value: string | number
  label: string
  color?: 'violet' | 'cyan' | 'gold' | 'success'
  delay?: number
}

const colorMap = {
  violet: { bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.25)', text: 'var(--accent-glow)' },
  cyan: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)', text: 'var(--accent-cyan-glow)' },
  gold: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', text: 'var(--accent-gold)' },
  success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: 'var(--success)' }
}

export default function StatCard({ icon, value, label, color = 'violet', delay = 0 }: StatCardProps) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        flex: 1,
        minWidth: 0
      }}
    >
      <span style={{ fontSize: '22px', lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{
        fontSize: '20px',
        fontWeight: 700,
        color: c.text,
        letterSpacing: '-0.02em',
        lineHeight: 1
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontWeight: 500
      }}>
        {label}
      </span>
    </motion.div>
  )
}
