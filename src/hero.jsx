import React, { useEffect, useRef, useState } from 'react'
import { asset } from './catalog'

const motionPreference = '(prefers-reduced-motion: no-preference)'

export function HeroMedia({ poster, posterAlt }) {
  const [showVideo, setShowVideo] = useState(() => matchMedia(motionPreference).matches)

  useEffect(() => {
    const motion = matchMedia(motionPreference)
    const update = () => setShowVideo(motion.matches)
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  if (!showVideo) {
    return <div className="hero-media"><img src={poster} alt={posterAlt} fetchPriority="high" /></div>
  }

  return <HeroVideo poster={poster} posterAlt={posterAlt} />
}

function HeroVideo({ poster, posterAlt }) {
  const video = useRef(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const player = video.current
    let active = true
    player.play().catch(error => {
      if (active && error.name === 'NotAllowedError') setBlocked(true)
    })
    return () => { active = false }
  }, [])

  return <div className="hero-media hero-media-video">
    {failed ? <img src={poster} alt={posterAlt} /> : <>
      <video ref={video} className={ready ? 'hero-video-ready' : ''} autoPlay muted loop playsInline src={asset('hero.mp4') + '?v=model-loop-2'}
        aria-label="Indian model showcasing the CZ necklace collection"
        onPlaying={() => { setReady(true); setPlaying(true); setBlocked(false) }}
        onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
      <button type="button" className={`hero-playback${blocked ? ' hero-playback-visible' : ''}`} onClick={() => {
        const player = video.current
        if (player.paused) player.play().catch(() => setBlocked(true))
        else player.pause()
      }}>{playing ? 'Pause video' : 'Play video'}</button>
    </>}
  </div>
}
