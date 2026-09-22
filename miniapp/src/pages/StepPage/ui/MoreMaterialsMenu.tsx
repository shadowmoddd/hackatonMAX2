import { motion } from 'framer-motion'

interface MoreMaterialsMenuProps {
  onSelect: (format: 'video' | 'article' | 'book') => void
  onClose: () => void
  loading: boolean
}

const FORMAT_OPTIONS = [
  { id: 'video' as const,   icon: '📺', label: 'Видео',   desc: 'YouTube, RuTube, лекции' },
  { id: 'article' as const, icon: '📰', label: 'Статьи',  desc: 'Habr и другие' },
  { id: 'book' as const,    icon: '📚', label: 'Книги',   desc: 'PDF и онлайн' },
]

export default function MoreMaterialsMenu({ onSelect, onClose, loading }: MoreMaterialsMenuProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 16px 40px',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Хочу больше материалов
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontSize: '32px' }}
            >
              🧠
            </motion.div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ИИ подбирает материалы...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {FORMAT_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 12px',
                  background: 'rgba(255,1,99,0.08)',
                  border: '1px solid rgba(255,1,99,0.2)',
                  borderRadius: '14px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{opt.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{opt.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.desc}</span>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
