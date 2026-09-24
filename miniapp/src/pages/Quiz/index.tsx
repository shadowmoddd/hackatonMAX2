import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere, getStep, STEP_QUIZ_QUESTIONS } from '@/entities/sphere'
import { generateCourseCorrection, evaluateAnswersSemantically } from '@/shared/lib/groqChat'

function extractTopic(q: string): string {
  return q
    .replace(/^[🟢🟡🔴]\s*/, '')
    .replace(/[?!].*$/, '')
    .replace(/^(Что такое |Для чего нужен[а]? |Чем .+ отличается от |Как работает |Зачем нужен[а]? |Объясни )/i, '')
    .split(' ')
    .slice(0, 5)
    .join(' ')
    .trim()
}

export default function Quiz() {
  const navigate = useNavigate()
  const { stepId } = useParams()

  const sphereId = useAppStore(s => s.sphereId)
  const detectedLevel = useAppStore(s => s.detectedLevel)
  const recordQuizResult = useAppStore(s => s.recordQuizResult)

  const quizKey = `${sphereId}_${stepId}`
  const questions =
    STEP_QUIZ_QUESTIONS[quizKey] ||
    STEP_QUIZ_QUESTIONS['it_3']

  const stepNum = parseInt(stepId || '1')
  const sphere = getSphere(sphereId || 'it')
  const step = getStep(sphereId || 'it', stepNum)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  const resultsRef = useRef<
    {
      q: string
      a: string
      correct: boolean
      keywordScore: number
    }[]
  >([])

  const [correctionState, setCorrectionState] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle')

  const [correctionText, setCorrectionText] = useState('')
  const [evaluating, setEvaluating] = useState(false)

  const current = questions[currentIndex]
  const total = questions.length

  const checkAnswer = () => {
    if (!answer.trim()) return

    const lower = answer.trim().toLowerCase()

    const keywordMatches = current.hint.filter(h =>
      lower.includes(h)
    ).length

    const totalHints = current.hint.length
    const answerLength = answer.trim().length

    const keywordScore =
      keywordMatches / Math.max(totalHints, 1)

    const correct =
      keywordScore >= 0.3 ||
      (keywordMatches >= 1 && answerLength > 60) ||
      (keywordScore === 0 && answerLength > 150)

    const confidence =
      keywordScore >= 0.6
        ? 'high'
        : keywordScore >= 0.3
          ? 'medium'
          : 'low'

    const feedbackText = correct
      ? confidence === 'high'
        ? `✅ Отлично! Упомянул ${keywordMatches} ключевых понятий.`
        : `✅ Верно. Для полного ответа можно добавить: ${current.hint
            .filter(h => !lower.includes(h))
            .slice(0, 2)
            .join(', ')}`
      : `💡 Не совсем. Ключевые понятия: ${current.hint
          .slice(0, 3)
          .map(h => `«${h}»`)
          .join(', ')}`

    resultsRef.current.push({
      q: current.question,
      a: answer.trim(),
      correct,
      keywordScore,
    })

    setIsCorrect(correct)
    setFeedback(feedbackText)

    if (correct) {
      setXpEarned(prev => prev + 15)
      setCorrectCount(prev => prev + 1)
    } else {
      setWeakTopics(prev => {
        const topic = extractTopic(current.question)

        return prev.includes(topic)
          ? prev
          : [...prev, topic]
      })
    }
  }

  const nextQuestion = async () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(i => i + 1)
      setAnswer('')
      setFeedback(null)
      setIsCorrect(null)
      return
    }

    setEvaluating(true)

    let finalResults = [...resultsRef.current]

    try {
      const qaPairs = finalResults.map((r, i) => ({
        q: r.q,
        a: r.a,
        hintKeywords: questions[i]?.hint ?? [],
      }))

      const semanticResults =
        await evaluateAnswersSemantically(qaPairs)

      finalResults = finalResults.map((r, i) => {
        const sem = semanticResults.find(
          s => s.index === i
        )

        if (!sem) return r

        return {
          ...r,
          correct: sem.correct,
          keywordScore: Math.max(
            r.keywordScore,
            sem.score
          ),
        }
      })

      resultsRef.current = finalResults
    } catch {
      // Если семантическая оценка не сработала,
      // используем keyword-результаты.
    }

    setEvaluating(false)

    const finalWeak = finalResults
      .filter(r => !r.correct)
      .map(r => extractTopic(r.q))
      .filter(
        (v, i, a) => a.indexOf(v) === i
      )

    const topicScores: Record<string, number> = {}

    finalResults.forEach(r => {
      topicScores[extractTopic(r.q)] =
        r.keywordScore
    })

    const finalCorrect =
      finalResults.filter(r => r.correct).length

    recordQuizResult(
      quizKey,
      finalWeak,
      finalCorrect,
      total,
      topicScores
    )

    setWeakTopics(finalWeak)
    setCorrectCount(finalCorrect)
    setFinished(true)
  }

  const handleCourseCorrection = async () => {
    if (!step || !sphere) {
      setCorrectionState('error')
      return
    }

    setCorrectionState('loading')

    const scores: Record<string, number> = {}

    resultsRef.current.forEach(r => {
      scores[extractTopic(r.q)] =
        r.keywordScore
    })

    const finalCorrect =
      resultsRef.current.filter(
        r => r.correct
      ).length

    recordQuizResult(
      quizKey,
      weakTopics,
      finalCorrect,
      total,
      scores
    )

    try {
      const correction =
        await generateCourseCorrection(
          weakTopics.length > 0
            ? weakTopics
            : ['общие темы шага'],
          step.title,
          step.skills,
          sphere.name,
          detectedLevel,
          scores,
          resultsRef.current
        )

      setCorrectionText(correction.text)
      setCorrectionState('done')
    } catch {
      const wrongAnswers =
        resultsRef.current.filter(
          r => !r.correct
        )

      const mainTopic =
        weakTopics[0] || step.title

      const wrongText =
        wrongAnswers[0]
          ? `твой ответ «${wrongAnswers[0].a.slice(
              0,
              50
            )}...»`
          : ''

      setCorrectionText(
        `• ${
          wrongText
            ? `В ответе ${wrongText} не хватило ключевых понятий по теме «${mainTopic}»`
            : `Разбери тему «${mainTopic}» через материалы ниже`
        }\n` +
          `• Найди один конкретный пример применения «${mainTopic}» и воспроизведи его самостоятельно\n` +
          `• Вернись к шагу — материалы уже обновлены под твои пробелы`
      )

      setCorrectionState('done')
    }
  }

  const score =
    total > 0
      ? Math.round(
          (correctCount / total) * 100
        )
      : 0

  /* =====================================================
     AI EVALUATION SCREEN
     ===================================================== */

  if (evaluating) {
    return (
      <PageTransition>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            background: 'var(--bg-deep)',
            boxSizing: 'border-box',
          }}
        >
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}
          >
            🧠
          </motion.div>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            ИИ анализирует твои ответы
          </div>

          <div
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              maxWidth: '320px',
              lineHeight: 1.5,
            }}
          >
            Оцениваем суть ответов, не только
            ключевые слова...
          </div>
        </div>
      </PageTransition>
    )
  }

  /* =====================================================
     FINISHED SCREEN
     ===================================================== */

  if (finished) {
    return (
      <PageTransition>
        <div
          style={{
            width: 'min(760px, calc(100% - 32px))',
            margin: '0 auto',
            minHeight: '100vh',
            padding:
              '36px 0 110px',
            boxSizing: 'border-box',
          }}
        >
          <motion.div
            initial={{
              scale: 0.6,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
            }}
            style={{
              textAlign: 'center',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                lineHeight: 1,
                marginBottom: '16px',
              }}
            >
              {score >= 80
                ? '🏆'
                : score >= 50
                  ? '📚'
                  : '🔍'}
            </div>

            <h2
              style={{
                fontSize:
                  'clamp(24px, 4vw, 30px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin:
                  '0 0 14px',
              }}
            >
              {score >= 80
                ? 'Отличный результат!'
                : score >= 50
                  ? 'Хороший старт'
                  : 'Есть над чем поработать'}
            </h2>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background:
                    'rgba(245,158,11,0.12)',
                  border:
                    '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '999px',
                  padding:
                    '8px 18px',
                }}
              >
                <span>⭐</span>

                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color:
                      'var(--accent-gold)',
                  }}
                >
                  +{xpEarned} XP
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background:
                    'rgba(16,185,129,0.1)',
                  border:
                    '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '999px',
                  padding:
                    '8px 18px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#10B981',
                  }}
                >
                  {correctCount}/{total} верно
                </span>
              </div>
            </div>
          </motion.div>

          {weakTopics.length > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              style={{
                width: '100%',
                background:
                  'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)',
                border:
                  '1px solid rgba(124,58,237,0.25)',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color:
                    'var(--text-secondary)',
                  marginBottom: '10px',
                }}
              >
                🔍 Темы, требующие внимания:
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '16px',
                }}
              >
                {weakTopics.map(topic => (
                  <span
                    key={topic}
                    style={{
                      fontSize: '12px',
                      padding:
                        '4px 10px',
                      background:
                        'rgba(245,158,11,0.12)',
                      border:
                        '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '999px',
                      color:
                        'var(--accent-gold)',
                      fontWeight: 500,
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {correctionState === 'idle' && (
                <motion.button
                  onClick={
                    handleCourseCorrection
                  }
                  whileHover={{
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background:
                      'var(--grad-primary)',
                    border: 'none',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    gap: '8px',
                    boxShadow:
                      '0 4px 16px rgba(124,58,237,0.35)',
                  }}
                >
                  🎯 Откорректировать курс
                </motion.button>
              )}

              {correctionState === 'loading' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding:
                      '12px 0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: [
                            0.3,
                            1,
                            0.3,
                          ],
                          scale: [
                            0.8,
                            1.2,
                            0.8,
                          ],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay:
                            i * 0.2,
                        }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius:
                            '50%',
                          background:
                            'var(--accent-primary)',
                        }}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    ИИ анализирует твои ответы...
                  </div>
                </div>
              )}

              {correctionState === 'done' && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color:
                        'var(--accent-glow)',
                      fontWeight: 700,
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.06em',
                      marginBottom:
                        '10px',
                    }}
                  >
                    ✅ Курс скорректирован
                  </div>

                  {correctionText
                    .split('\n')
                    .filter(line =>
                      line
                        .trim()
                        .startsWith('•')
                    )
                    .map(
                      (line, i) => (
                        <div
                          key={i}
                          style={{
                            display:
                              'flex',
                            gap: '8px',
                            marginBottom:
                              '10px',
                          }}
                        >
                          <span
                            style={{
                              color:
                                'var(--accent-primary)',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>

                          <span
                            style={{
                              fontSize:
                                '13px',
                              color:
                                'var(--text-secondary)',
                              lineHeight: 1.6,
                            }}
                          >
                            {line.replace(
                              /^•\s*/,
                              ''
                            )}
                          </span>
                        </div>
                      )
                    )}

                  <div
                    style={{
                      marginTop: '10px',
                      padding:
                        '10px 12px',
                      background:
                        'rgba(16,185,129,0.08)',
                      border:
                        '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color:
                        'var(--success)',
                    }}
                  >
                    ↩ Вернись к шагу —
                    материалы обновлены
                  </div>
                </motion.div>
              )}

              {correctionState === 'error' && (
                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      color:
                        'var(--text-secondary)',
                      marginBottom:
                        '12px',
                      lineHeight: 1.5,
                    }}
                  >
                    ИИ временно недоступен.
                    Пробелы сохранены —
                    корректировка появится
                    при следующем открытии
                    шага из подобранных
                    материалов.
                  </div>

                  <button
                    onClick={() =>
                      setCorrectionState(
                        'idle'
                      )
                    }
                    style={{
                      padding:
                        '8px 20px',
                      background:
                        'rgba(124,58,237,0.15)',
                      border:
                        '1px solid rgba(124,58,237,0.3)',
                      borderRadius:
                        '10px',
                      color:
                        'var(--accent-glow)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </motion.div>
          )}

          <motion.button
            onClick={() =>
              navigate(
                `/step/${stepId || '1'}`
              )
            }
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            style={{
              width: '100%',
              maxWidth: '360px',
              margin:
                '0 auto',
              padding: '15px',
              background:
                weakTopics.length === 0
                  ? 'var(--grad-primary)'
                  : 'var(--bg-surface)',
              border:
                weakTopics.length === 0
                  ? 'none'
                  : '1px solid var(--border)',
              borderRadius: '14px',
              color:
                weakTopics.length === 0
                  ? 'white'
                  : 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Вернуться к шагу
          </motion.button>
        </div>
      </PageTransition>
    )
  }

  /* =====================================================
     QUIZ SCREEN
     ===================================================== */

  return (
    <PageTransition>
      <div
        style={{
          width:
            'min(900px, calc(100% - 32px))',
          margin: '0 auto',
          minHeight: '100vh',
          padding:
            '28px 0 110px',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <button
            onClick={() =>
              navigate(-1)
            }
            style={{
              flexShrink: 0,
              background:
                'var(--bg-surface)',
              border:
                '1px solid var(--border)',
              borderRadius:
                'var(--radius-md)',
              padding:
                '9px 14px',
              color:
                'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems:
                'center',
              justifyContent:
                'center',
              flex: 1,
              minWidth: 0,
            }}
          >
            {questions.map(
              (_, i) => (
                <div
                  key={i}
                  style={{
                    width:
                      i ===
                      currentIndex
                        ? '10px'
                        : '8px',
                    height:
                      i ===
                      currentIndex
                        ? '10px'
                        : '8px',
                    flexShrink: 0,
                    borderRadius:
                      '50%',
                    background:
                      i <
                      currentIndex
                        ? 'var(--success)'
                        : i ===
                            currentIndex
                          ? 'var(--accent-primary)'
                          : 'var(--border)',
                    transition:
                      'all 0.3s',
                  }}
                />
              )
            )}
          </div>

          <span
            style={{
              flexShrink: 0,
              minWidth: '44px',
              textAlign: 'right',
              fontSize: '13px',
              color:
                'var(--text-muted)',
            }}
          >
            {currentIndex + 1} / {total}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -30,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            {/* QUESTION */}

            <div
              style={{
                width: '100%',
                background:
                  'var(--bg-surface)',
                border:
                  '1px solid var(--border)',
                borderRadius:
                  'var(--radius-xl)',
                padding: '28px',
                marginBottom:
                  '20px',
                boxSizing:
                  'border-box',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color:
                    'var(--accent-primary)',
                  fontWeight: 700,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.1em',
                  marginBottom:
                    '12px',
                }}
              >
                🧠 Вопрос{' '}
                {currentIndex + 1}
              </div>

              <p
                style={{
                  fontSize:
                    'clamp(17px, 2.2vw, 21px)',
                  fontWeight: 600,
                  color:
                    'var(--text-primary)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {current.question.replace(
                  /^[🟢🟡🔴]\s*/,
                  ''
                )}
              </p>
            </div>

            {/* ANSWER */}

            <textarea
              value={answer}
              onChange={e =>
                setAnswer(
                  e.target.value
                )
              }
              onKeyDown={e => {
                if (
                  e.key ===
                    'Enter' &&
                  e.ctrlKey &&
                  answer.trim()
                ) {
                  checkAnswer()
                }
              }}
              placeholder="Напиши ответ своими словами..."
              disabled={
                feedback !== null
              }
              rows={6}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                background:
                  'var(--bg-surface)',
                border: `1px solid ${
                  isCorrect === true
                    ? 'var(--success)'
                    : isCorrect === false
                      ? 'var(--danger)'
                      : 'var(--border)'
                }`,
                borderRadius:
                  'var(--radius-lg)',
                color:
                  'var(--text-primary)',
                fontSize: '16px',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily:
                  'Inter, sans-serif',
                boxSizing:
                  'border-box',
                marginBottom:
                  '14px',
                transition:
                  'border-color 0.2s',
              }}
            />

            {/* FEEDBACK */}

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  style={{
                    padding:
                      '13px 16px',
                    background:
                      isCorrect
                        ? 'rgba(16,185,129,0.08)'
                        : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${
                      isCorrect
                        ? 'rgba(16,185,129,0.3)'
                        : 'rgba(245,158,11,0.3)'
                    }`,
                    borderRadius:
                      'var(--radius-md)',
                    fontSize: '14px',
                    color:
                      isCorrect
                        ? 'var(--success)'
                        : 'var(--accent-gold)',
                    marginBottom:
                      '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION */}

            {feedback === null ? (
              <motion.button
                onClick={
                  checkAnswer
                }
                disabled={
                  !answer.trim()
                }
                whileHover={
                  answer.trim()
                    ? { scale: 1.01 }
                    : {}
                }
                whileTap={
                  answer.trim()
                    ? { scale: 0.98 }
                    : {}
                }
                style={{
                  width: '100%',
                  padding: '15px',
                  background:
                    answer.trim()
                      ? 'var(--grad-primary)'
                      : 'rgba(124,58,237,0.2)',
                  border: 'none',
                  borderRadius:
                    'var(--radius-md)',
                  color:
                    answer.trim()
                      ? 'white'
                      : 'var(--text-muted)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor:
                    answer.trim()
                      ? 'pointer'
                      : 'default',
                  transition:
                    'background 0.2s',
                }}
              >
                Проверить →
              </motion.button>
            ) : (
              <motion.button
                onClick={
                  nextQuestion
                }
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                whileHover={{
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  background:
                    'var(--grad-primary)',
                  border: 'none',
                  borderRadius:
                    'var(--radius-md)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow:
                    '0 4px 20px rgba(124,58,237,0.4)',
                }}
              >
                {currentIndex + 1 <
                total
                  ? 'Следующий вопрос →'
                  : 'Завершить квиз 🏆'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}