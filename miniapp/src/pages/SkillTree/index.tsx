import { useCallback, useMemo, useState } from 'react'
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
      width: 'clamp(52px, 5vw, 72px)',
      height: 'clamp(52px, 5vw, 72px)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(18px, 2vw, 24px)',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      transform: hovered
        ? 'scale(1.12)'
        : selected
          ? 'scale(1.08)'
          : 'scale(1)'
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
      className="skill-node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          border: 'none'
        }}
      />

      <div style={getNodeStyle()}>
        {status === 'completed' && <span>✓</span>}
        {status === 'current' && <span>▶</span>}
        {status === 'locked' && (
          <span style={{ opacity: 0.5 }}>🔒</span>
        )}
      </div>

      <div className="skill-node-label">
        <div
          className={`skill-node-title ${
            status === 'locked'
              ? 'skill-node-title--locked'
              : ''
          }`}
        >
          {label}
        </div>

        {status === 'current' && (
          <div className="skill-node-current">
            → Текущий
          </div>
        )}

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 4
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.8
              }}
              transition={{ duration: 0.15 }}
              className="skill-node-tooltip"
            >
              +{xp} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: 'transparent',
          border: 'none'
        }}
      />
    </div>
  )
}

const nodeTypes = {
  skillNode: SkillNode
}

const NODE_X = [
  160,
  40,
  280,
  20,
  160,
  300,
  160
]

const NODE_Y = [
  40,
  180,
  180,
  330,
  330,
  330,
  480
]

const edgeStyle = {
  stroke: '#7C3AED',
  strokeWidth: 2
}

const edgeStyleCyan = {
  stroke: '#06B6D4',
  strokeWidth: 2
}

const edgeStyleLocked = {
  stroke: 'rgba(71,85,105,0.5)',
  strokeWidth: 1.5
}

function buildEdges(
  steps: { id: number }[],
  completedIds: number[],
  currentId: number | null
): Edge[] {
  const edges: Edge[] = []

  for (let i = 0; i < steps.length - 1; i++) {
    const src = steps[i].id
    const tgt = steps[i + 1].id

    const srcCompleted = completedIds.includes(src)
    const tgtCurrent = tgt === currentId
    const animated = srcCompleted || tgtCurrent

    const style = srcCompleted
      ? edgeStyle
      : tgtCurrent
        ? edgeStyleCyan
        : edgeStyleLocked

    edges.push({
      id: `e${src}-${tgt}`,
      source: String(src),
      target: String(tgt),
      animated,
      style,
      markerEnd: animated
        ? {
            type: MarkerType.ArrowClosed,
            color: style.stroke
          }
        : undefined
    })
  }

  return edges
}

export default function SkillTree() {
  const navigate = useNavigate()

  const {
    sphereId,
    completedStepIds,
    currentStepId
  } = useAppStore()

  const sphere = getSphere(sphereId || 'it')

  const dynNodes: Node[] = useMemo(
    () =>
      (sphere?.steps || []).map((step, i) => {
        let status: SkillStatus = 'locked'

        if (completedStepIds.includes(step.id)) {
          status = 'completed'
        } else if (step.id === currentStepId) {
          status = 'current'
        }

        return {
          id: String(step.id),
          type: 'skillNode',
          position: {
            x: NODE_X[i] ?? 160,
            y: NODE_Y[i] ?? i * 150
          },
          data: {
            label: step.title,
            status,
            xp: step.xp
          }
        }
      }),
    [sphere?.steps, completedStepIds, currentStepId]
  )

  const dynEdges = useMemo(
    () =>
      buildEdges(
        sphere?.steps || [],
        completedStepIds,
        currentStepId
      ),
    [sphere?.steps, completedStepIds, currentStepId]
  )

  const [nodes, , onNodesChange] =
    useNodesState(dynNodes)

  const [edges, , onEdgesChange] =
    useEdgesState(dynEdges)

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (
        (node.data as SkillNodeData).status !== 'locked'
      ) {
        navigate(`/step/${node.id}`)
      }
    },
    [navigate]
  )

  const completedCount = nodes.filter(
    (n) =>
      (n.data as SkillNodeData).status === 'completed'
  ).length

  const currentCount = nodes.filter(
    (n) =>
      (n.data as SkillNodeData).status === 'current'
  ).length

  const lockedCount = nodes.filter(
    (n) =>
      (n.data as SkillNodeData).status === 'locked'
  ).length

  return (
    <PageTransition>
      <div className="skill-tree-page">

        {/* HEADER */}
        <header className="skill-tree-header">
          <div className="skill-tree-header-inner">

            <button
              onClick={() => navigate('/')}
              className="skill-tree-back"
            >
              <span>←</span>
              <span>Назад</span>
            </button>

            <div className="skill-tree-heading">
              <div className="skill-tree-title">
                🌳 Дерево навыков
              </div>

              <div className="skill-tree-subtitle">
                {sphere?.roadmapTitle || 'Маршрут'}
              </div>
            </div>

            <div className="skill-tree-counter">
              <strong>{completedCount}</strong>
              <span>из {nodes.length}</span>
            </div>

          </div>

          <div className="skill-tree-mobile-progress">
            {completedCount} из {nodes.length} навыков освоено
          </div>
        </header>

        {/* FLOW */}
        <main className="skill-tree-flow">

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{
              padding: 0.3
            }}
            panOnDrag
            zoomOnScroll
            minZoom={0.3}
            maxZoom={2.5}
            style={{
              background: 'var(--bg-deep)'
            }}
            proOptions={{
              hideAttribution: true
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(124,58,237,0.15)"
            />
          </ReactFlow>

          <div className="skill-tree-glow" />

          <div className="skill-tree-hint">
            Перетаскивай карту · Используй колесо для масштаба
          </div>

        </main>

        {/* LEGEND */}
        <footer className="skill-tree-footer">

          <div className="skill-tree-footer-inner">

            {[
              {
                icon: '✅',
                count: completedCount,
                label: 'пройдено',
                color: 'var(--success)'
              },
              {
                icon: '▶',
                count: currentCount,
                label: 'текущий',
                color: 'var(--accent-cyan)'
              },
              {
                icon: '🔒',
                count: lockedCount,
                label: 'заблокировано',
                color: 'var(--text-muted)'
              }
            ].map((item) => (
              <div
                key={item.label}
                className="skill-tree-stat"
              >
                <span className="skill-tree-stat-icon">
                  {item.icon}
                </span>

                <span
                  className="skill-tree-stat-count"
                  style={{ color: item.color }}
                >
                  {item.count}
                </span>

                <span className="skill-tree-stat-label">
                  {item.label}
                </span>
              </div>
            ))}

          </div>

        </footer>
      </div>
    </PageTransition>
  )
}