import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '@/shared/ui'
import { useAppStore, ACHIEVEMENT_DEFS } from '@/shared/store/appStore'
import { getSphere } from '@/entities/sphere'

const FORMAT_ICONS: Record<string, string> = { video: '📺', article: '📰', book: '📚', course: '🎓' }
const FORMAT_LABELS: Record<string, string> = { video: 'Видео', article: 'Статьи', book: 'Книги', course: 'Курсы' }

const levelMap: Record<string, { label: string; color: string; desc: string }> = {
  beginner:     { label: 'Новичок',     color: '#10B981', desc: 'Только начинаю путь' },
  elementary:   { label: 'Базовый',     color: '#06B6D4', desc: 'Освоил основы' },
  intermediate: { label: 'Средний',     color: '#7C3AED', desc: 'Уверенный специалист' },
  advanced:     { label: 'Продвинутый', color: '#F59E0B', desc: 'Экспертный уровень' },
}

const dirLabels: Record<string, string> = {
  backend: 'Backend-разработка', frontend: 'Frontend-разработка',
  ml: 'Machine Learning / AI', devops: 'DevOps'
}


export default function Profile() {
  const navigate = useNavigate()
  const {
    sphereId, detectedLevel, subDirection, preferredFormats, xp, streak,
    completedStepIds, earnedAchievements, quizAnswers, sphereProfiles, resetSphereProfile
  } = useAppStore()

  const sphere = getSphere(sphereId || 'it')
  const tgUser = window.WebApp?.initDataUnsafe?.user
  const displayName = tgUser?.username ? `@${tgUser.username}` : (tgUser?.first_name ?? 'Ученик')
  const photoUrl = tgUser?.photo_url ?? null

  const lvl = levelMap[detectedLevel] || levelMap.beginner
  const totalSteps = sphere?.steps.length || 0
  const completedCount = completedStepIds.length
  const percent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0
  const level = Math.floor(xp / 500) + 1
  const onboardedSpheres = Object.entries(sphereProfiles).map(([id, profile]) => ({ id, profile }))

  return (
    <PageTransition>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0a1a3d 100%)', padding: '20px 16px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '180px', height: '180px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>← Назад</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            {photoUrl ? (
              <img src={photoUrl} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(124,58,237,0.6)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: 'white', border: '3px solid rgba(124,58,237,0.6)', flexShrink: 0 }}>
                {displayName.replace('@', '').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{displayName}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${lvl.color}20`, border: `1px solid ${lvl.color}40`, borderRadius: '999px', padding: '3px 10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: lvl.color }}>{lvl.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {lvl.desc}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: '⭐', value: xp, label: 'XP' },
              { icon: '🔥', value: streak, label: 'Стрик' },
              { icon: '✅', value: completedCount, label: 'Шагов' },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>📚 Текущее обучение</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{sphere?.name || 'IT'}</div>
                {subDirection && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{dirLabels[subDirection] || subDirection}</div>}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-glow)' }}>{percent}%</div>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${percent}%`, background: 'var(--grad-primary)', borderRadius: '999px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{completedCount} из {totalSteps} шагов · Уровень {level}</div>
          </motion.div>

          {preferredFormats.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>🎯 Форматы обучения</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {preferredFormats.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '999px', padding: '5px 12px' }}>
                    <span>{FORMAT_ICONS[f] || '📌'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--accent-glow)', fontWeight: 500 }}>{FORMAT_LABELS[f] || f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {quizAnswers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.05) 100%)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>🧠</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Профиль составлен из {quizAnswers.length} ответов</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Маршрут адаптирован под твой уровень «{lvl.label}»</div>
              </div>
            </motion.div>
          )}

          {earnedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>🏆 Достижения ({earnedAchievements.length})</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {earnedAchievements.map(id => {
                  const def = ACHIEVEMENT_DEFS.find(d => d.id === id)
                  if (!def) return null
                  return (
                    <div key={id} title={def.desc} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px', padding: '4px 10px' }}>
                      <span>{def.icon}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>{def.title}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {onboardedSpheres.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>🗺 Пройдены сферы</div>
              {onboardedSpheres.map(({ id, profile }) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{id.replace('it_', '').toUpperCase()}</div>
                  <div style={{ fontSize: '12px', color: levelMap[profile.detectedLevel]?.color || 'var(--text-muted)' }}>{levelMap[profile.detectedLevel]?.label || profile.detectedLevel}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                if (sphereId && window.confirm('Сбросить прогресс и онбординг текущей сферы?')) {
                  resetSphereProfile(sphereId)
                  navigate('/')
                }
              }}
              style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.5)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: '8px' }}
            >
              Сбросить текущую сферу и пройти онбординг заново
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
