import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/shared/store/appStore'
import { QUIZ_QUESTIONS, ANALYSIS_STAGES, IT_SUBDIRECTIONS } from './config'
import { detectLevel } from './lib/detectLevel'
import SphereStep from './ui/SphereStep'
import SubDirectionStep from './ui/SubDirectionStep'
import QuizStep from './ui/QuizStep'
import AnalyzingStep from './ui/AnalyzingStep'
import FormatsStep from './ui/FormatsStep'

type OnboardingStep = 'sphere' | 'subdirection' | 'quiz' | 'analyzing' | 'formats'

export default function Onboarding() {
  const { selectSphere, finishOnboarding, sphereProfiles } = useAppStore()

  const [step, setStep] = useState<OnboardingStep>('sphere')
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [quizKey, setQuizKey] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{ q: string; a: string }[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [analysisStage, setAnalysisStage] = useState(0)
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['video'])
  const [detectedLevel, setDetectedLevel] = useState('beginner')

  // ── Sphere selection ──
  const handleSphereSelect = (sphereId: string) => {
    setSelectedSphere(sphereId)
    const existingProfile = sphereProfiles[sphereId]

    if (existingProfile?.preferredFormats?.length) {
      // Already onboarded for this sphere — restore and go to main app
      selectSphere(sphereId)
      return
    }

    // No profile yet — run full onboarding
    selectSphere(sphereId)
    if (sphereId === 'it') {
      setStep('subdirection')
    } else {
      setQuizKey(sphereId)
      setCurrentQIndex(0)
      setQuizAnswers([])
      setCurrentAnswer('')
      setStep('quiz')
    }
  }

  // ── Sub-direction selection ──
  const handleSubSelect = (subId: string) => {
    setSelectedSub(subId)
    setQuizKey(subId)
    setStep('quiz')
    setCurrentQIndex(0)
    setQuizAnswers([])
    setCurrentAnswer('')
  }

  // ── Quiz answer submission ──
  const handleQuizAnswer = () => {
    if (!currentAnswer.trim() || !quizKey) return
    const questions = QUIZ_QUESTIONS[quizKey] || []
    const newAnswers = [...quizAnswers, { q: questions[currentQIndex].q, a: currentAnswer.trim() }]
    setQuizAnswers(newAnswers)
    setCurrentAnswer('')

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(i => i + 1)
    } else {
      // All answered — build hints map and detect level
      const hintsMap: Record<string, string[]> = {}
      questions.forEach(q => { hintsMap[q.q] = q.hints })
      const level = detectLevel(newAnswers, hintsMap)
      setDetectedLevel(level)
      setStep('analyzing')
      runAnalysis(newAnswers, level)
    }
  }

  // ── Analysis animation ──
  const runAnalysis = (_answers: { q: string; a: string }[], _level: string) => {
    let i = 0
    const tick = () => {
      if (i < ANALYSIS_STAGES.length - 1) {
        i++
        setAnalysisStage(i)
        setTimeout(tick, ANALYSIS_STAGES[i].duration)
      } else {
        // Done — go to format selection
        setTimeout(() => {
          setStep('formats')
        }, 600)
      }
    }
    setTimeout(tick, ANALYSIS_STAGES[0].duration)
  }

  // ── Format toggle ──
  const toggleFormat = (fmtId: string) => {
    setSelectedFormats(prev =>
      prev.includes(fmtId) ? (prev.length > 1 ? prev.filter(f => f !== fmtId) : prev) : [...prev, fmtId]
    )
  }

  // ── Finish onboarding ──
  const handleFinish = () => {
    finishOnboarding(selectedSub, selectedFormats, detectedLevel, quizAnswers)
  }

  // ── Render by step ──
  return (
    <div className="onboarding-shell">
      <AnimatePresence mode="wait">
        {step === 'sphere' && (
          <SphereStep key="sphere" sphereProfiles={sphereProfiles} onSelect={handleSphereSelect} />
        )}
        {step === 'subdirection' && (
          <SubDirectionStep key="sub" onSelect={handleSubSelect} onBack={() => setStep('sphere')} />
        )}
        {step === 'quiz' && quizKey && (
          <QuizStep
            key={`quiz-${quizKey}`}
            subDirection={quizKey}
            questionIndex={currentQIndex}
            totalQuestions={QUIZ_QUESTIONS[quizKey]?.length || 3}
            currentAnswer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
            onSubmit={handleQuizAnswer}
            onBack={() => selectedSphere === 'it' ? setStep('subdirection') : setStep('sphere')}
          />
        )}
        {step === 'analyzing' && (
          <AnalyzingStep key="analyzing" stageIndex={analysisStage} stages={ANALYSIS_STAGES} detectedLevel={detectedLevel} />
        )}
        {step === 'formats' && (
          <FormatsStep
            key="formats"
            selectedFormats={selectedFormats}
            onToggle={toggleFormat}
            onFinish={handleFinish}
            detectedLevel={detectedLevel}
            subDirection={selectedSub}
            profileLabel={
              selectedSub
                ? IT_SUBDIRECTIONS.find(s => s.id === selectedSub)?.label
                : selectedSphere === 'design'
                  ? 'Дизайн'
                  : selectedSphere === 'video_photo'
                    ? 'Видео и фото'
                    : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
