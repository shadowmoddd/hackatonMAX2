import { motion } from 'framer-motion'
import { type DocEntry } from '@/data/docsDatabase'

interface DocsModalProps {
  docs: DocEntry[]
  onClose: () => void
}

export default function DocsModal({ docs, onClose }: DocsModalProps) {
  const open = (url: string) => {
    const tg = window.WebApp

    if (tg?.openLink) {
      tg.openLink(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
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
          maxHeight: '75vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            📖 Документация
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {docs.map((doc, i) => (
            <motion.button
              key={i}
              onClick={() => open(doc.url)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '3px',
                  }}
                >
                  {doc.title}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {doc.description}
                </div>
              </div>

              <span
                style={{
                  fontSize: '16px',
                  flexShrink: 0,
                  color: 'var(--accent-primary)',
                }}
              >
                →
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}