import { CURATED_MATERIALS, type CuratedMaterial } from './materialDatabase'

const GENERIC_WORDS = new Set([
  'основы','введение','начинающих','начало','полный','курс','часть','урок',
  'руководство','туториал','tutorial','статью','статья','видео','лекция',
  'обзор','базовый','базовые','знакомство','работа','работаем','нуля'
])

export function findCuratedMaterials(
  stepKey: string,
  level: string,
  weakTopics?: string[],
  stepTitle?: string,
  stepSkills?: string[],
  stepNum?: number,
  allSphereSteps?: Array<{ id: number; title: string; skills: string[] }>
): CuratedMaterial[] {
  const spherePrefix = stepKey.replace(/_\d+$/, '')

  let pool = CURATED_MATERIALS.filter(m =>
    (m.stepKey?.startsWith(spherePrefix) ?? false) && m.levels.includes(level)
  )
  if (pool.length === 0) {
    pool = CURATED_MATERIALS.filter(m => m.stepKey?.startsWith(spherePrefix) ?? false)
  }
  if (pool.length === 0) return []

  const scoreFor = (m: CuratedMaterial, title: string, skills: string[]) => {
    const text = (m.title + ' ' + m.topics.join(' ')).toLowerCase()
    let s = 0
    for (const skill of skills) {
      const skillLow = skill.toLowerCase()
      if (text.includes(skillLow)) s += 10
      for (const w of skillLow.split(/\s+/)) {
        if (w.length > 3 && !GENERIC_WORDS.has(w) && text.includes(w)) s += 6
      }
    }
    for (const w of title.toLowerCase().split(/\s+/)) {
      if (w.length > 3 && !GENERIC_WORDS.has(w) && text.includes(w)) s += 2
    }
    if (weakTopics) {
      for (const t of weakTopics) {
        if (text.includes(t.toLowerCase())) s += 4
      }
    }
    return s
  }

  const currentStep = { title: stepTitle ?? '', skills: stepSkills ?? [] }
  const otherSteps = (allSphereSteps ?? []).filter(s => s.id !== stepNum)

  const assigned: Array<{ m: CuratedMaterial; score: number }> = []
  for (const m of pool) {
    const myScore = scoreFor(m, currentStep.title, currentStep.skills)
    if (myScore === 0) continue
    const otherMaxScore = Math.max(0, ...otherSteps.map(s => scoreFor(m, s.title, s.skills)))
    if (myScore > otherMaxScore) {
      assigned.push({ m, score: myScore })
    }
  }

  assigned.sort((a, b) => b.score - a.score || a.m.url.localeCompare(b.m.url))
  return assigned.slice(0, 3).map(x => x.m)
}

export function findMoreByFormat(
  spherePrefix: string,
  level: string,
  format: 'video' | 'article' | 'book',
  excludeUrls: string[],
  limit = 8,
  weakTopics?: string[],
  stepTitle?: string
): CuratedMaterial[] {
  const excludeSet = new Set(excludeUrls)
  const dbType = format === 'book' ? 'article' : format
  let candidates = CURATED_MATERIALS.filter(m =>
    (m.stepKey?.startsWith(spherePrefix) ?? false) &&
    m.levels.includes(level) &&
    m.type === dbType &&
    !excludeSet.has(m.url)
  )
  if (candidates.length === 0) {
    candidates = CURATED_MATERIALS.filter(m =>
      (m.stepKey?.startsWith(spherePrefix) ?? false) &&
      m.type === dbType &&
      !excludeSet.has(m.url)
    )
  }
  if (weakTopics?.length || stepTitle) {
    candidates = [...candidates].sort((a, b) => {
      const score = (m: CuratedMaterial) => {
        const text = (m.title + ' ' + m.topics.join(' ')).toLowerCase()
        let s = 0
        if (weakTopics) s += weakTopics.filter(t => text.includes(t.toLowerCase())).length * 3
        if (stepTitle) s += stepTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3 && text.includes(w)).length * 2
        return s
      }
      return score(b) - score(a)
    })
  }
  return candidates.slice(0, limit)
}
