import { motion } from 'framer-motion'
import { type StepMaterial } from '@/entities/sphere'

interface MaterialCardProps {
  material: StepMaterial
  onStart: () => void
}

export default function ArticleCard({ material, onStart }: MaterialCardProps) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(6,182,212,0.4)', boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          background: 'rgba(6,182,212,0.1)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0
        }}
      >
        📰
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}
        >
          {material.title}
        </div>
        <div
          style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{material.source}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{material.duration}</span>
          <span
            style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}
          >
            +{material.xp} XP
          </span>
        </div>
        <button
          onClick={onStart}
          style={{
            padding: '8px 16px',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-cyan-glow)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Читать внутри →
        </button>
      </div>
    </motion.div>
  )
}
