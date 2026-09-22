/**
 * Groq API клиент для miniapp.
 * Ключ: добавь VITE_GROQ_API_KEY=gsk_... в файл miniapp/.env.local
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Быстрая модель для хинтов и коррекции
const MODEL_FAST = 'llama-3.1-8b-instant'
// Лучшая модель для семантического анализа квиза
const MODEL_SMART = 'llama-3.3-70b-versatile'

async function callGroq(prompt: string, model = MODEL_FAST, maxTokens = 512): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY не задан в miniapp/.env.local')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}

// ────────────────────────────────────────────────────────────────────────────
// СЕМАНТИЧЕСКАЯ ОЦЕНКА ОТВЕТОВ КВИЗА
// ────────────────────────────────────────────────────────────────────────────

export interface SemanticEvalResult {
  index: number
  correct: boolean
  score: number    // 0.0–1.0
  comment: string  // краткое объяснение оценки
}

/**
 * Семантически оценивает ответы пользователя через Groq.
 * Понимает суть ответа даже если нет точных ключевых слов.
 *
 * Пример: вопрос «Что такое ИИ?»
 * Ответ: «нейронные слои, математическая модель нейрона» → correct: true
 */
export async function evaluateAnswersSemantically(
  qaPairs: { q: string; a: string; hintKeywords: string[] }[]
): Promise<SemanticEvalResult[]> {
  const qa = qaPairs.map((p, i) =>
    `Вопрос ${i + 1}: ${p.q}\nОтвет: "${p.a}"\nКлючевые понятия темы: ${p.hintKeywords.join(', ')}`
  ).join('\n\n')

  const prompt = `Ты эксперт-преподаватель. Оцени ответы студента. Для каждого ответа реши: верно или нет.

ПРАВИЛА:
- Засчитывай ВЕРНЫМ если ответ описывает суть концепции своими словами
- Засчитывай ВЕРНЫМ если упомянуты связанные понятия (пример: "нейронные слои" для вопроса про ИИ — это ВЕРНО)
- Засчитывай НЕВЕРНЫМ только если ответ полностью не по теме или слишком короткий (меньше 2 слов)
- score: от 0.0 до 1.0

ВОПРОСЫ И ОТВЕТЫ:
${qa}

Верни JSON массив строго в таком формате (без markdown, без пояснений):
[{"index":0,"correct":true,"score":0.8},{"index":1,"correct":false,"score":0.1}]`

  try {
    const raw = await callGroq(prompt, MODEL_SMART, 400)
    // Находим JSON массив в ответе
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found')
    const parsed = JSON.parse(match[0]) as Array<{ index: number; correct: boolean; score: number }>
    return parsed.map(p => ({
      index: p.index,
      correct: Boolean(p.correct),
      score: typeof p.score === 'number' ? p.score : (p.correct ? 0.7 : 0.2),
      comment: '',
    }))
  } catch (e) {
    console.error('[Groq] Semantic eval failed:', e)
    return qaPairs.map((p, i) => ({
      index: i,
      correct: p.a.length > 50,
      score: p.a.length > 100 ? 0.6 : p.a.length > 50 ? 0.4 : 0.1,
      comment: '',
    }))
  }
}

// ────────────────────────────────────────────────────────────────────────────
// КОРРЕКТИРОВКА КУРСА
// ────────────────────────────────────────────────────────────────────────────

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
    beginner: 'новичок', elementary: 'базовый уровень',
    intermediate: 'средний уровень', advanced: 'продвинутый',
  }

  // Ответы студента — подробно, чтобы AI мог сослаться конкретно
  const answersSection = quizResults && quizResults.length > 0
    ? '\n\nОТВЕТЫ СТУДЕНТА:\n' + quizResults.map((r, i) =>
        `Вопрос ${i + 1}: ${r.q}\nОтвет студента: "${r.a.slice(0, 300)}"\nРезультат: ${r.correct ? '✅ верно' : '❌ неверно'}`
      ).join('\n\n')
    : ''

  // Сложность определяем локально — не нужен AI для этого
  const avgScore = topicScores
    ? Object.values(topicScores).reduce((a, b) => a + b, 0) / Math.max(Object.values(topicScores).length, 1)
    : 0.5
  const difficulty: 'easier' | 'same' | 'harder' =
    avgScore < 0.35 ? 'easier' : avgScore > 0.75 ? 'harder' : 'same'

  // Промпт без JSON — просто 3 буллет-пункта
  const prompt = `Ты персональный образовательный тренер. Напиши 3 коротких персональных совета студенту.

Сфера: ${sphereName}
Тема шага: "${stepTitle}"
Навыки: ${stepSkills.slice(0, 4).join(', ')}
Уровень студента: ${levelMap[detectedLevel] ?? detectedLevel}
Слабые темы после теста: ${weakTopics.slice(0, 3).join(', ') || 'не выявлены'}
${answersSection}

ПРАВИЛА:
- Ссылайся на конкретные ответы студента (цитируй фрагменты если нужно)
- Каждый совет — 1 предложение, конкретный и actionable
- Дружеский тон, без менторства
- Если ответ был пустым или очень коротким — скажи что нужно написать развёрнуто

Формат — ровно 3 строки, каждая начинается с "• ":
• совет 1
• совет 2
• совет 3`

  try {
    const raw = await callGroq(prompt, MODEL_SMART, 300)
    // Извлекаем только строки с буллетами
    const lines = raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('•'))
    const text = lines.length >= 2
      ? lines.slice(0, 3).join('\n')
      : raw.trim()  // если модель вернула без буллетов — берём как есть

    return {
      text,
      focusTopics: weakTopics.slice(0, 3),
      difficulty,
    }
  } catch (e) {
    console.error('[Groq] generateCourseCorrection failed:', e)
    return {
      text: buildFallbackText(weakTopics, stepTitle, quizResults),
      focusTopics: weakTopics.slice(0, 3),
      difficulty,
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// УМНЫЙ ХИНТ ДЛЯ УРОВНЯ
// ────────────────────────────────────────────────────────────────────────────

export async function generateSmartHint(
  stepTitle: string,
  skills: string[],
  level: string,
  weakTopics?: string[],
  quizResults?: QuizResult[]
): Promise<string> {
  const levelCtx: Record<string, string> = {
    beginner: 'только начинает, нужна поддержка и первые шаги',
    elementary: 'знает основы, готов к практике',
    intermediate: 'уверен в базе, нужно углубление',
    advanced: 'опытный, нужны нюансы и edge cases',
  }

  const weakCtx = weakTopics?.length
    ? `Пробелы из квиза: ${weakTopics.join(', ')}.`
    : ''

  const wrongCtx = quizResults?.filter(r => !r.correct).length
    ? `Конкретные ошибки: ${quizResults.filter(r => !r.correct).map(r => `на "${r.q.slice(0, 60)}" ответил "${r.a.slice(0, 60)}"`).join('; ')}`
    : ''

  const prompt = `Дай ОДИН конкретный совет студенту для изучения темы.

Тема: "${stepTitle}", навыки: ${skills.slice(0, 3).join(', ')}
Студент: ${levelCtx[level] ?? 'средний уровень'}
${weakCtx} ${wrongCtx}

Требования: 1-2 предложения, конкретный actionable совет, без банальностей.
Верни ТОЛЬКО текст совета (без кавычек).`

  try {
    const raw = await callGroq(prompt, MODEL_FAST, 150)
    return raw.trim().replace(/^["'«»]|["'«»]$/g, '')
  } catch {
    if (weakTopics?.length) {
      return `Пробел в «${weakTopics[0]}» — разбери один конкретный пример и воспроизведи самостоятельно.`
    }
    return level === 'beginner'
      ? `Пиши «${skills[0] || stepTitle}» руками, не копируй — мышечная память закрепляет лучше чтения.`
      : `В «${skills[0] || stepTitle}» важно понять "почему", а не только "как".`
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ПЕРСОНАЛИЗИРОВАННЫЙ ПОДБОР МАТЕРИАЛОВ ИЗ БД
// ────────────────────────────────────────────────────────────────────────────

export interface MaterialSuggestion {
  title: string
  platform: string
  type: 'video' | 'article' | 'book'
  duration: string
  why: string
  url?: string      // прямая ссылка из БД (если есть)
  fromDb: boolean   // true = из БД (прямые ссылки), false = DDG/поиск
}

/**
 * Groq ранжирует материалы из БД по релевантности для КОНКРЕТНОГО пользователя.
 * Groq НЕ придумывает материалы — только сортирует список из БД.
 * Возвращает индексы materials[], отсортированные от лучшего к худшему.
 */
export async function rankBdMaterials(
  materials: { title: string; topics: string[]; type: string }[],
  stepTitle: string,
  skills: string[],
  weakTopics: string[],
  detectedLevel: string
): Promise<number[]> {
  if (materials.length === 0) return []
  if (materials.length === 1) return [0]

  const levelMap: Record<string, string> = {
    beginner: 'новичок', elementary: 'базовый уровень',
    intermediate: 'средний уровень', advanced: 'продвинутый',
  }

  const matList = materials.map((m, i) =>
    `[${i}] "${m.title}" (темы: ${m.topics.slice(0, 4).join(', ')})`
  ).join('\n')

  const prompt = `Ты персональный ИИ-тренер. Отсортируй материалы из базы данных по полезности для конкретного пользователя.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Уровень: ${levelMap[detectedLevel] ?? detectedLevel}
- Пробелы в знаниях (нужно закрыть прежде всего): ${weakTopics.join(', ') || 'не определены'}
- Тема шага: "${stepTitle}"
- Навыки: ${skills.slice(0, 3).join(', ')}

МАТЕРИАЛЫ ИЗ БАЗЫ ДАННЫХ:
${matList}

Верни ТОЛЬКО индексы через запятую, от самого подходящего к наименее подходящему: 2,0,3,1`

  try {
    const raw = await callGroq(prompt, MODEL_FAST, 80)
    const indices = raw.trim()
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 0 && n < materials.length)
    // Добавляем пропущенные индексы в конец
    const seen = new Set(indices)
    for (let i = 0; i < materials.length; i++) {
      if (!seen.has(i)) indices.push(i)
    }
    return indices
  } catch (e) {
    console.error('[Groq] rankBdMaterials failed:', e)
    // Локальный фолбэк — сортируем по пересечению тем с weakTopics
    return materials
      .map((m, i) => ({
        i,
        score: weakTopics.filter(w =>
          m.topics.some(t => t.toLowerCase().includes(w.toLowerCase()))
        ).length,
      }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.i)
  }
}

// Оставляем как заглушку для обратной совместимости импортов
export async function generateMoreMaterials(): Promise<MaterialSuggestion[]> {
  return []
}

function buildFallbackText(weakTopics: string[], stepTitle: string, quizResults?: QuizResult[]): string {
  const wrong = quizResults?.filter(r => !r.correct) ?? []
  if (wrong.length > 0) {
    const topic = weakTopics[0] || 'этой теме'
    return `• Твой ответ «${wrong[0].a.slice(0, 50)}...» — разбери тему «${topic}» с нуля\n• Найди один пример применения «${topic}» и воспроизведи самостоятельно\n• После закрепления ответь на вопрос своими словами`
  }
  if (weakTopics.length > 0) {
    return `• Слабое место: «${weakTopics[0]}» — уделяй этой теме больше времени\n• Найди 2-3 примера по «${weakTopics[0]}» и разбери каждый\n• Объясни «${weakTopics[0]}» простыми словами`
  }
  return `• Закрепи материал «${stepTitle}» дополнительными примерами\n• Примени навыки на практической задаче\n• Объясни ключевые концепции шага своими словами`
}
