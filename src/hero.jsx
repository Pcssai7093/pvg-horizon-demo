import React, { useEffect, useRef, useState } from 'react'
import { asset } from './catalog'

export function HeroMedia({ poster, posterAlt }) {
  const video = useRef(null)
  const [showVideo, setShowVideo] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: no-preference)')
    const update = () => setShowVideo(motion.matches)
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  return <div className="hero-media">
    {showVideo && !failed ? <>
      <video ref={video} autoPlay muted loop playsInline poster={poster} src={asset('hero.mp4') + '?v=model-loop-2'}
        aria-label="Indian model showcasing the CZ necklace collection" onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
      <button type="button" className="hero-playback" onClick={() => {
        const player = video.current
        if (player.paused) player.play().catch(() => setPlaying(false))
        else player.pause()
      }}>{playing ? 'Pause video' : 'Play video'}</button>
    </> : <img src={poster} alt={posterAlt} fetchPriority="high" />}
  </div>
}


