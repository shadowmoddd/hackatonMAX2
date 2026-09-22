import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere, getStep, type StepMaterial } from '@/entities/sphere'
import { findCuratedMaterials, findMoreByFormat } from '@/entities/sphere/materialDatabase'
import { generateLevelHint, extractYouTubeId, detectVideoSource } from './lib/levelHints'
import { generateSmartHint, rankBdMaterials, type MaterialSuggestion } from '@/shared/lib/groqChat'
import VideoCard from './ui/VideoCard'
import ArticleCard from './ui/ArticleCard'
import QuizCard from './ui/QuizCard'
import ArticleModal from './ui/ArticleModal'
import ArticlePreviewModal from './ui/ArticlePreviewModal'
import VideoPlayer from './ui/VideoPlayer'
import MoreMaterialsMenu from './ui/MoreMaterialsMenu'
import DocsModal from './ui/DocsModal'
import Toast from '@/shared/ui/Toast'
import { getDocsForSphere } from '@/data/docsDatabase'

export default function StepPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [completed, setCompleted] = useState(false)
  const [articleModal, setArticleModal] = useState<{ title: string; content: string[]; articleUrl?: string } | null>(null)
  const [articlePreview, setArticlePreview] = useState<{ title: string; source: string; url: string; description: string } | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)
  const [playingSearchQuery, setPlayingSearchQuery] = useState<string | null>(null)
  const [playingVideoTitle, setPlayingVideoTitle] = useState<string>('')
  const [aiHint, setAiHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const hintFetchedRef = useRef(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  // AI-ранжирование материалов под конкретный шаг
  const [aiRankedMaterials, setAiRankedMaterials] = useState<StepMaterial[] | null>(null)
  const materialsRankRef = useRef(false)

  const { sphereId, completedStepIds, detectedLevel, stepQuizResults } = useAppStore()
  const preferredFormats = useAppStore((s) => s.preferredFormats)
  const completeStep = useAppStore((s) => s.completeStep)
  const addMaterialXp = useAppStore((s) => s.addMaterialXp)
  const addExtraMaterials = useAppStore((s) => s.addExtraMaterials)
  const extraStepMaterials = useAppStore((s) => s.extraStepMaterials)

  const stepId = parseInt(id || '1')
  const sphere = getSphere(sphereId || 'it')
  const step = getStep(sphereId || 'it', stepId)
  const nextStep = sphere?.steps.find((s) => s.order === (step?.order || 0) + 1)

  const alreadyCompleted = completedStepIds.includes(stepId)

  const quizKey = `${sphereId || 'it'}_${stepId}`
  const quizResult = stepQuizResults[quizKey]

  // ── AI-советник: генерируем уникальный персональный совет при каждом открытии ──
  const weakTopicsForHint = quizResult?.weakTopics ?? []

  // Баг 1: сброс ref при изменении weakTopics чтобы хинт перегенерировался
  useEffect(() => {
    hintFetchedRef.current = false  // сброс при изменении deps
  }, [weakTopicsForHint.join(',')]) // eslint-disable-line

  useEffect(() => {
    if (hintFetchedRef.current || !step) return
    hintFetchedRef.current = true
    setHintLoading(true)

    // Groq генерирует каждый раз — никакого кеша, всегда уникальный текст
    generateSmartHint(step.title, step.skills, detectedLevel, weakTopicsForHint)
      .then(hint => setAiHint(hint))
      .catch(() => {
        setAiHint(generateLevelHint(step.title, step.skills, detectedLevel, stepId, weakTopicsForHint))
        // Toast: сообщаем что совет фиксированный
        setToastMsg('💡 Совет сгенерирован без ИИ — нет сети или кончились токены')
        setToastVisible(true)
      })
      .finally(() => setHintLoading(false))
  }, [step, sphereId, stepId, detectedLevel, weakTopicsForHint.join(',')]) // eslint-disable-line

  const weakTopicsForCorrection = quizResult?.weakTopics ?? []

  // Фильтр по форматам пользователя
  const matchesFormat = (type: string) => {
    if (!preferredFormats.length) return true
    if (type === 'video') return preferredFormats.includes('video') || preferredFormats.includes('course')
    if (type === 'article') return preferredFormats.includes('article') || preferredFormats.includes('book')
    return false
  }

  const stepQuizMats = (step?.materials ?? []).filter(m => m.type === 'quiz')

  // ── Уровень 1: БД с прямыми ссылками — всегда первая ──
  const allSphereSteps = (sphere?.steps ?? []).map(s => ({ id: s.id, title: s.title, skills: s.skills }))
  const curatedRaw = findCuratedMaterials(
    quizKey, detectedLevel, weakTopicsForCorrection,
    step?.title, step?.skills, stepId, allSphereSteps
  )
  const curatedAsStep: StepMaterial[] = curatedRaw
    .filter(c => matchesFormat(c.type))
    .map((c, i) => ({
      id: `curated_${i}`,
      type: c.type as 'video' | 'article' | 'quiz',
      title: c.title,
      xp: c.xp,
      duration: c.duration,
      source: c.source,
      ...(c.type === 'video' ? { videoUrl: c.url } : { articleUrl: c.url }),
    }))

  // ── AI-ранжирование: Groq смотрит на название шага и выбирает лучшие из БД ──
  useEffect(() => {
    if (materialsRankRef.current || !step) return
    materialsRankRef.current = true
    let cancelled = false  // защита от обновления unmounted компонента

    const spherePrefix = (sphereId || 'it').replace(/_\d+$/, '')
    // Широкий пул из БД — оба формата, чтобы Groq выбирал из большего набора
    const poolVideo = findMoreByFormat(spherePrefix, detectedLevel, 'video', [], 6, weakTopicsForCorrection, step.title)
    const poolArticle = findMoreByFormat(spherePrefix, detectedLevel, 'article', [], 6, weakTopicsForCorrection, step.title)
    const pool = [...poolVideo, ...poolArticle]

    if (pool.length < 2) return  // слишком мало материалов — оставляем curatedAsStep

    rankBdMaterials(
      pool.map(m => ({ title: m.title, topics: m.topics, type: m.type })),
      step.title,
      step.skills,
      weakTopicsForCorrection,
      detectedLevel
    ).then(rankedIndices => {
      if (cancelled) return  // пользователь ушёл с шага пока Groq отвечал

      const ranked: StepMaterial[] = rankedIndices
        .slice(0, 6)
        .map(idx => pool[idx])
        .filter((m): m is NonNullable<typeof m> => !!m)  // защита от undefined
        .filter(m => {
          if (!preferredFormats.length) return true
          if (m.type === 'video') return preferredFormats.includes('video') || preferredFormats.includes('course')
          if (m.type === 'article') return preferredFormats.includes('article') || preferredFormats.includes('book')
          return false
        })
        .slice(0, 3)
        .map((c, i) => ({
          id: `ranked_${i}`,
          type: c.type as 'video' | 'article' | 'quiz',
          title: c.title,
          xp: c.xp,
          duration: c.duration,
          source: c.source,
          ...(c.type === 'video' ? { videoUrl: c.url } : { articleUrl: c.url }),
        }))

      if (ranked.length >= 1) setAiRankedMaterials(ranked)
    }).catch(() => {/* тихий фейл — остаётся curatedAsStep без уведомления */})

    return () => { cancelled = true }
  }, [stepId, sphereId, detectedLevel, weakTopicsForCorrection.join(',')]) // eslint-disable-line

  // Сброс AI-ранжирования при смене шага
  useEffect(() => {
    materialsRankRef.current = false
    setAiRankedMaterials(null)
  }, [stepId, sphereId])


  // Используем Groq-ранжированные если готовы, иначе — BD
  const primaryFromDb = aiRankedMaterials ?? curatedAsStep

  // ── Уровень 2: searchQuery (spheres.ts) — только если БД дала < 2 материалов ──
  const sphereStepMats = (step?.materials ?? [])
    .filter(m => m.type !== 'quiz' && matchesFormat(m.type))
    .filter(m => !primaryFromDb.some(c => c.title === m.title))

  const needsSupplements = primaryFromDb.length < 2
  const supplements = needsSupplements
    ? sphereStepMats.slice(0, 3 - primaryFromDb.length)
    : []

  const allMaterials: StepMaterial[] = [
    ...primaryFromDb,   // БД + Groq-ранжирование (прямые ссылки)
    ...supplements,     // searchQuery только если БД недостаточно
    ...stepQuizMats,
  ]

  // Дополнительные материалы запрошенные кнопкой «Хочу больше»
  const extraForStep = extraStepMaterials[quizKey]?.materials ?? []
  const extraAsStep: StepMaterial[] = extraForStep.map((s, i) => ({
    id: `extra_${i}`,
    type: (s.type === 'book' ? 'article' : s.type) as 'video' | 'article' | 'quiz',
    title: s.title,
    xp: 25,
    duration: s.duration,
    source: s.platform,
    ...(s.type === 'video'
      ? { videoUrl: (s.fromDb && s.url) ? s.url : undefined, searchQuery: (!s.fromDb || !s.url) ? s.title + ' на русском' : undefined }
      : { articleUrl: s.url || '' }),
  }))

  const allMaterialsWithExtra: StepMaterial[] = [
    ...allMaterials.filter(m => !extraAsStep.some(e => e.title === m.title)),
    ...extraAsStep,
  ]

  const nonQuiz = allMaterialsWithExtra.filter(m => m.type !== 'quiz')
  const quizMaterials = allMaterialsWithExtra.filter(m => m.type === 'quiz')
  const finalMaterials = [...nonQuiz, ...quizMaterials]

  const formatFilterActive = false
  const hasHiddenMaterials = false

  if (!step) {
    return (
      <PageTransition>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '16px',
            padding: '20px'
          }}
        >
          <div style={{ fontSize: '48px' }}>❓</div>
          <div
            style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}
          >
            Шаг не найден
          </div>
          <button
            onClick={() => navigate('/tree')}
            style={{
              padding: '12px 24px',
              background: 'var(--grad-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Вернуться к маршруту
          </button>
        </div>
      </PageTransition>
    )
  }

  const handleComplete = () => {
    if (!step) return
    if (!alreadyCompleted) {
      completeStep(step.id, nextStep?.id ?? null, step.xp, step.title, 'video')
    }
    setCompleted(true)
    setTimeout(() => navigate('/tree'), 1800)
  }


  const handleMaterialStart = (mat: StepMaterial) => {
    if (mat.type === 'video') {
      addMaterialXp('video', mat.xp)
      setPlayingVideoTitle(mat.title)
      // detectVideoSource определяет YouTube / RuTube / прямой файл / поиск
      const src = mat.videoId
        ? { type: 'youtube' as const, id: mat.videoId }
        : detectVideoSource(mat.videoUrl, mat.searchQuery || mat.title + ' на русском')
      if (src.type === 'youtube') {
        setPlayingVideoId(src.id)
        setPlayingVideoUrl(null)
        setPlayingSearchQuery(null)
      } else if (src.type === 'rutube' || src.type === 'direct') {
        setPlayingVideoId(null)
        setPlayingVideoUrl(src.type === 'rutube' ? `https://rutube.ru/play/embed/${src.id}/` : src.url)
        setPlayingSearchQuery(null)
      } else {
        setPlayingVideoId(null)
        setPlayingVideoUrl(null)
        setPlayingSearchQuery((src as { type: 'search'; query: string }).query)
      }
      setShowPlayer(true)
    } else if (mat.type === 'article') {
      addMaterialXp('article', mat.xp)
      if (mat.articleContent) {
        setArticleModal({ title: mat.title, content: mat.articleContent, articleUrl: mat.articleUrl })
      } else {
        setArticlePreview({
          title: mat.title,
          source: (mat as any).source || '',
          url: mat.articleUrl || '',
          description: (mat as any).description || '',
        })
      }
    } else if (mat.type === 'quiz') {
      navigate(`/quiz/${step.id}`)
    }
  }

  const handleRequestMore = async (format: 'video' | 'article' | 'book') => {
    if (!step || !sphere) return
    setMoreLoading(true)

    const existingUrls = allMaterialsWithExtra
      .map(m => (m as any).videoUrl || (m as any).articleUrl || '')
      .filter(Boolean)
    const spherePrefix = (sphereId || 'it').replace(/_\d+$/, '')
    const weakTopics = quizResult?.weakTopics ?? []

    // 1. Берём широкий список из БД (до 8 материалов, фильтруем по теме шага)
    const dbMats = findMoreByFormat(spherePrefix, detectedLevel, format, existingUrls, 8, weakTopics, step.title)

    let finalSuggestions: MaterialSuggestion[] = []

    if (dbMats.length > 0) {
      // 2. Groq ранжирует БД-материалы под конкретного пользователя
      const rankedIndices = await rankBdMaterials(
        dbMats.map(m => ({ title: m.title, topics: m.topics, type: m.type })),
        step.title, step.skills, weakTopics, detectedLevel
      )
      // 3. Берём топ-3 по рейтингу Groq
      finalSuggestions = rankedIndices.slice(0, 3).map(idx => ({
        title: dbMats[idx].title,
        platform: dbMats[idx].source,
        type: dbMats[idx].type as 'video' | 'article' | 'book',
        duration: dbMats[idx].duration,
        why: '',
        url: dbMats[idx].url,  // прямая ссылка из БД
        fromDb: true,
      }))
    }

    // 4. Если БД не дала достаточно — помечаем остаток как DDG
    if (finalSuggestions.length < 2) {
      const searchQuery = `${step.title} ${format === 'video' ? 'YouTube' : 'Habr'} бесплатно`
      finalSuggestions.push({
        title: `Поиск: ${step.title}`,
        platform: format === 'video' ? 'YouTube' : 'Habr/Google',
        type: format,
        duration: '—',
        why: `Результат поиска по запросу «${step.title}»`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(step.title + ' на русском')}`,
        fromDb: false,  // ← DDG/поиск, не из БД
      })
    }

    addExtraMaterials(quizKey, format, finalSuggestions.slice(0, 3))
    setMoreLoading(false)
    setShowMoreMenu(false)
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
        {/* Hero section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a0533 0%, #0a1a3d 60%, #031418 100%)',
            padding: '20px 16px 28px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Glow orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-40px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-20px',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(ellipse, rgba(6,182,212,0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Back button + step counter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Назад
              </button>
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                Шаг {step.order} из {sphere?.steps.length || step.order}
              </span>
            </div>

            {/* Icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '72px',
                height: '72px',
                background: 'var(--grad-primary)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '16px',
                boxShadow: '0 0 32px rgba(124,58,237,0.5)'
              }}
            >
              {step.icon}
            </motion.div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                marginBottom: '12px'
              }}
            >
              {step.title}
            </h1>

            {/* Meta row */}
            <div
              style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '14px' }}>⏱</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {step.duration}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '14px' }}>📊</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {step.difficulty}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(245,158,11,0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(245,158,11,0.25)'
                }}
              >
                <span style={{ fontSize: '14px' }}>⭐</span>
                <span
                  style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600 }}
                >
                  +{step.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 16px' }}>
          {/* Персональная адаптация курса */}
          {quizResult?.weakTopics?.length > 0 && curatedAsStep.length > 0 && (
            <section style={{ marginBottom: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-glow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Курс адаптирован под твои пробелы
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  По результатам квиза подобраны дополнительные материалы по темам: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{quizResult.weakTopics.slice(0, 3).join(', ')}</span>. Они выделены ниже.
                </div>
              </div>
            </section>
          )}

          {/* Why this step */}
          <section style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              Зачем этот шаг?
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px'
              }}
            >
              {step.why}
            </p>
          </section>

          {/* Level-specific hint — always shown, dynamically generated */}
          {detectedLevel && (
            <section style={{ marginBottom: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 100%)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{hintLoading ? '⏳' : '💡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-glow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {weakTopicsForHint.length > 0 ? 'Персональный совет по твоим пробелам' : 'Совет для твоего уровня'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {hintLoading
                      ? <span style={{ opacity: 0.5 }}>ИИ анализирует твой уровень...</span>
                      : (aiHint || generateLevelHint(step.title, step.skills, detectedLevel, stepId, quizResult?.weakTopics))
                    }
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Skills */}
          <section style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              Навыки
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {step.skills.map((skill) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '5px 12px',
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    color: 'var(--accent-glow)',
                    fontWeight: 500,
                    fontFamily: 'monospace'
                  }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Materials */}
          <section style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              Материалы
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {hasHiddenMaterials && (
              <div style={{
                fontSize: '12px', color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span>🎯</span> Показаны материалы твоих форматов. Остальные скрыты согласно настройкам.
              </div>
            )}

            {formatFilterActive && (
              <div style={{
                fontSize: '13px', color: 'var(--text-secondary)',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '12px',
                textAlign: 'center'
              }}>
                📚 Для этого шага материалов в выбранном формате пока нет.<br />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Показаны все доступные материалы.</span>
              </div>
            )}

            {extraForStep.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-glow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✨</span> По вашему запросу — ИИ подобрал из базы
                </div>
                {/* DDG-предупреждение если есть не-BD материалы */}
                {extraForStep.some(m => !m.fromDb) && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ⚠️ Часть материалов подобрана через поиск (DuckDuckGo) — ссылки могут не открываться
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {finalMaterials.map((material) => {
                if (material.type === 'video') {
                  return (
                    <VideoCard
                      key={material.id}
                      material={material}
                      onStart={() => handleMaterialStart(material)}
                    />
                  )
                }
                if (material.type === 'article') {
                  return (
                    <ArticleCard
                      key={material.id}
                      material={material}
                      onStart={() => handleMaterialStart(material)}
                    />
                  )
                }
                return (
                  <QuizCard
                    key={material.id}
                    material={material}
                    onStart={() => handleMaterialStart(material)}
                  />
                )
              })}
            </div>

            {/* Кнопка «Хочу больше» */}
            <motion.button
              onClick={() => setShowMoreMenu(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '13px',
                background: 'transparent',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-glow)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              📚 Хочу больше материалов
            </motion.button>

            <motion.button
              onClick={() => setShowDocs(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '13px',
                background: 'transparent',
                border: '1px solid rgba(147,51,234,0.35)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-cyan)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              📖 Документация
            </motion.button>
          </section>
        </div>
      </div>

      {/* Bottom sticky panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '72px',
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: 'rgba(11,15,46,0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          zIndex: 50
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {completed || alreadyCompleted ? (
              <motion.div
                key="completed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '14px',
                  color: 'var(--success)',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✅ Шаг завершён! +{step.xp} XP получено
              </motion.div>
            ) : (
              <motion.button
                key="actions"
                onClick={handleComplete}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--grad-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 20px rgba(255,1,99,0.4)'
                }}
              >
                ✅ Завершить шаг
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px'
                }}>
                  +{step.xp} XP
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {articleModal && (
          <ArticleModal
            data={articleModal}
            onClose={() => setArticleModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Article Preview Modal */}
      <AnimatePresence>
        {articlePreview && (
          <ArticlePreviewModal
            data={articlePreview}
            onClose={() => setArticlePreview(null)}
          />
        )}
      </AnimatePresence>

      {/* In-App Video Player Overlay */}
      {showPlayer && (
        <VideoPlayer
          title={playingVideoTitle}
          videoId={playingVideoId}
          videoUrl={playingVideoUrl}
          searchQuery={playingSearchQuery}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* More Materials Menu */}
      <AnimatePresence>
        {showMoreMenu && (
          <MoreMaterialsMenu
            onSelect={handleRequestMore}
            onClose={() => setShowMoreMenu(false)}
            loading={moreLoading}
          />
        )}
      </AnimatePresence>

      {/* Docs Modal */}
      <AnimatePresence>
        {showDocs && (
          <DocsModal
            docs={getDocsForSphere(sphereId || 'it_backend')}
            onClose={() => setShowDocs(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast — уведомление сверху */}
      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type="warn"
        durationMs={4000}
      />
    </PageTransition>
  )
}
