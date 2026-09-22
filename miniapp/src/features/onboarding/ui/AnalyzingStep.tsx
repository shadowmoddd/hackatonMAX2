import { motion } from 'framer-motion'

interface AnalyzingStepProps {
  stageIndex: number
  stages: { text: string; icon: string; duration: number }[]
  detectedLevel: string
}

export default function AnalyzingStep({ stageIndex, stages, detectedLevel }: AnalyzingStepProps) {
  const levelLabels: Record<string, { label: string; color: string }> = {
    beginner:     { label: 'Новичок',     color: '#10B981' },
    elementary:   { label: 'Базовый',     color: '#06B6D4' },
    intermediate: { label: 'Средний',     color: '#7C3AED' },
    advanced:     { label: 'Продвинутый', color: '#F59E0B' },
  }
  const lvl = levelLabels[detectedLevel] || levelLabels.beginner
  const currentStage = stages[stageIndex]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}
    >
      {/* Spinning circle */}
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '40px' }}>
        {/* Outer glow */}
        <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#7C3AED', borderRightColor: '#06B6D4' }}
        />
        {/* Icon in center */}
        <motion.div
          key={stageIndex}
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}
        >
          {currentStage.icon}
        </motion.div>
      </div>

      {/* Stage text */}
      <motion.div key={stageIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{currentStage.text}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Пожалуйста, подожди...</div>
      </motion.div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {stages.map((_, i) => (
          <motion.div key={i}
            animate={{ scale: i === stageIndex ? 1.4 : 1, background: i <= stageIndex ? '#7C3AED' : 'rgba(71,85,105,0.4)' }}
            style={{ width: '8px', height: '8px', borderRadius: '50%' }}
          />
        ))}
      </div>

      {/* Detected level badge (shows when analyzing is done) */}
      {stageIndex >= stages.length - 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-surface)', border: `1px solid ${lvl.color}40`, borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Определён уровень</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: lvl.color }}>{lvl.label}</div>
        </motion.div>
      )}
    </motion.div>
  )
}
