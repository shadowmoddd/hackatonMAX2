import { motion } from 'framer-motion'

interface XPBarProps {
  current: number
  max: number
  level: number
  levelName: string
  showLabel?: boolean
}

export default function XPBar({ current, max, level, levelName, showLabel = true }: XPBarProps) {
  const pct = Math.min((current / max) * 100, 100)

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Level {level} · {levelName}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
        </div>
      )}
      <div style={{
        height: '6px',
        background: 'rgba(124, 58, 237, 0.15)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{
            height: '100%',
            background: 'var(--grad-primary)',
            borderRadius: 'var(--radius-full)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }} />
        </motion.div>
      </div>
    </div>
  )
}
