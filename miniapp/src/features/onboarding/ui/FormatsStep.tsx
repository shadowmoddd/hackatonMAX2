import { motion } from 'framer-motion'
import { FORMAT_OPTIONS, IT_SUBDIRECTIONS } from '../config'

interface FormatsStepProps {
  selectedFormats: string[]
  onToggle: (id: string) => void
  onFinish: () => void
  detectedLevel: string
  subDirection: string | null
  profileLabel?: string
}

export default function FormatsStep({ selectedFormats, onToggle, onFinish, detectedLevel, subDirection, profileLabel }: FormatsStepProps) {
  const levelLabels: Record<string, string> = {
    beginner: 'Новичок', elementary: 'Базовый', intermediate: 'Средний', advanced: 'Продвинутый'
  }

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ padding: '32px 20px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎬</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Выбери форматы</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Какие форматы обучения тебе удобнее?</p>
      </div>

      {/* Profile summary */}
      {(subDirection || profileLabel) && (
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '32px' }}>📋</div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Твой профиль</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profileLabel || IT_SUBDIRECTIONS.find(s => s.id === subDirection)?.label} · {levelLabels[detectedLevel] || 'Новичок'}
            </div>
          </div>
        </div>
      )}

      {/* Format cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
        {FORMAT_OPTIONS.map((fmt, i) => {
          const active = selectedFormats.includes(fmt.id)
          return (
            <motion.button key={fmt.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(fmt.id)}
              style={{ background: active ? 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)' : 'var(--bg-surface)', border: `1.5px solid ${active ? 'rgba(124,58,237,0.6)' : 'var(--border)'}`, borderRadius: '16px', padding: '18px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', position: 'relative' }}
            >
              {active && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>✓</div>
              )}
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{fmt.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: active ? 'var(--accent-glow)' : 'var(--text-primary)', marginBottom: '4px' }}>{fmt.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{fmt.desc}</div>
            </motion.button>
          )
        })}
      </div>

      {/* Finish button */}
      <motion.button
        onClick={onFinish}
        whileTap={{ scale: 0.98 }}
        style={{ width: '100%', padding: '16px', background: 'var(--grad-primary)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 24px rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        🚀 Начать обучение
      </motion.button>
    </motion.div>
  )
}
