import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Brush, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend
} from 'recharts'
import { PageTransition } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere } from '@/entities/sphere'

const PIE_COLORS = ['#7C3AED', '#06B6D4', '#F59E0B']

function getCellColor(level: number): string {
  const colors: Record<number, string> = {
    0: 'rgba(71,85,105,0.2)', 1: 'rgba(124,58,237,0.25)',
    2: 'rgba(124,58,237,0.5)', 3: 'rgba(124,58,237,0.75)', 4: 'rgba(159,103,255,1)'
  }
  return colors[level] ?? colors[0]
}

function getCellGlow(level: number): string {
  if (level === 4) return '0 0 8px rgba(124,58,237,0.8)'
  if (level === 3) return '0 0 4px rgba(124,58,237,0.4)'
  return 'none'
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function Progress() {
  const { sphereId, completedStepIds, xpByType, dailyXpHistory, streak, xp } = useAppStore()
  const sphere = getSphere(sphereId ?? 'it')
  const totalSteps = sphere?.steps.length ?? 7

  const completedFraction = totalSteps > 0 ? completedStepIds.length / totalSteps : 0
  const radarData = [
    { skill: 'Шаги',  value: Math.round(completedFraction * 100) },
    { skill: 'XP',    value: Math.round(Math.min(xp / 1000, 1) * 100) },
    { skill: 'Квизы', value: Math.round(Math.min(xpByType.quiz / 100, 1) * 100) },
    { skill: 'Стрик', value: Math.round(Math.min(streak / 30, 1) * 100) },
    { skill: 'Видео', value: Math.round(Math.min(xpByType.video / 100, 1) * 100) },
  ]

  const last30days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().split('T')[0]
    return { day: i + 1, label: `${i + 1}`, daily: dailyXpHistory[key] ?? 0, cumulative: 0 }
  })
  let cum = 0
  const xpHistory = last30days.map(d => { cum += d.daily; return { ...d, cumulative: cum } })

  const pieData = [
    { name: 'Видео',  value: Math.max(xpByType.video, 0) },
    { name: 'Статьи', value: Math.max(xpByType.article, 0) },
    { name: 'Квизы',  value: Math.max(xpByType.quiz, 0) },
  ].filter(d => d.value > 0)
  const pieDataFinal = pieData.length > 0 ? pieData : [{ name: 'Нет данных', value: 1 }]

  const calendarData = Array.from({ length: 56 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (55 - i))
    const key = d.toISOString().split('T')[0]
    const dayXp = dailyXpHistory[key] ?? 0
    const level = dayXp === 0 ? 0 : dayXp < 50 ? 1 : dayXp < 100 ? 2 : dayXp < 200 ? 3 : 4
    return { index: i, level }
  })

  return (
    <PageTransition>
      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', paddingBottom: '24px' }}>
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>📊 Прогресс</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Твоя статистика за всё время</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>📈 История XP (30 дней)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={xpHistory} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="lineGradientViolet" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#9F67FF" />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(26,32,69,0.95)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '12px' }} />
              <ReferenceLine y={0} stroke="rgba(124,58,237,0.1)" />
              <Line type="monotone" dataKey="daily" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#9F67FF' }} name="Ежедневно" />
              <Line type="monotone" dataKey="cumulative" stroke="#06B6D4" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: '#22D3EE' }} name="Накоплено" />
              <Brush dataKey="label" height={20} stroke="rgba(124,58,237,0.3)" fill="rgba(11,15,46,0.8)" travellerWidth={6} />
              <Legend formatter={(v: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{v}</span>} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>🕸 Профиль навыков</div>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(124,58,237,0.2)" gridType="polygon" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Навыки" dataKey="value" stroke="#06B6D4" strokeWidth={2} fill="rgba(124,58,237,0.25)" fillOpacity={1} dot={{ fill: '#9F67FF', r: 4, strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>📅 Активность за 2 месяца</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '5px' }}>
            {calendarData.map(cell => (
              <div key={cell.index} title={`Уровень: ${cell.level}`} style={{ aspectRatio: '1', borderRadius: '3px', background: getCellColor(cell.level), boxShadow: getCellGlow(cell.level), transition: 'transform 0.15s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Меньше</span>
            {[0, 1, 2, 3, 4].map(l => <div key={l} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getCellColor(l) }} />)}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Больше</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>⏰ Распределение времени</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <defs>
                {PIE_COLORS.map((color, i) => (
                  <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={color} stopOpacity={1} /><stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </radialGradient>
                ))}
              </defs>
              <Pie data={pieDataFinal} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieDataFinal.map((_, i) => <Cell key={i} fill={`url(#pieGrad${i % PIE_COLORS.length})`} style={{ filter: `drop-shadow(0 0 8px ${PIE_COLORS[i % PIE_COLORS.length]}66)` }} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(26,32,69,0.95)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '12px' }} formatter={(value: number) => [`${value} XP`, '']} />
              <Legend formatter={(v: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Всего XP',     value: `${xp}`,                         icon: '⚡', color: 'var(--accent-glow)' },
              { label: 'Лучший стрик', value: `${streak} дней`,                 icon: '🔥', color: 'var(--accent-gold)' },
              { label: 'Материалов',   value: `${completedStepIds.length * 2}`, icon: '📚', color: 'var(--accent-cyan-glow)' },
              { label: 'Шагов',        value: `${completedStepIds.length}`,      icon: '🎯', color: 'var(--success)' }
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  )
}
