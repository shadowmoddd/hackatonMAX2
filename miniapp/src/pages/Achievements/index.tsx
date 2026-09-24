import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition, Badge as BadgeComponent } from '@/shared/ui'
import { useAppStore, ACHIEVEMENT_DEFS } from '@/shared/store/appStore'

type Category = 'all' | 'progress' | 'xp'

interface BadgeItem {
  id: string
  title: string
  desc: string
  icon: string
  earned: boolean
  xp: number
  progress: number
  total: number
  category: Category
}

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'progress', label: 'Прогресс' },
  { key: 'xp', label: 'XP' },
]

function getProgress(
  id: string,
  data: {
    xp: number
    completedStepIds: number[]
    streak: number
  }
): number {
  switch (id) {
    case 'first_step':
    case 'three_steps':
    case 'all_done':
      return data.completedStepIds.length

    case 'xp_500':
    case 'xp_1000':
      return data.xp

    case 'streak_7':
      return data.streak

    default:
      return 0
  }
}

function getTotal(id: string): number {
  switch (id) {
    case 'first_step':
      return 1

    case 'three_steps':
      return 3

    case 'all_done':
      return 5

    case 'xp_500':
      return 500

    case 'xp_1000':
      return 1000

    case 'streak_7':
      return 7

    default:
      return 1
  }
}

function getCategory(id: string): Category {
  return id === 'xp_500' || id === 'xp_1000' ? 'xp' : 'progress'
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export default function Achievements() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const {
    earnedAchievements,
    xp,
    completedStepIds,
    streak,
  } = useAppStore()

  const progressData = {
    xp,
    completedStepIds,
    streak,
  }

  const badges: BadgeItem[] = ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    desc: def.desc,
    icon: def.icon,
    earned: earnedAchievements.includes(def.id),
    xp: def.xp,
    progress: getProgress(def.id, progressData),
    total: getTotal(def.id),
    category: getCategory(def.id),
  }))

  const filtered =
    activeCategory === 'all'
      ? badges
      : badges.filter((badge) => badge.category === activeCategory)

  const earnedCount = earnedAchievements.length
  const totalCount = ACHIEVEMENT_DEFS.length

  const pct =
    totalCount > 0
      ? Math.round((earnedCount / totalCount) * 100)
      : 0

  const earnedXp = badges
    .filter((badge) => badge.earned)
    .reduce((sum, badge) => sum + badge.xp, 0)

  const remainingXp = badges
    .filter((badge) => !badge.earned)
    .reduce((sum, badge) => sum + badge.xp, 0)

  return (
    <PageTransition>
      <div className="responsive-page achievements-page">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: '24px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontSize: '42px',
                flexShrink: 0,
              }}
            >
              🏆
            </div>

            <div>
              <h1
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                Достижения
              </h1>

              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginTop: '5px',
                }}
              >
                {earnedCount} из {totalCount} получено
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '7px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                Общий прогресс
              </span>

              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--accent-gold)',
                  fontWeight: 600,
                }}
              >
                {pct}%
              </span>
            </div>

            <div
              style={{
                height: '8px',
                background: 'rgba(245,158,11,0.12)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid rgba(245,158,11,0.15)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut',
                  delay: 0.3,
                }}
                style={{
                  height: '100%',
                  background:
                    'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '5px',
            marginBottom: '22px',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((category) => {
            const active = activeCategory === category.key

            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: active
                    ? 'var(--accent-primary)'
                    : 'var(--border)',
                  background: active
                    ? 'rgba(124,58,237,0.2)'
                    : 'var(--bg-surface)',
                  color: active
                    ? 'var(--accent-glow)'
                    : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: active
                    ? '0 0 12px rgba(124,58,237,0.25)'
                    : 'none',
                }}
              >
                {category.label}
              </button>
            )
          })}
        </motion.div>

        {/* ACHIEVEMENTS GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="achievements-grid"
        >
          {filtered.map((badge, index) => (
            <BadgeComponent
              key={badge.id}
              id={index}
              title={badge.title}
              desc={badge.desc}
              icon={badge.icon}
              earned={badge.earned}
              xp={badge.xp}
              progress={badge.progress}
              total={badge.total}
              delay={index * 0.04}
            />
          ))}
        </motion.div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 16px',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            Нет достижений в этой категории
          </div>
        )}

        {/* XP SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '28px',
            padding: '18px 20px',
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(124,58,237,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span
            style={{
              fontSize: '34px',
              flexShrink: 0,
            }}
          >
            🌟
          </span>

          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              XP за достижения
            </div>

            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                letterSpacing: '-0.02em',
              }}
            >
              {earnedXp} XP
            </div>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              Возможно ещё
            </div>

            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              +{remainingXp} XP
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}