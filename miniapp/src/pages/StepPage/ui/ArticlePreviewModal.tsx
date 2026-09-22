import { motion } from 'framer-motion'

interface ArticlePreviewData {
  title: string
  source: string
  url: string
  description: string
}

export default function ArticlePreviewModal({
  data,
  onClose,
}: {
  data: ArticlePreviewData
  onClose: () => void
}) {
  const openArticle = () => {
    if (!data.url) return

    if (window.WebApp?.openLink) {
      window.WebApp.openLink(data.url)
    } else {
      window.open(data.url, '_blank', 'noopener,noreferrer')
    }

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
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
          padding: '24px 20px 40px',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1, paddingRight: '12px' }}>
            {data.source && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  marginBottom: '10px',
                  fontSize: '11px',
                  color: 'var(--accent-glow)',
                  fontWeight: 600,
                }}
              >
                📰 {data.source}
              </div>
            )}

            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {data.title}
            </h3>
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
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {data.description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              margin: '0 0 20px 0',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            {data.description}
          </p>
        )}

        {/* Read button */}
        {data.url ? (
          <motion.button
            onClick={openArticle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--grad-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}
          >
            📖 Читать статью
          </motion.button>
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            Ссылка недоступна
          </p>
        )}
      </motion.div>
    </div>
  )
}