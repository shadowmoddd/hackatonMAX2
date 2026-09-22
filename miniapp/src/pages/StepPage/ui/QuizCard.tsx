import { motion } from 'framer-motion'
import { type StepMaterial } from '@/entities/sphere'

interface MaterialCardProps {
  material: StepMaterial
  onStart: () => void
}

export default function QuizCard({ material, onStart }: MaterialCardProps) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(124,58,237,0.5)', boxShadow: '0 0 24px rgba(124,58,237,0.15)' }}
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        cursor: 'pointer'
      }}
      onClick={onStart}
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 12px rgba(124,58,237,0.4)',
            '0 0 24px rgba(124,58,237,0.8)',
            '0 0 12px rgba(124,58,237,0.4)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: '52px',
          height: '52px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.2) 100%)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          flexShrink: 0
        }}
      >
        🧠
      </motion.div>
      <div style={{ flex: 1 }}>
        <div
          style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}
        >
          {material.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          {material.source} · {material.duration}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            style={{
              padding: '8px 18px',
              background: 'var(--grad-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Пройти квиз →
          </button>
          <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600 }}>
            +{material.xp} XP
          </span>
        </div>
      </div>
    </motion.div>
  )
}
