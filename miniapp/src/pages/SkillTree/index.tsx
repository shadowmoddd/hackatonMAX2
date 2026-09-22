import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/shared/ui'
import { useAppStore } from '@/shared/store/appStore'
import { getSphere } from '@/entities/sphere'

type SkillStatus = 'completed' | 'current' | 'locked'

interface SkillNodeData {
  label: string
  status: SkillStatus
  xp: number
  [key: string]: unknown
}

function SkillNode({ data, selected }: NodeProps) {
  const nodeData = data as SkillNodeData
  const { label, status, xp } = nodeData
  const [hovered, setHovered] = useState(false)

  const getNodeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      transform: hovered ? 'scale(1.12)' : selected ? 'scale(1.08)' : 'scale(1)'
    }

    if (status === 'completed') {
      return {
        ...base,
        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
        border: '2px solid #9F67FF',
        boxShadow: hovered
          ? '0 0 28px rgba(124,58,237,0.9), 0 0 50px rgba(124,58,237,0.4)'
          : '0 0 18px rgba(124,58,237,0.6)'
      }
    }
    if (status === 'current') {
      return {
        ...base,
        background: 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 100%)',
        border: '2px solid #22D3EE',
        boxShadow: hovered
          ? '0 0 28px rgba(6,182,212,0.9), 0 0 50px rgba(6,182,212,0.4)'
          : '0 0 18px rgba(6,182,212,0.6)',
        animation: 'ring-pulse 2s infinite'
      }
    }
    return {
      ...base,
      background: 'rgba(71,85,105,0.3)',
      border: '2px solid rgba(71,85,105,0.4)',
      boxShadow: 'none',
      opacity: 0.7
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'transparent', border: 'none' }} />
      <div style={getNodeStyle()}>
        {status === 'completed' && <span>✓</span>}
        {status === 'current' && <span>▶</span>}
        {status === 'locked' && <span style={{ opacity: 0.5 }}>🔒</span>}
      </div>
      <div style={{ textAlign: 'center', maxWidth: '90px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: status === 'locked' ? 400 : 600,
            color: status === 'locked' ? 'rgba(148,163,184,0.5)' : 'var(--text-primary)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '90px'
          }}
        >
          {label}
        </div>
        {status === 'current' && (
          <div
            style={{
              fontSize: '9px',
              color: 'var(--accent-cyan-glow)',
              fontWeight: 600,
              marginTop: '2px',
              background: 'rgba(6,182,212,0.15)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block'
            }}
          >
            → Текущий
          </div>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(26,32,69,0.95)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '5px 10px',
                fontSize: '11px',
                color: 'var(--accent-gold)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                zIndex: 1000,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
              }}
            >
              +{xp} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'transparent', border: 'none' }} />
    </div>
  )
}

const nodeTypes = { skillNode: SkillNode }

const NODE_X = [160, 40, 280, 20, 160, 300, 160]
const NODE_Y = [40, 180, 180, 330, 330, 330, 480]

const edgeStyle = { stroke: '#7C3AED', strokeWidth: 2 }
const edgeStyleCyan = { stroke: '#06B6D4', strokeWidth: 2 }
const edgeStyleLocked = { stroke: 'rgba(71,85,105,0.5)', strokeWidth: 1.5 }

function buildEdges(steps: { id: number }[], completedIds: number[], currentId: number | null): Edge[] {
  const edges: Edge[] = []
  for (let i = 0; i < steps.length - 1; i++) {
    const src = steps[i].id
    const tgt = steps[i + 1].id
    const srcCompleted = completedIds.includes(src)
    const tgtCurrent = tgt === currentId
    const animated = srcCompleted || tgtCurrent
    const style = srcCompleted ? edgeStyle : tgtCurrent ? edgeStyleCyan : edgeStyleLocked
    edges.push({
      id: `e${src}-${tgt}`,
      source: String(src),
      target: String(tgt),
      animated,
      style,
      markerEnd: animated ? { type: MarkerType.ArrowClosed, color: style.stroke } : undefined
    })
  }
  return edges
}

export default function SkillTree() {
  const navigate = useNavigate()
  const { sphereId, completedStepIds, currentStepId } = useAppStore()
  const sphere = getSphere(sphereId || 'it')

  const dynNodes: Node[] = (sphere?.steps || []).map((step, i) => {
    let status: SkillStatus = 'locked'
    if (completedStepIds.includes(step.id)) status = 'completed'
    else if (step.id === currentStepId) status = 'current'
    return {
      id: String(step.id),
      type: 'skillNode',
      position: { x: NODE_X[i] ?? 160, y: NODE_Y[i] ?? i * 150 },
      data: { label: step.title, status, xp: step.xp }
    }
  })

  const dynEdges = buildEdges(sphere?.steps || [], completedStepIds, currentStepId)
  const [nodes, , onNodesChange] = useNodesState(dynNodes)
  const [edges, , onEdgesChange] = useEdgesState(dynEdges)

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if ((node.data as SkillNodeData).status !== 'locked') navigate(`/step/${node.id}`)
    },
    [navigate]
  )

  const completedCount = nodes.filter((n) => (n.data as SkillNodeData).status === 'completed').length
  const currentCount = nodes.filter((n) => (n.data as SkillNodeData).status === 'current').length
  const lockedCount = nodes.filter((n) => (n.data as SkillNodeData).status === 'locked').length

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div
          style={{
            padding: '16px',
            background: 'rgba(11,15,46,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 10,
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Назад
            </button>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>🌳 Дерево навыков</div>
            <div style={{ width: '80px' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{sphere?.roadmapTitle || 'Маршрут'}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{completedCount} из {nodes.length} навыков освоено</div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes} onNodeClick={onNodeClick}
            fitView fitViewOptions={{ padding: 0.3 }}
            panOnDrag zoomOnScroll minZoom={0.3} maxZoom={2.5}
            style={{ background: 'var(--bg-deep)' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(124,58,237,0.15)" />
          </ReactFlow>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--grad-glow)', pointerEvents: 'none', zIndex: 1 }} />
        </div>

        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(11,15,46,0.95)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexShrink: 0,
            marginBottom: '72px'
          }}
        >
          {[
            { icon: '✅', count: completedCount, label: 'пройдено', color: 'var(--success)' },
            { icon: '▶', count: currentCount, label: 'текущий', color: 'var(--accent-cyan)' },
            { icon: '🔒', count: lockedCount, label: 'заблокировано', color: 'var(--text-muted)' }
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.count}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
