import { useState } from 'react'
import { motion } from 'framer-motion'
import { type StepMaterial } from '@/entities/sphere'
import { extractYouTubeId, extractRutubeId } from '../lib/levelHints'

interface MaterialCardProps {
  material: StepMaterial
  onStart: () => void
}

function getYouTubeId(material: StepMaterial): string | null {
  if (material.videoId) return material.videoId
  if (material.videoUrl) return extractYouTubeId(material.videoUrl)
  return null
}

export default function VideoCard({ material, onStart }: MaterialCardProps) {
  const ytId = getYouTubeId(material)
  // Пробуем mqdefault → hqdefault → gradient
  const [thumbUrl, setThumbUrl] = useState<string | null>(
    ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
  )
  const [thumbFailed, setThumbFailed] = useState(false)

  const handleThumbError = () => {
    if (thumbUrl?.includes('mqdefault')) {
      // Попробуем hqdefault
      setThumbUrl(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`)
    } else {
      setThumbFailed(true)
    }
  }

  // RuTube thumbnail
  const rtId = !ytId && material.videoUrl ? extractRutubeId(material.videoUrl) : null
  const effectiveThumbUrl = thumbFailed ? null : (thumbUrl ?? (rtId ? `https://rutube.ru/api/video/${rtId}/thumbnail/` : null))
  const showThumb = !!effectiveThumbUrl && !thumbFailed

  const platformLabel = material.source || (ytId ? 'YouTube' : rtId ? 'RuTube' : 'Видео')

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(6,182,212,0.4)', boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
      }}
      onClick={onStart}
    >
      {/* Превью */}
      <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
        {showThumb ? (
          <>
            <img
              src={effectiveThumbUrl!}
              alt={material.title}
              onError={handleThumbError}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Градиент + кнопка Play */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '52px', height: '52px',
                  background: ytId ? 'rgba(255,0,0,0.85)' : 'rgba(124,58,237,0.85)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: 'white',
                  boxShadow: ytId ? '0 0 20px rgba(255,0,0,0.5)' : '0 0 20px rgba(124,58,237,0.5)',
                }}
              >▶</motion.div>
            </div>
            {/* Бейдж платформы */}
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,0,0,0.7)', color: 'white',
              fontSize: '10px', fontWeight: 700, padding: '3px 7px', borderRadius: '4px',
            }}>
              {platformLabel.toUpperCase()}
            </div>
          </>
        ) : (
          /* Fallback gradient */
          <div style={{
            height: '100%',
            background: 'linear-gradient(135deg, #1a0533 0%, #0a1a3d 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{
                width: '52px', height: '52px',
                background: 'rgba(124,58,237,0.8)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', color: 'white',
                boxShadow: '0 0 24px rgba(124,58,237,0.6)',
              }}
            >▶</motion.div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
          {material.title}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{material.duration}</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
            +{material.xp} XP
          </span>
        </div>
      </div>
    </motion.div>
  )
}
