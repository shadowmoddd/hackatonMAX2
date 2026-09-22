import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
  type?: 'info' | 'warn'
  durationMs?: number
}

export default function Toast({ message, visible, onHide, type = 'info', durationMs = 3500 }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onHide, durationMs)
    return () => clearTimeout(t)
  }, [visible, durationMs, onHide])

  const colors = type === 'warn'
    ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#F59E0B' }
    : { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.35)', text: 'var(--accent-glow)' }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top, 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            maxWidth: '320px',
            width: 'calc(100% - 32px)',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '10px 16px',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
          onClick={onHide}
        >
          <span style={{ fontSize: '14px', flexShrink: 0 }}>
            {type === 'warn' ? '⚠️' : 'ℹ️'}
          </span>
          <span style={{ fontSize: '12px', color: colors.text, lineHeight: 1.5 }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
