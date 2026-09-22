import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAppStore, ACHIEVEMENT_DEFS } from '@/shared/store/appStore'

export default function AchievementToast() {
  const newAchievements = useAppStore((s) => s.newAchievements)
  const clearNewAchievements = useAppStore((s) => s.clearNewAchievements)

  useEffect(() => {
    if (newAchievements.length === 0) return
    const timer = setTimeout(() => clearNewAchievements(), 3500)
    return () => clearTimeout(timer)
  }, [newAchievements, clearNewAchievements])

  if (newAchievements.length === 0) return null

  return (
    <motion.div
      key="achievement-toast"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'fixed', bottom: '90px', left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(26,32,69,0.98)',
        border: '1px solid var(--accent-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px', zIndex: 300,
        whiteSpace: 'nowrap',
        boxShadow: '0 0 30px rgba(245,158,11,0.3)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}
    >
      <span style={{ fontSize: '18px' }}>🏆</span>
      <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
        {ACHIEVEMENT_DEFS.find(d => d.id === newAchievements[0])?.title ?? 'Достижение получено!'}
      </span>
    </motion.div>
  )
}
