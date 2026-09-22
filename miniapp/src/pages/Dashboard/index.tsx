import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition, XPBar, StreakBadge } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere } from '@/entities/sphere'

// ── Stagger container ──────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

// ── Component ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { sphereId, xp, streak, completedStepIds, currentStepId, resetAll, clearCurrentSphere, detectedLevel, subDirection } = useAppStore()

  const sphere = getSphere(sphereId || 'it')
  const currentStep = sphere?.steps.find(s => s.id === (currentStepId || 1))

  // Get MAX user info
  const maxUser = window.WebApp?.initDataUnsafe?.user
  const displayName = maxUser?.username ? `@${maxUser.username}` : (maxUser?.first_name ?? 'Ученик')
  const photoUrl = maxUser?.photo_url ?? maxUser?.avatar_url ?? null

  const totalSteps = sphere?.steps.length || 0
  const completedCount = completedStepIds.length
  const percent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  const level = Math.floor(xp / 500) + 1
  const levelXpCurrent = xp % 500

  const levelInfo: Record<string, { label: string; color: string }> = {
    beginner:     { label: 'Новичок',     color: '#10B981' },
    elementary:   { label: 'Базовый',     color: '#06B6D4' },
    intermediate: { label: 'Средний',     color: '#7C3AED' },
    advanced:     { label: 'Продвинутый', color: '#F59E0B' },
  }
  const currentLevelInfo = levelInfo[detectedLevel] || levelInfo.beginner

  const sphereColor = sphere?.color || '#7C3AED'

  return (
    <PageTransition>
      <motion.div
        className="dashboard-page"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          padding: '16px',
          maxWidth: '480px',
          margin: '0 auto',
          paddingBottom: '24px'
        }}
      >
        {/* ─── Header ─────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="avatar"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
              />
            ) : (
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--grad-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 700, color: 'white',
                boxShadow: '0 0 16px rgba(124,58,237,0.4)', flexShrink: 0
              }}>
                {displayName.replace('@', '').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2
                }}
              >
                {displayName} 👋
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {sphere?.name || 'Продолжай в том же духе!'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── XP Bar ─────────────────────────────────── */}
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <XPBar
            current={levelXpCurrent}
            max={500}
            level={level}
            levelName={level === 1 ? 'Новичок' : level === 2 ? 'Ученик' : 'Мастер'}
          />
        </motion.div>

        {/* ─── Learning Profile Mini Card ──────────── */}
        {detectedLevel && (
          <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
            <div
              onClick={() => navigate('/profile')}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px', height: '40px',
                background: `${currentLevelInfo.color}20`,
                border: `1px solid ${currentLevelInfo.color}40`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0
              }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: currentLevelInfo.color }}>{currentLevelInfo.label}</span>
                  {subDirection && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>·</span>
                  )}
                  {subDirection && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {subDirection === 'backend' ? 'Backend' : subDirection === 'frontend' ? 'Frontend' : subDirection === 'ml' ? 'ML / AI' : subDirection === 'devops' ? 'DevOps' : subDirection}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Нажми чтобы открыть профиль →</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Career Path Card ───────────────────────── */}
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          {sphere?.careerPath && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.05) 100%)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Карьерный маршрут
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {sphere.careerPath.roles[0]}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    {sphere.careerPath.salaryRange}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>до работы</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{sphere.careerPath.timeToJob}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {sphere.careerPath.topSkills.map(skill => (
                  <span key={skill} style={{
                    fontSize: '11px', padding: '3px 8px',
                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                    borderRadius: '999px', color: 'var(--accent-cyan-glow)', fontWeight: 500
                  }}>{skill}</span>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Нанимают: {sphere.careerPath.companiesHiring.join(' · ')}
              </div>
            </div>
          )}
        </motion.div>

        {/* ─── Streak Hero Card ───────────────────────── */}
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              padding: '24px 20px',
              background: 'linear-gradient(135deg, #1a0533 0%, #0a1a3d 50%, #03141f 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 6s ease infinite',
              border: '1px solid rgba(124,58,237,0.35)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(124,58,237,0.15)'
            }}
          >
            {/* Glow orbs */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-30px',
                width: '180px',
                height: '180px',
                background: `radial-gradient(ellipse, ${sphereColor}4D 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-20px',
                width: '140px',
                height: '140px',
                background: 'radial-gradient(ellipse, rgba(6,182,212,0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}
              >
                <StreakBadge count={streak} size="md" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {sphere?.roadmapTitle || 'Маршрут'}
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    {completedCount === 0
                      ? `${sphere?.roadmapTitle} → Начни первый шаг!`
                      : `${completedCount} из ${totalSteps} шагов пройдено`}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--accent-glow)',
                      fontWeight: 600
                    }}
                  >
                    {percent}%
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                    style={{
                      height: '100%',
                      background: 'var(--grad-primary)',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.6)'
                    }}
                  />
                </div>
              </div>

              <motion.button
                onClick={() => navigate(`/step/${currentStepId || 1}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'var(--grad-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
                }}
              >
                <span>▶</span> Продолжить обучение
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ─── Today's Task ─────────────────────────── */}
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <motion.div
            whileHover={{ borderColor: 'rgba(6,182,212,0.5)' }}
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.05) 100%)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              transition: 'border-color 0.3s'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              📅 Задание дня
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0
              }}>
                {currentStep?.icon || '🎯'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                  marginBottom: '6px', lineHeight: 1.3 }}>
                  {currentStep?.title || 'Начни первый урок'}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏱ {currentStep?.duration || '~15 мин'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>+{currentStep?.xp || 40} XP</span>
                </div>
                <motion.button
                  onClick={() => navigate(`/step/${currentStepId || 1}`)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '9px 20px', background: 'var(--grad-primary)', border: 'none',
                    borderRadius: 'var(--radius-md)', color: 'white',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                  }}
                >Начать →</motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Change sphere ──────────────────────────── */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={clearCurrentSphere}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '8px'
            }}
          >
            Сменить сферу обучения
          </button>
          <br />
          <button
            onClick={() => {
              if (window.confirm('Сбросить все данные? Это нельзя отменить.')) resetAll()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(239,68,68,0.5)',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Сбросить все данные
          </button>
        </motion.div>
      </motion.div>
    </PageTransition>
  )
}
