export function detectLevel(
  answers: { q: string; a: string }[],
  hints: Record<string, string[]>
): string {
  let score = 0
  const allHints = Object.values(hints).flat()

  for (const { a } of answers) {
    const lower = a.toLowerCase()
    const matched = allHints.filter(h => lower.includes(h)).length
    if (a.length > 100 && matched >= 2) score += 3
    else if (a.length > 50 && matched >= 1) score += 2
    else if (a.length > 20) score += 1
  }

  if (score >= 7) return 'advanced'
  if (score >= 5) return 'intermediate'
  if (score >= 2) return 'elementary'
  return 'beginner'
}
