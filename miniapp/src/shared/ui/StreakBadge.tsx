import { motion } from 'framer-motion'

interface StreakBadgeProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { fontSize: '20px', textSize: '14px', padding: '6px 12px', gap: '6px' },
  md: { fontSize: '28px', textSize: '18px', padding: '8px 16px', gap: '8px' },
  lg: { fontSize: '40px', textSize: '24px', padding: '12px 20px', gap: '10px' }
}

export default function StreakBadge({ count, size = 'md' }: StreakBadgeProps) {
  const s = sizeMap[size]

  return (
    <motion.div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 0 16px rgba(245, 158, 11, 0.2)'
      }}
      animate={{
        boxShadow: [
          '0 0 16px rgba(245, 158, 11, 0.2)',
          '0 0 28px rgba(245, 158, 11, 0.4)',
          '0 0 16px rgba(245, 158, 11, 0.2)'
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span style={{ fontSize: s.fontSize, lineHeight: 1 }}>🔥</span>
      <span style={{
        fontSize: s.textSize,
        fontWeight: 700,
        color: 'var(--accent-gold)',
        letterSpacing: '-0.02em'
      }}>
        {count}
      </span>
      <span style={{
        fontSize: '12px',
        color: 'rgba(245, 158, 11, 0.7)',
        fontWeight: 500
      }}>
        дней
      </span>
    </motion.div>
  )
}
