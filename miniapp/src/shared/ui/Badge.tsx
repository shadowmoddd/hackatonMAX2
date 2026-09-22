import { motion } from 'framer-motion'

interface BadgeProps {
  id: number
  title: string
  desc: string
  icon: string
  earned: boolean
  xp: number
  progress?: number
  total?: number
  delay?: number
}

export default function Badge({
  title,
  desc,
  icon,
  earned,
  xp,
  progress,
  total,
  delay = 0
}: BadgeProps) {
  if (earned) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)',
          cursor: 'default'
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.2) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)'
        }}>
          {icon}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
            {desc}
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--accent-gold)',
          fontWeight: 600,
          background: 'rgba(245, 158, 11, 0.12)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          +{xp} XP
        </div>
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '16px',
          height: '16px',
          background: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: 'white'
        }}>
          ✓
        </div>
      </motion.div>
    )
  }

  const progressPct = progress != null && total != null ? (progress / total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        cursor: 'default',
        filter: 'grayscale(0.4)'
      }}
    >
      <div style={{
        width: '52px',
        height: '52px',
        background: 'rgba(71, 85, 105, 0.2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{ opacity: 0.4 }}>{icon}</span>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          🔒
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4, opacity: 0.7 }}>
          {desc}
        </div>
      </div>
      {progress != null && total != null && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4px' }}>
            {progress}/{total}
          </div>
          <div style={{
            height: '3px',
            background: 'rgba(71, 85, 105, 0.3)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'rgba(124, 58, 237, 0.5)',
              borderRadius: 'var(--radius-full)'
            }} />
          </div>
        </div>
      )}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
        +{xp} XP
      </div>
    </motion.div>
  )
}
