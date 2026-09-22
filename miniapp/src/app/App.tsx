import { AnimatePresence } from 'framer-motion'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/shared/store/appStore'
import { BottomNav } from '@/shared/ui'
import AchievementToast from './AchievementToast'
import Dashboard from '@/pages/Dashboard'
import SkillTree from '@/pages/SkillTree'
import StepPage from '@/pages/StepPage'
import Progress from '@/pages/Progress'
import Achievements from '@/pages/Achievements'
import Quiz from '@/pages/Quiz'
import Onboarding from '@/features/onboarding'
import Profile from '@/pages/Profile'
import '@/styles/globals.css'

export default function App() {
  const sphereId = useAppStore((s) => s.sphereId)
  const sphereProfiles = useAppStore((s) => s.sphereProfiles)

  if (!sphereId || !sphereProfiles[sphereId]?.preferredFormats?.length) {
    return <Onboarding />
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tree" element={<SkillTree />} />
            <Route path="/step/:id" element={<StepPage />} />
            <Route path="/quiz/:stepId" element={<Quiz />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNav />
      <AnimatePresence>
        <AchievementToast />
      </AnimatePresence>
    </div>
  )
}
