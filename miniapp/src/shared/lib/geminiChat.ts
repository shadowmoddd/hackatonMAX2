import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] as const

export interface CourseCorrection {
  text: string
  focusTopics: string[]
  difficulty: 'easier' | 'same' | 'harder'
}

interface QuizResult {
  q: string
  a: string
  correct: boolean
  keywordScore: number
}

async function callGemini(prompt: string): Promise<string> {
  if (!genAI) throw new Error('VITE_GEMINI_API_KEY not set')
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e) {
      console.warn(`[Gemini] ${modelName} failed:`, e)
    }
  }
  throw new Error('All Gemini models failed')
}

/**
 * AI-корректировка курса на основе РЕАЛЬНЫХ ответов пользователя.
 * Каждый раз уникальный текст — Gemini анализирует конкретные ошибки.
 */
export async function generateCourseCorrection(
  weakTopics: string[],
  stepTitle: string,
  stepSkills: string[],
  sphereName: string,
  detectedLevel: string,
  topicScores?: Record<string, number>,
  quizResults?: QuizResult[]
): Promise<CourseCorrection> {
  const levelMap: Record<string, string> = {
    beginner: 'новичок (только начинает)',
    elementary: 'базовый уровень (знает основы)',
    intermediate: 'средний уровень (есть опыт)',
    advanced: 'продвинутый (глубокие знания)',
  }

  // Строим детальный раздел с реальными ответами пользователя
  const answersSection = quizResults && quizResults.length > 0
    ? `\nРЕАЛЬНЫЕ ОТВЕТЫ ПОЛЬЗОВАТЕЛЯ:\n${quizResults.map((r, i) =>
        `Вопрос ${i + 1}: ${r.q}\nОтвет: "${r.a.slice(0, 200)}"\nРезультат: ${r.correct ? '✅ правильно' : `❌ неверно (попадание ${Math.round(r.keywordScore * 100)}%)`}`
      ).join('\n\n')}`
    : ''

  const scoresSection = topicScores && Object.keys(topicScores).length > 0
    ? `\nПонимание по темам:\n${Object.entries(topicScores)
        .sort(([, a], [, b]) => a - b)
        .map(([t, s]) => `- ${t}: ${s < 0.3 ? '❌ пробел' : s < 0.6 ? '⚠️ частично' : '✅ понимает'}`)
        .join('\n')}`
    : ''

  const avgScoreVal = topicScores
    ? Object.values(topicScores).reduce((a, b) => a + b, 0) / Math.max(Object.values(topicScores).length, 1)
    : 0.5

  const fallback: CourseCorrection = {
    text: buildFallbackText(weakTopics, stepTitle, quizResults),
    focusTopics: weakTopics.length > 0 ? weakTopics.slice(0, 3) : stepSkills.slice(0, 3),
    difficulty: avgScoreVal < 0.35 ? 'easier' : avgScoreVal > 0.75 ? 'harder' : 'same',
  }

  const prompt = `Ты персональный образовательный тренер. Анализируй ответы КОНКРЕТНОГО студента и дай персональный совет.

КОНТЕКСТ:
Сфера: ${sphereName}
Тема шага: "${stepTitle}"
Навыки: ${stepSkills.join(', ')}
Уровень студента: ${levelMap[detectedLevel] ?? detectedLevel}
Слабые темы: ${weakTopics.join(', ') || 'не определены'}
${scoresSection}
${answersSection}

ЗАДАЧА: Напиши 3 персональных совета ИМЕННО для этого студента с учётом его конкретных ответов.
Не пиши шаблонные фразы. Ссылайся на конкретные ошибки из его ответов.
Используй простой, дружеский тон.

Также определи:
- focusTopics: 2-3 конкретные темы для поиска доп. материалов
- difficulty: нужно упростить ("easier"), оставить ("same") или усложнить ("harder") исходя из результатов

Верни ТОЛЬКО JSON:
{"text": "• совет 1\\n• совет 2\\n• совет 3", "focusTopics": ["тема1", "тема2"], "difficulty": "easier|same|harder"}`

  try {
    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Partial<CourseCorrection>
    return {
      text: parsed.text || fallback.text,
      focusTopics: Array.isArray(parsed.focusTopics) ? parsed.focusTopics : fallback.focusTopics,
      difficulty: (['easier', 'same', 'harder'] as const).includes(parsed.difficulty as 'easier' | 'same' | 'harder')
        ? (parsed.difficulty as 'easier' | 'same' | 'harder')
        : fallback.difficulty,
    }
  } catch {
    return fallback
  }
}

/**
 * AI-генерация умного персонального совета для уровня пользователя на шаге.
 * Учитывает слабые темы из квиза для максимальной персонализации.
 */
export async function generateSmartHint(
  stepTitle: string,
  skills: string[],
  level: string,
  weakTopics?: string[],
  quizResults?: QuizResult[]
): Promise<string> {
  const levelContext: Record<string, string> = {
    beginner: 'только начинает изучать тему, нужна поддержка и конкретные первые шаги',
    elementary: 'знает основы, готов к практике, нужны конкретные задания',
    intermediate: 'уверен в базе, нужно углубление и применение на практике',
    advanced: 'опытный, нужны сложные кейсы и нюансы',
  }

  const weakContext = weakTopics && weakTopics.length > 0
    ? `По результатам квиза выявлены пробелы: ${weakTopics.join(', ')}. Дай совет именно по этим темам.`
    : 'Квиз ещё не пройден или всё правильно.'

  const answerContext = quizResults && quizResults.some(r => !r.correct)
    ? `Конкретные ошибки: ${quizResults.filter(r => !r.correct).map(r => `на вопрос "${r.q.slice(0, 80)}" ответил "${r.a.slice(0, 80)}"`).join('; ')}`
    : ''

  const prompt = `Дай ОДИН конкретный персональный совет студенту для изучения темы.

Тема: "${stepTitle}"
Навыки: ${skills.slice(0, 3).join(', ')}
Студент: ${levelContext[level] ?? 'средний уровень'}
${weakContext}
${answerContext}

Требования:
- Одно предложение, максимум 2
- Конкретный и actionable совет
- Учитывай уровень и пробелы
- Без банальностей вроде "изучи документацию"
- На русском языке

Верни ТОЛЬКО текст совета без кавычек и префиксов.`

  try {
    const raw = await callGemini(prompt)
    return raw.trim().replace(/^["'«»]|["'«»]$/g, '')
  } catch {
    return buildFallbackHint(stepTitle, skills, level, weakTopics)
  }
}

function buildFallbackHint(stepTitle: string, skills: string[], level: string, weakTopics?: string[]): string {
  if (weakTopics && weakTopics.length > 0) {
    const topic = weakTopics[0]
    if (level === 'beginner' || level === 'elementary') {
      return `Пробел в «${topic}» — разбери один конкретный пример из материалов и напиши свой вариант кода или описание.`
    }
    return `Пробел в «${topic}» — найди реальный кейс применения и разбери его до конца, не переходи дальше.`
  }
  const skill = skills[0] || stepTitle
  if (level === 'beginner') return `Пиши «${skill}» руками, не копируй примеры — мышечная память закрепляет лучше чтения.`
  if (level === 'intermediate') return `В «${skill}» уже важно понимать "почему" а не только "как" — это отличает мидла от джуна.`
  return `Попробуй объяснить «${skill}» своими словами — если можешь объяснить, значит действительно понял.`
}

function buildFallbackText(weakTopics: string[], stepTitle: string, quizResults?: QuizResult[]): string {
  const wrongAnswers = quizResults?.filter(r => !r.correct) ?? []
  if (wrongAnswers.length > 0) {
    const firstWrong = wrongAnswers[0]
    const topic = weakTopics[0] || 'этой теме'
    return `• Твой ответ «${firstWrong.a.slice(0, 60)}...» показал пробел в «${topic}» — разбери эту тему с нуля по материалам ниже\n• Найди один конкретный пример применения «${topic}» и попробуй воспроизвести его самостоятельно\n• После закрепления попробуй снова ответить на этот вопрос своими словами`
  }
  if (weakTopics.length > 0) {
    return `• Слабое место: «${weakTopics[0]}» — уделяй этой теме больше времени в материалах ниже\n• Найди 2-3 практических примера по «${weakTopics[0]}» и разбери каждый\n• Проверь себя — можешь ли объяснить «${weakTopics[0]}» простыми словами`
  }
  return `• Закрепи материал шага «${stepTitle}» дополнительными примерами из подобранных ресурсов\n• Примени навыки на небольшой практической задаче прямо сейчас\n• Попробуй объяснить ключевые концепции шага своими словами`
}
