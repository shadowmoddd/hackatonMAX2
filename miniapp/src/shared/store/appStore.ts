import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Achievement definitions ────────────────────────────────
export interface AchievementDef {
  id: string; title: string; desc: string; icon: string; xp: number
  check: (s: AppState) => boolean
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_step',  title: 'Первый шаг',      desc: 'Завершил первый шаг маршрута', icon: '🚀', xp: 50,  check: s => s.completedStepIds.length >= 1 },
  { id: 'three_steps', title: 'В ритме',          desc: 'Завершил 3 шага',               icon: '🔥', xp: 100, check: s => s.completedStepIds.length >= 3 },
  { id: 'all_done',    title: 'Маршрут пройден',  desc: 'Завершил весь маршрут',          icon: '🏆', xp: 500, check: s => s.completedStepIds.length >= 5 },
  { id: 'xp_500',      title: 'Полтысячи XP',     desc: 'Набрал 500 XP',                  icon: '⭐', xp: 75,  check: s => s.xp >= 500 },
  { id: 'xp_1000',     title: 'Тысячник',          desc: 'Набрал 1000 XP',                 icon: '💎', xp: 150, check: s => s.xp >= 1000 },
  { id: 'streak_7',    title: 'Неделя подряд',    desc: '7 дней стрика',                  icon: '📅', xp: 200, check: s => s.streak >= 7 },
]

// ── XP by material type ────────────────────────────────────
export interface XpByType { video: number; article: number; quiz: number }

// ── Per-sphere saved progress ──────────────────────────────
export interface SphereProgress {
  completedStepIds: number[]
  currentStepId: number
  xp: number
  xpByType: XpByType
}

// ── Per-sphere onboarding profile ─────────────────────────
export interface SphereProfile {
  subDirection: string | null
  preferredFormats: string[]
  detectedLevel: string
  quizAnswers: { q: string; a: string }[]
}

// ── Main state ─────────────────────────────────────────────
export interface AppState {
  onboarded: boolean
  sphereId: string | null

  // Current sphere onboarding profile (mirrors active sphereProfiles entry)
  subDirection: string | null
  preferredFormats: string[]
  detectedLevel: string
  quizAnswers: { q: string; a: string }[]

  // Current sphere progress
  completedStepIds: number[]
  currentStepId: number | null
  xp: number
  xpByType: XpByType
  streak: number
  lastActiveDate: string | null

  // Saved progress per sphere
  savedProgress: Record<string, SphereProgress>

  // Saved onboarding profile per sphere — KEY for persistence fix
  sphereProfiles: Record<string, SphereProfile>

  // Quiz results per step — key is `${sphereId}_${stepId}`
  stepQuizResults: Record<string, {
    weakTopics: string[]
    correct: number
    total: number
    passedAt: string
    topicScores: Record<string, number>
  }>

  // Дополнительные материалы запрошенные пользователем
  extraStepMaterials: Record<string, { format: string; materials: import('../lib/groqChat').MaterialSuggestion[] }>

  // Daily XP history
  dailyXpHistory: Record<string, number>

  // Achievements
  earnedAchievements: string[]
  newAchievements: string[]

  // Actions
  selectSphere: (sphereId: string) => void
  completeStep: (stepId: number, nextStepId: number | null, xpAmount: number, stepTitle: string, materialType?: 'video' | 'article' | 'quiz') => void
  addMaterialXp: (type: 'video' | 'article' | 'quiz', amount: number) => void
  clearNewAchievements: () => void
  clearCurrentSphere: () => void
  resetSphereProfile: (sphereId: string) => void
  resetAll: () => void
  finishOnboarding: (subDirection: string | null, formats: string[], level: string, quizAnswers: { q: string; a: string }[]) => void
  recordQuizResult: (key: string, weakTopics: string[], correct: number, total: number, topicScores: Record<string, number>) => void
  addExtraMaterials: (stepKey: string, format: string, materials: import('../lib/groqChat').MaterialSuggestion[]) => void
}

// ── Helpers ────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function snapshotProgress(state: AppState): SphereProgress {
  return {
    completedStepIds: state.completedStepIds,
    currentStepId: state.currentStepId ?? 1,
    xp: state.xp,
    xpByType: state.xpByType,
  }
}

function saveCurrentSphere(state: AppState): Record<string, SphereProgress> {
  if (!state.sphereId) return state.savedProgress
  return { ...state.savedProgress, [state.sphereId]: snapshotProgress(state) }
}

function checkAchievements(state: Partial<AppState> & Pick<AppState, 'completedStepIds' | 'xp' | 'streak' | 'earnedAchievements'>): string[] {
  return ACHIEVEMENT_DEFS
    .filter(d => !state.earnedAchievements.includes(d.id))
    .filter(d => { try { return d.check(state as AppState) } catch { return false } })
    .map(d => d.id)
}

function updateStreak(state: AppState): { streak: number; lastActiveDate: string } {
  const today = new Date().toDateString()
  if (state.lastActiveDate === today) return { streak: state.streak, lastActiveDate: today }
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (state.lastActiveDate === yesterday) return { streak: state.streak + 1, lastActiveDate: today }
  return { streak: 1, lastActiveDate: today }
}

// ── Store ──────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      sphereId: null,
      subDirection: null,
      preferredFormats: [],
      detectedLevel: 'beginner',
      quizAnswers: [],
      completedStepIds: [],
      currentStepId: null,
      xp: 0,
      xpByType: { video: 0, article: 0, quiz: 0 },
      streak: 0,
      lastActiveDate: null,
      savedProgress: {},
      sphereProfiles: {},
      stepQuizResults: {},
      dailyXpHistory: {},
      earnedAchievements: [],
      newAchievements: [],
      extraStepMaterials: {},

      selectSphere: (sphereId: string) => {
        const state = get()
        const newSaved = saveCurrentSphere(state)
        const saved = newSaved[sphereId]
        const profile = state.sphereProfiles[sphereId]
        const streakData = updateStreak(state)

        set({
          onboarded: true,
          sphereId,
          savedProgress: newSaved,
          completedStepIds: saved?.completedStepIds ?? [],
          currentStepId: saved?.currentStepId ?? 1,
          xp: saved?.xp ?? 0,
          xpByType: saved?.xpByType ?? { video: 0, article: 0, quiz: 0 },
          subDirection: profile?.subDirection ?? null,
          preferredFormats: profile?.preferredFormats ?? [],
          detectedLevel: profile?.detectedLevel ?? 'beginner',
          quizAnswers: profile?.quizAnswers ?? [],
          earnedAchievements: state.earnedAchievements,
          newAchievements: [],
          ...streakData
        })
      },

      finishOnboarding: (subDirection, formats, level, quizAnswers) => {
        const state = get()
        const streakData = updateStreak(state)
        const currentSphereId = state.sphereId
        const finalSphereId = currentSphereId === 'it' && subDirection
          ? `it_${subDirection}`
          : currentSphereId || 'it'

        const newSaved = saveCurrentSphere(state)
        const alreadySaved = newSaved[finalSphereId]
        const profile: SphereProfile = { subDirection, preferredFormats: formats, detectedLevel: level, quizAnswers }

        set({
          onboarded: true,
          sphereId: finalSphereId,
          subDirection,
          preferredFormats: formats,
          detectedLevel: level,
          quizAnswers,
          savedProgress: newSaved,
          completedStepIds: alreadySaved?.completedStepIds ?? [],
          currentStepId: alreadySaved?.currentStepId ?? 1,
          xp: alreadySaved?.xp ?? 0,
          xpByType: alreadySaved?.xpByType ?? { video: 0, article: 0, quiz: 0 },
          sphereProfiles: { ...state.sphereProfiles, [finalSphereId]: profile },
          ...streakData
        })
      },

      recordQuizResult: (key, weakTopics, correct, total, topicScores) => {
        const state = get()
        set({
          stepQuizResults: {
            ...state.stepQuizResults,
            [key]: { weakTopics, correct, total, passedAt: new Date().toISOString(), topicScores }
          }
        })
      },

      completeStep: (stepId, nextStepId, xpAmount, _stepTitle, materialType) => {
        const state = get()
        if (state.completedStepIds.includes(stepId)) return

        const today = todayStr()
        const prevDailyXp = state.dailyXpHistory[today] ?? 0
        const newCompletedIds = [...state.completedStepIds, stepId]
        const streakData = updateStreak(state)
        const newXp = state.xp + xpAmount

        const newXpByType = { ...state.xpByType }
        if (materialType) newXpByType[materialType] += xpAmount
        else newXpByType.quiz += xpAmount

        const updatedState = {
          completedStepIds: newCompletedIds,
          currentStepId: nextStepId,
          xp: newXp,
          xpByType: newXpByType,
          dailyXpHistory: { ...state.dailyXpHistory, [today]: prevDailyXp + xpAmount },
          ...streakData
        }

        const newOnes = checkAchievements({
          ...state, ...updatedState,
          earnedAchievements: state.earnedAchievements
        })

        const newSaved = state.sphereId
          ? { ...state.savedProgress, [state.sphereId]: {
              completedStepIds: updatedState.completedStepIds,
              currentStepId: updatedState.currentStepId ?? 1,
              xp: updatedState.xp,
              xpByType: updatedState.xpByType,
            }}
          : state.savedProgress

        set({
          ...updatedState,
          savedProgress: newSaved,
          earnedAchievements: [...state.earnedAchievements, ...newOnes],
          newAchievements: newOnes
        })
      },

      addMaterialXp: (type, amount) => {
        const state = get()
        const today = todayStr()
        const prevDailyXp = state.dailyXpHistory[today] ?? 0
        set({
          xp: state.xp + amount,
          xpByType: { ...state.xpByType, [type]: state.xpByType[type] + amount },
          dailyXpHistory: { ...state.dailyXpHistory, [today]: prevDailyXp + amount }
        })
      },

      addExtraMaterials: (stepKey, format, materials) => {
        const state = get()
        set({
          extraStepMaterials: {
            ...state.extraStepMaterials,
            [stepKey]: {
              format,
              materials: [
                ...(state.extraStepMaterials[stepKey]?.materials ?? []),
                ...materials,
              ],
            },
          },
        })
      },

      clearNewAchievements: () => set({ newAchievements: [] }),

      clearCurrentSphere: () => {
        const state = get()
        set({ sphereId: null, preferredFormats: [], savedProgress: saveCurrentSphere(state) })
      },

      // Reset onboarding for one specific sphere (allows re-doing quiz)
      resetSphereProfile: (sphereId: string) => {
        const state = get()
        const newProfiles = { ...state.sphereProfiles }
        delete newProfiles[sphereId]
        const newSaved = { ...state.savedProgress }
        delete newSaved[sphereId]
        set({
          sphereProfiles: newProfiles,
          savedProgress: newSaved,
          ...(state.sphereId === sphereId ? {
            sphereId: null, preferredFormats: [], subDirection: null,
            detectedLevel: 'beginner', quizAnswers: [], completedStepIds: [],
            currentStepId: null, xp: 0, xpByType: { video: 0, article: 0, quiz: 0 }
          } : {})
        })
      },

      resetAll: () => set({
        onboarded: false, sphereId: null, subDirection: null, preferredFormats: [],
        detectedLevel: 'beginner', quizAnswers: [], completedStepIds: [],
        currentStepId: null, xp: 0, xpByType: { video: 0, article: 0, quiz: 0 },
        streak: 0, lastActiveDate: null, savedProgress: {}, sphereProfiles: {},
        stepQuizResults: {}, dailyXpHistory: {}, earnedAchievements: [], newAchievements: [],
        extraStepMaterials: {},
      })
    }),
    { name: 'progressors-app-state', version: 8 }
  )
)
