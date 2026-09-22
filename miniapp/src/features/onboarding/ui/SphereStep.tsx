import { motion } from 'framer-motion'
import { SphereProfile } from '@/shared/store/appStore'

interface SphereStepProps {
  sphereProfiles: Record<string, SphereProfile>
  onSelect: (id: string) => void
}

export default function SphereStep({ sphereProfiles, onSelect }: SphereStepProps) {
  const spheres = [
    { id: 'it',          name: 'IT / Программирование', icon: '💻', color: '#7C3AED', desc: 'Python, веб, ML, DevOps', steps: 7, xp: 1160 },
    { id: 'design',      name: 'Дизайн',                icon: '🎨', color: '#EC4899', desc: 'Figma, UI/UX, графика',   steps: 5, xp: 710 },
    { id: 'video_photo', name: 'Видео и фото',           icon: '🎬', color: '#F59E0B', desc: 'Монтаж, Photoshop',      steps: 5, xp: 730 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}
      style={{ padding: '32px 20px 40px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} style={{ fontSize: '56px', marginBottom: '16px' }}>🎓</motion.div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Выбери сферу обучения
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
          Подберём персональный маршрут именно для тебя
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {spheres.map((s, i) => (
          <motion.button key={s.id}
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(s.id)}
            style={{ background: `linear-gradient(135deg, ${s.color}18 0%, transparent 100%)`, border: `1px solid ${s.color}40`, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: `0 4px 20px ${s.color}12` }}
          >
            <div style={{ width: '60px', height: '60px', background: `${s.color}25`, border: `1px solid ${s.color}50`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{s.desc}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: s.color, background: s.color + '20', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{s.steps} шагов</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {s.xp} XP</span>
              </div>
            </div>
            {sphereProfiles[s.id]?.preferredFormats?.length ? (
              <div style={{ fontSize: '11px', color: '#10B981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, whiteSpace: 'nowrap' }}>▶ Продолжить</div>
            ) : (
              <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>→</div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
