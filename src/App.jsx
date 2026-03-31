import { useState, useEffect } from 'react'
import Questionnaire from './components/Questionnaire'
import BlueprintPage from './components/BlueprintPage'
// import { Agentation } from 'agentation'
import MusicToggle from './components/MusicToggle'
import './index.css'

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

const ANIM_BASE = {
  opacity: 0, filter: 'blur(6px)', transform: 'translateY(12px)',
  transition: `opacity 0.5s ${EASE_OUT}, filter 0.5s ${EASE_OUT}, transform 0.5s ${EASE_OUT}`,
}

function IntroScreen({ onStart }) {
  const [show, setShow] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setShow(true)) }, [])

  const reveal = (delay) => ({
    ...ANIM_BASE,
    transitionDelay: `${delay}s`,
    ...(show ? { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' } : {}),
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/Main%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: '#4A7A5C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#F5F2EC',
        borderRadius: 14,
        padding: '28px 44px 0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        position: 'relative', overflow: 'hidden',
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(8px)',
        transition: `opacity 0.4s ${EASE_OUT}, transform 0.5s ${EASE_OUT}`,
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: 'clamp(48px, 8vw, 72px)',
          lineHeight: 1.0, letterSpacing: '-0.02em',
          color: '#0D0D0D',
          marginBottom: 4,
          ...reveal(0.15),
        }}>
          The Reset
        </h1>

        <p style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: 24, lineHeight: 1.4, color: '#8A8580',
          marginBottom: 16,
          ...reveal(0.3),
        }}>
          A quick reset for your design career.
        </p>

        {/* Body — animated together */}
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: 26, lineHeight: 1.15, color: '#2A2520',
          ...reveal(0.45),
        }}>
          <p style={{ marginBottom: 6 }}>
            Answer a few questions.
          </p>
          <p style={{ marginBottom: 16 }}>
            We'll map where you are, <span style={{ fontWeight: 500 }}>what's missing,</span> and where you <span style={{ fontWeight: 500 }}>should go next.</span>
          </p>
          <p style={{ marginBottom: 6 }}>
            At the end, you get your <span style={{ fontWeight: 500 }}>blueprint.</span>
          </p>
          <p style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 500 }}>Clear direction. Real focus. No guesswork.</span>
          </p>
        </div>

        {/* Divider + CTA row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 20, paddingTop: 8,
          borderTop: '1px solid rgba(13,13,13,0.08)',
          ...reveal(0.7),
        }}>
          <button
            onClick={onStart}
            className="intro-cta"
            style={{
              padding: '12px 24px',
              background: '#0D0D0D', color: '#F5F2EC',
              border: 'none', borderRadius: 8,
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 14, letterSpacing: '-0.04em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              position: 'relative', overflow: 'hidden',
              transition: `transform 160ms ${EASE_OUT}`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Let's start
            <span style={{
              display: 'inline-block',
              transition: `transform 200ms ${EASE_OUT}`,
            }} className="intro-arrow">→</span>
          </button>

          {/* Wax seal stamp */}
          <img
            src="/Stamp.png"
            alt="The Reset seal"
            style={{
              width: 72, height: 72,
              flexShrink: 0,
              objectFit: 'contain',
              transform: 'rotate(-15deg)',
              margin: '16px 0',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [phase, setPhase] = useState('intro')
  const [answers, setAnswers] = useState(null)
  const [curtain, setCurtain] = useState(false)

  const goTo = (next, data) => {
    setCurtain(true)
    setTimeout(() => {
      if (data !== undefined) setAnswers(data)
      setPhase(next)
      // Small delay so new page mounts behind curtain
      setTimeout(() => setCurtain(false), 50)
    }, 400)
  }

  return (
    <>
      <MusicToggle />
      {phase === 'intro' && (
        <IntroScreen onStart={() => goTo('questionnaire')} />
      )}
      {phase === 'questionnaire' && (
        <Questionnaire onComplete={a => goTo('blueprint', a)} />
      )}
      {phase === 'blueprint' && (
        <BlueprintPage
          answers={answers}
          onRestart={() => { setAnswers(null); goTo('intro') }}
        />
      )}
      {/* Curtain overlay — sits on top */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: '#0D0D0D',
        opacity: curtain ? 1 : 0,
        pointerEvents: curtain ? 'all' : 'none',
        transition: `opacity 0.4s ${EASE_OUT}`,
      }} />
      {/* <Agentation /> */}
    </>
  )
}
