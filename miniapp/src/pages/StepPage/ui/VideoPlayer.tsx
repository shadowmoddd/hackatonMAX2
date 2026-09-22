import { useState } from 'react'
import { detectVideoSource } from '../lib/levelHints'

interface VideoPlayerProps {
  title: string
  videoId: string | null
  videoUrl: string | null
  searchQuery: string | null
  onClose: () => void
}

export default function VideoPlayer({ title, videoId, videoUrl, searchQuery, onClose }: VideoPlayerProps) {
  const source = videoId
    ? { type: 'youtube' as const, id: videoId }
    : detectVideoSource(videoUrl, searchQuery)

  // Если embed заблокирован (видео не разрешает встраивание)
  const [embedBlocked, setEmbedBlocked] = useState(false)

  const openExternal = (url: string) => {
    if (window.WebApp?.openLink) {
      window.WebApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  const renderPlayer = () => {
    switch (source.type) {
      case 'youtube': {
        const ytUrl = `https://www.youtube.com/watch?v=${source.id}`
        if (embedBlocked) {
          return (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '16px', padding: '24px', background: '#0a0a1a',
            }}>
              <div style={{ fontSize: '48px' }}>🎬</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                  {title}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  Это видео не разрешает встроенный просмотр.
                  Открой в MAX или браузере.
                </div>
              </div>
              <button
                onClick={() => openExternal(ytUrl)}
                style={{
                  padding: '13px 24px', background: 'rgba(255,0,0,0.85)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                ▶ Смотреть видео
              </button>
            </div>
          )
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${source.id}?autoplay=1&rel=0&modestbranding=1`}
            style={{ flex: 1, width: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title}
            onError={() => setEmbedBlocked(true)}
          />
        )
      }

      case 'rutube':
        return (
          <iframe
            src={`https://rutube.ru/play/embed/${source.id}/?autostartmute=false`}
            style={{ flex: 1, width: '100%', border: 'none' }}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )

      case 'direct':
        return (
          <video
            src={source.url}
            controls autoPlay playsInline
            style={{ flex: 1, width: '100%', background: '#000' }}
          />
        )

      case 'search': {
        const query = source.query || title
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        if (window.WebApp?.openLink) {
          window.WebApp.openLink(ytSearchUrl)
        }
        onClose()
        return null
      }
    }
  }

  const player = renderPlayer()
  if (!player) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px',
        background: 'rgba(11,15,46,0.95)',
        borderBottom: '1px solid rgba(124,58,237,0.3)',
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 16px', color: 'white', fontSize: '14px', cursor: 'pointer',
          }}
        >← Назад</button>
        <span style={{
          flex: 1, textAlign: 'center', color: 'white', fontSize: '14px', fontWeight: 600,
          padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          {source.type === 'youtube' ? 'YT' : source.type === 'rutube' ? 'RT' : ''}
        </span>
      </div>
      {player}
    </div>
  )
}
