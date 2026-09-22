import { motion } from 'framer-motion'

interface ArticleModalData {
  title: string
  content: string[]
  articleUrl?: string
}


export default function ArticleModal({ data, onClose }: { data: ArticleModalData; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
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
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid var(--border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1, paddingRight: '12px' }}>
            {data.title}
          </h3>
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
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.content.map((point, i) => (
            <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>•</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{point}</span>
            </li>
          ))}
        </ul>
        {data.articleUrl && (
          <button
            onClick={() => {
              if (window.WebApp?.openLink) {
                window.WebApp.openLink(data.articleUrl!)
              } else {
                window.open(data.articleUrl, '_blank')
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-cyan-glow)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Открыть полностью →
          </button>
        )}
      </motion.div>
    </div>
  )
}
