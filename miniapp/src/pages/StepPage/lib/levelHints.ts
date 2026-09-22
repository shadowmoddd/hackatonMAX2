// ── Personalization helpers ────────────────────────────────
export function _hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return Math.abs(h)
}

export const _LEVEL_TIPS: Record<string, Array<(t: string, sk: string) => string>> = {
  beginner: [
    (t, sk) => `Пиши «${sk}» вручную, не копируй примеры — мышечная память работает лучше, чем чтение.`,
    (t, sk) => `Ошибки при изучении «${t}» — это прогресс. Разбор каждой ошибки стоит больше часа чтения.`,
    (t, sk) => `15 минут каждый день с «${sk}» эффективнее трёх часов раз в неделю.`,
    (t, sk) => `Объясни «${t}» вслух или другу — если можешь объяснить, значит действительно понял.`,
    (t, sk) => `Не переходи дальше, пока не сделаешь хотя бы один рабочий пример с «${sk}» самостоятельно.`,
    (t, sk) => `Google и документация — твои лучшие друзья при изучении «${t}». Поиск ответов — тоже навык.`,
    (t, sk) => `Сохрани первый код с «${sk}» и вернись к нему через неделю — увидишь насколько вырос.`,
  ],
  elementary: [
    (t, sk) => `В «${t}» теперь важна практика: пиши код сам, а не только читай примеры.`,
    (t, sk) => `Примени «${sk}» в мини-проекте — даже самый маленький проект закрепляет лучше любого туториала.`,
    (t, sk) => `Найди чужой код по теме «${t}» и разбери его построчно — это ускоряет рост быстрее любых курсов.`,
    (t, sk) => `Спроси себя: «Как бы я использовал «${sk}» в реальной задаче?» — это переводит знание в навык.`,
    (t, sk) => `В «${t}» уже можно читать официальную документацию — это привычка настоящих специалистов.`,
    (t, sk) => `Напиши «${sk}» с нуля без подсказок — проверь, что действительно запомнил, а не просто видел.`,
    (t, sk) => `Разбери одну ошибку до конца: понять почему не работает важнее, чем просто запустить.`,
  ],
  intermediate: [
    (t, sk) => `В «${t}» уже стоит изучать не только "как", но и "почему" — это отличает джуна от мидла.`,
    (t, sk) => `Попробуй объяснить «${sk}» новичку — это лучший тест на глубину понимания.`,
    (t, sk) => `Ищи code review: чужой взгляд на твой код по «${t}» выявит скрытые проблемы быстрее самостоятельного разбора.`,
    (t, sk) => `Изучи исходный код популярных библиотек, использующих «${sk}» — там скрыты лучшие паттерны индустрии.`,
    (t, sk) => `В «${t}» важно понимать trade-offs: нет универсальных решений, есть подходящие под контекст.`,
    (t, sk) => `Напиши тест для кода с «${sk}» — это моментально выявит архитектурные проблемы, которых не видно глазом.`,
    (t, sk) => `Изучи как «${t}» работает под капотом — поверхностные знания ломаются именно на собеседовании.`,
  ],
  advanced: [
    (t, sk) => `В «${t}» теперь важен системный взгляд: как решение влияет на производительность и поддержку всей системы?`,
    (t, sk) => `Сравни несколько подходов к «${sk}» — продвинутый специалист знает компромиссы каждого и когда какой применять.`,
    (t, sk) => `Оптимизируй своё решение с «${t}» — производительность и читаемость отличают хороший код от отличного.`,
    (t, sk) => `Поищи edge cases в «${sk}» — граничные случаи выявляют настоящую глубину понимания.`,
    (t, sk) => `Напиши статью или объясни «${t}» другим — формализация знаний кристаллизует их окончательно.`,
    (t, sk) => `Изучи как «${sk}» работает в распределённых системах при нагрузке — это следующий горизонт роста.`,
    (t, sk) => `Просмотри историю развития «${sk}» и RFC — понимание эволюции даёт контекст, которого нет в туториалах.`,
  ],
}

export function generateLevelHint(
  stepTitle: string,
  skills: string[],
  level: string,
  stepId: number,
  weakTopics?: string[]
): string {
  if (weakTopics && weakTopics.length > 0) {
    const topic = weakTopics[0]
    const focusHints: Record<string, (t: string) => string> = {
      beginner:     (t) => `Квиз показал пробел в «${t}». Разбери этот момент в материалах — не спеши дальше.`,
      elementary:   (t) => `Пробел в «${t}» — именно та точка роста, где стоит замедлиться и разобраться глубже.`,
      intermediate: (t) => `В «${t}» есть место для улучшения. Найди практический пример и применить концепцию самостоятельно.`,
      advanced:     (t) => `Пробел в «${t}» стоит закрыть до следующего шага. Изучи edge cases и нестандартные сценарии.`,
    }
    return (focusHints[level] || focusHints['beginner'])(topic)
  }
  const tips = _LEVEL_TIPS[level] || _LEVEL_TIPS['beginner']
  const idx = _hash(`lh_${stepId}_${level}`) % tips.length
  return tips[idx](stepTitle, skills[0] || stepTitle)
}

// ── YouTube ID extractor (поддерживает watch, shorts, embed, youtu.be) ─────
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

// ── RuTube video ID extractor ──────────────────────────────
export function extractRutubeId(url: string): string | null {
  if (!url) return null
  const m = url.match(/rutube\.ru\/(?:video|play\/embed)\/([a-f0-9]+)/i)
  return m ? m[1] : null
}

// ── Определяем тип видео-источника ────────────────────────
export type VideoSource =
  | { type: 'youtube'; id: string }
  | { type: 'rutube'; id: string }
  | { type: 'direct'; url: string }
  | { type: 'search'; query: string }

export function detectVideoSource(url: string | null | undefined, searchQuery?: string | null): VideoSource {
  if (url) {
    const ytId = extractYouTubeId(url)
    if (ytId) return { type: 'youtube', id: ytId }
    const rtId = extractRutubeId(url)
    if (rtId) return { type: 'rutube', id: rtId }
    if (url.startsWith('http')) return { type: 'direct', url }
  }
  return { type: 'search', query: searchQuery || '' }
}
