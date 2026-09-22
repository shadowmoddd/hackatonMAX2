import { motion } from 'framer-motion'
import { QUIZ_QUESTIONS, IT_SUBDIRECTIONS } from '../config'

interface QuizStepProps {
  subDirection: string
  questionIndex: number
  totalQuestions: number
  currentAnswer: string
  onAnswerChange: (v: string) => void
  onSubmit: () => void
  onBack: () => void
}

export default function QuizStep({ subDirection, questionIndex, totalQuestions, currentAnswer, onAnswerChange, onSubmit, onBack }: QuizStepProps) {
  const questions = QUIZ_QUESTIONS[subDirection] || []
  const q = questions[questionIndex]
  if (!q) return null

  const subLabel = IT_SUBDIRECTIONS.find(s => s.id === subDirection)?.label
    || (subDirection === 'design' ? 'Дизайн'
      : subDirection === 'video_photo' ? 'Видео и фото'
      : subDirection)

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ padding: '24px 20px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button onClick={onBack} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>← Назад</button>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} style={{ width: '28px', height: '4px', borderRadius: '2px', background: i < questionIndex ? 'var(--accent-primary)' : i === questionIndex ? 'var(--accent-cyan)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{questionIndex + 1}/{totalQuestions}</span>
      </div>

      {/* Tag */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '999px', padding: '4px 12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: 'var(--accent-glow)', fontWeight: 600 }}>🧠 {subLabel}</span>
      </div>

      {/* Question */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}
      >
        <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Вопрос {questionIndex + 1}</div>
        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>{q.q}</p>
      </motion.div>

      {/* Answer */}
      <textarea
        value={currentAnswer}
        onChange={e => onAnswerChange(e.target.value)}
        placeholder="Напиши ответ своими словами..."
        rows={4}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) onSubmit() }}
        style={{ width: '100%', padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', marginBottom: '14px', transition: 'border-color 0.2s' }}
      />

      <motion.button
        onClick={onSubmit}
        disabled={!currentAnswer.trim()}
        whileTap={currentAnswer.trim() ? { scale: 0.97 } : {}}
        style={{ width: '100%', padding: '15px', background: currentAnswer.trim() ? 'var(--grad-primary)' : 'rgba(124,58,237,0.2)', border: 'none', borderRadius: '14px', color: currentAnswer.trim() ? 'white' : 'var(--text-muted)', fontSize: '15px', fontWeight: 700, cursor: currentAnswer.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}
      >
        {questionIndex + 1 < totalQuestions ? 'Следующий вопрос →' : 'Завершить тест →'}
      </motion.button>
    </motion.div>
  )
}
