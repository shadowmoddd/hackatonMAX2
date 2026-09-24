import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition, XPBar, StreakBadge } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere } from '@/entities/sphere'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
}

export default function Dashboard() {
  const navigate = useNavigate()

  const {
    sphereId,
    xp,
    streak,
    completedStepIds,
    currentStepId,
    resetAll,
    clearCurrentSphere,
    detectedLevel,
    subDirection,
  } = useAppStore()

  const sphere = getSphere(sphereId || 'it')

  const currentStep = sphere?.steps.find(
    (step) => step.id === (currentStepId || 1)
  )

  // MAX user info
  const maxUser = window.WebApp?.initDataUnsafe?.user

  const displayName = maxUser?.username
    ? `@${maxUser.username}`
    : (maxUser?.first_name ?? 'Ученик')

  const photoUrl =
    maxUser?.photo_url ??
    maxUser?.avatar_url ??
    null

  const totalSteps = sphere?.steps.length || 0
  const completedCount = completedStepIds.length

  const percent =
    totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0

  const level = Math.floor(xp / 500) + 1
  const levelXpCurrent = xp % 500

  const levelInfo: Record<
    string,
    {
      label: string
      color: string
    }
  > = {
    beginner: {
      label: 'Новичок',
      color: '#10B981',
    },
    elementary: {
      label: 'Базовый',
      color: '#06B6D4',
    },
    intermediate: {
      label: 'Средний',
      color: '#7C3AED',
    },
    advanced: {
      label: 'Продвинутый',
      color: '#F59E0B',
    },
  }

  const currentLevelInfo =
    levelInfo[detectedLevel] ||
    levelInfo.beginner

  const sphereColor =
    sphere?.color || '#7C3AED'

  return (
    <PageTransition>
      <motion.div
        className="dashboard-page responsive-page"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="dashboard-header"
        >
          <div
            className="dashboard-user"
            onClick={() => navigate('/profile')}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="avatar"
                className="dashboard-avatar"
              />
            ) : (
              <div className="dashboard-avatar dashboard-avatar--fallback">
                {displayName
                  .replace('@', '')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="dashboard-user-info">
              <div className="dashboard-user-name">
                {displayName} 👋
              </div>

              <div className="dashboard-user-subtitle">
                {sphere?.name ||
                  'Продолжай в том же духе!'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            XP BAR
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="dashboard-section"
        >
          <XPBar
            current={levelXpCurrent}
            max={500}
            level={level}
            levelName={
              level === 1
                ? 'Новичок'
                : level === 2
                  ? 'Ученик'
                  : 'Мастер'
            }
          />
        </motion.div>

        {/* =====================================================
            LEARNING PROFILE
        ===================================================== */}

        {detectedLevel && (
          <motion.div
            variants={itemVariants}
            className="dashboard-section"
          >
            <div
              onClick={() => navigate('/profile')}
              className="dashboard-profile-mini"
            >
              <div
                className="dashboard-profile-icon"
                style={{
                  background: `${currentLevelInfo.color}20`,
                  border: `1px solid ${currentLevelInfo.color}40`,
                }}
              >
                🎓
              </div>

              <div className="dashboard-profile-content">
                <div className="dashboard-profile-title-row">
                  <span
                    style={{
                      color: currentLevelInfo.color,
                    }}
                    className="dashboard-profile-level"
                  >
                    {currentLevelInfo.label}
                  </span>

                  {subDirection && (
                    <span className="dashboard-profile-dot">
                      ·
                    </span>
                  )}

                  {subDirection && (
                    <span className="dashboard-profile-direction">
                      {subDirection === 'backend'
                        ? 'Backend'
                        : subDirection === 'frontend'
                          ? 'Frontend'
                          : subDirection === 'ml'
                            ? 'ML / AI'
                            : subDirection === 'devops'
                              ? 'DevOps'
                              : subDirection}
                    </span>
                  )}
                </div>

                <div className="dashboard-profile-hint">
                  Нажми чтобы открыть профиль →
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            CAREER PATH
        ===================================================== */}

        {sphere?.careerPath && (
          <motion.div
            variants={itemVariants}
            className="dashboard-section"
          >
            <div className="dashboard-career-card">
              <div className="dashboard-section-label">
                Карьерный маршрут
              </div>

              <div className="dashboard-career-main">
                <div>
                  <div className="dashboard-career-role">
                    {sphere.careerPath.roles[0]}
                  </div>

                  <div className="dashboard-career-salary">
                    {sphere.careerPath.salaryRange}
                  </div>
                </div>

                <div className="dashboard-career-time">
                  <div className="dashboard-career-time-label">
                    до работы
                  </div>

                  <div className="dashboard-career-time-value">
                    {sphere.careerPath.timeToJob}
                  </div>
                </div>
              </div>

              <div className="dashboard-skills">
                {sphere.careerPath.topSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="dashboard-skill"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

              <div className="dashboard-hiring">
                Нанимают:{' '}
                {sphere.careerPath.companiesHiring.join(
                  ' · '
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            STREAK HERO
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="dashboard-section"
        >
          <div
            className="dashboard-streak-card"
            style={{
              background:
                'linear-gradient(135deg, #1a0533 0%, #0a1a3d 50%, #03141f 100%)',
              boxShadow:
                '0 0 40px rgba(124,58,237,0.15)',
            }}
          >
            {/* Glow */}
            <div
              className="dashboard-glow dashboard-glow--top"
              style={{
                background: `radial-gradient(ellipse, ${sphereColor}4D 0%, transparent 70%)`,
              }}
            />

            <div className="dashboard-glow dashboard-glow--bottom" />

            <div className="dashboard-streak-content">
              <div className="dashboard-streak-header">
                <StreakBadge
                  count={streak}
                  size="md"
                />

                <span className="dashboard-roadmap-title">
                  {sphere?.roadmapTitle ||
                    'Маршрут'}
                </span>
              </div>

              {/* Progress */}
              <div className="dashboard-progress">
                <div className="dashboard-progress-header">
                  <span className="dashboard-progress-text">
                    {completedCount === 0
                      ? `${sphere?.roadmapTitle} → Начни первый шаг!`
                      : `${completedCount} из ${totalSteps} шагов пройдено`}
                  </span>

                  <span className="dashboard-progress-percent">
                    {percent}%
                  </span>
                </div>

                <div className="dashboard-progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${percent}%`,
                    }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeOut',
                      delay: 0.4,
                    }}
                    className="dashboard-progress-fill"
                  />
                </div>
              </div>

              {/* Continue */}
              <motion.button
                onClick={() =>
                  navigate(
                    `/step/${currentStepId || 1}`
                  )
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="dashboard-primary-button"
              >
                <span>▶</span>
                Продолжить обучение
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            TODAY'S TASK
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="dashboard-section"
        >
          <motion.div
            whileHover={{
              borderColor:
                'rgba(6,182,212,0.5)',
            }}
            className="dashboard-task-card"
          >
            <div className="dashboard-section-label">
              📅 Задание дня
            </div>

            <div className="dashboard-task-content">
              <div className="dashboard-task-icon">
                {currentStep?.icon || '🎯'}
              </div>

              <div className="dashboard-task-info">
                <div className="dashboard-task-title">
                  {currentStep?.title ||
                    'Начни первый урок'}
                </div>

                <div className="dashboard-task-meta">
                  <span>
                    ⏱{' '}
                    {currentStep?.duration ||
                      '~15 мин'}
                  </span>

                  <span className="dashboard-task-xp">
                    +{currentStep?.xp || 40} XP
                  </span>
                </div>

                <motion.button
                  onClick={() =>
                    navigate(
                      `/step/${currentStepId || 1}`
                    )
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="dashboard-task-button"
                >
                  Начать →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =====================================================
            FOOTER ACTIONS
        ===================================================== */}

        <motion.div
          variants={itemVariants}
          className="dashboard-actions"
        >
          <button
            onClick={clearCurrentSphere}
            className="dashboard-change-button"
          >
            Сменить сферу обучения
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Сбросить все данные? Это нельзя отменить.'
                )
              ) {
                resetAll()
              }
            }}
            className="dashboard-reset-button"
          >
            Сбросить все данные
          </button>
        </motion.div>
      </motion.div>
    </PageTransition>
  )
}