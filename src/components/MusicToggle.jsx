import { useState, useEffect, useRef, useCallback } from 'react'

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const FADE_MS = 800

export default function MusicToggle({ shouldPlay = false }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [hover, setHover] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const btnRef = useRef(null)
  const fadeRef = useRef(null)

  // Fade volume
  const fadeTo = useCallback((target) => {
    const audio = audioRef.current
    if (!audio) return
    clearInterval(fadeRef.current)
    const steps = 20
    const stepTime = FADE_MS / steps
    const diff = (target - audio.volume) / steps
    let step = 0
    fadeRef.current = setInterval(() => {
      step++
      audio.volume = Math.min(1, Math.max(0, audio.volume + diff))
      if (step >= steps) {
        clearInterval(fadeRef.current)
        audio.volume = target
        if (target === 0) audio.pause()
      }
    }, stepTime)
  }, [])

  // Init audio
  useEffect(() => {
    const audio = new Audio('/music.mp3')
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [])

  // Start music when shouldPlay becomes true, reset when false
  const hasStarted = useRef(false)
  useEffect(() => {
    if (!shouldPlay) {
      hasStarted.current = false
      return
    }
    if (hasStarted.current) return
    const a = audioRef.current
    if (!a) return
    a.play().then(() => {
      hasStarted.current = true
      fadeTo(0.4)
      setPlaying(true)
    }).catch(() => {})
  }, [shouldPlay, fadeTo])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      fadeTo(0)
      setPlaying(false)
    } else {
      audio.play().then(() => {
        fadeTo(0.4)
        setPlaying(true)
      }).catch(() => {})
    }
  }, [playing, fadeTo])

  // Magnetic effect
  const handleMouseMove = useCallback((e) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    setMousePos({ x: dx * 0.25, y: dy * 0.25 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHover(false)
    setMousePos({ x: 0, y: 0 })
  }, [])

  // Bars animation
  const bars = [1, 2, 3, 4]

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="no-export"
      style={{
        position: 'fixed',
        top: 24, right: 28,
        zIndex: 9999,
        width: 44, height: 44,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 3,
        transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(${hover ? 1.08 : 1})`,
        transition: `transform 0.3s ${EASE}, border-color 0.2s ${EASE}, background 0.2s ${EASE}`,
        outline: 'none',
        ...(hover ? {
          borderColor: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.18)',
        } : {}),
      }}
      aria-label={playing ? 'Mute music' : 'Play music'}
    >
      {bars.map((_, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            height: playing ? [10, 16, 12, 8][i] : 2.5,
            borderRadius: 2,
            background: '#fff',
            transition: `height 0.4s ${EASE}`,
            animation: playing ? `musicBar 0.8s ${EASE} ${i * 0.12}s infinite alternate` : 'none',
          }}
        />
      ))}

      <style>{`
        @keyframes musicBar {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </button>
  )
}
