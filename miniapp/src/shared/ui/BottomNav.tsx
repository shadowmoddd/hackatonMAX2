import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: '⌂', label: 'Главная' },
  { path: '/tree', icon: '⌁', label: 'Маршрут' },
  { path: '/progress', icon: '↗', label: 'Прогресс' },
  { path: '/achievements', icon: '✦', label: 'Успехи' },
  { path: '/profile', icon: '◯', label: 'Профиль' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="app-nav" aria-label="Основная навигация">
      <div className="app-nav__inner">
        <div className="app-nav__brand">
          <div className="app-nav__brand-mark">S</div>
          <div>
            <strong>SKILLY</strong>
            <span>персональный маршрут</span>
          </div>
        </div>

        <div className="app-nav__items">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)

            return (
              <motion.button
                key={item.path}
                className={`app-nav__item ${isActive ? 'is-active' : ''}`}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.96 }}
                type="button"
              >
                <span className="app-nav__icon">{item.icon}</span>
                <span className="app-nav__label">{item.label}</span>
                <AnimatePresence>
                  {isActive && <motion.span
                    className="app-nav__active-dot"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  />}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
