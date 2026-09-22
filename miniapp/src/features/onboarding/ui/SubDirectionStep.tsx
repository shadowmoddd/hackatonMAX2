import { motion } from 'framer-motion'
import { IT_SUBDIRECTIONS } from '../config'

interface SubDirectionStepProps {
  onSelect: (id: string) => void
  onBack: () => void
}

export default function SubDirectionStep({ onSelect, onBack }: SubDirectionStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ padding: '24px 20px 40px' }}>
      <button onClick={onBack} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '24px' }}>← Назад</button>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💻</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Выбери направление</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Сфокусируемся именно на твоей специализации</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {IT_SUBDIRECTIONS.map((sub, i) => (
          <motion.button key={sub.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(sub.id)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: '32px', width: '48px', textAlign: 'center', flexShrink: 0 }}>{sub.icon}</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>{sub.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '16px', color: 'var(--text-muted)' }}>→</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
