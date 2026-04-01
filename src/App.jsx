import { useState, useEffect } from 'react'
import Questionnaire from './components/Questionnaire'
import BlueprintPage from './components/BlueprintPage'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from './lib/firebase'

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
      backgroundColor: '#fff',
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
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13, color: 'rgba(138,133,128,0.5)',
          letterSpacing: '-0.02em',
          textAlign: 'left',
          padding: '6px 0 0',
        }}>
          A project by{' '}
          <a
            href="https://x.com/xyanandc"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(138,133,128,0.7)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Anand Chauhan
          </a>
        </p>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'the-reset-blueprint'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveBlueprintData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function clearBlueprintData() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

function AppInner() {
  const user = useAuth()
  const saved = loadSaved()
  const [phase, setPhase] = useState(saved ? 'blueprint' : 'intro')
  const [answers, setAnswers] = useState(saved)
  const [curtain, setCurtain] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)

  const goTo = (next, data) => {
    setCurtain(true)
    setTimeout(() => {
      if (data !== undefined) setAnswers(data)
      setPhase(next)
      setTimeout(() => setCurtain(false), 50)
    }, 400)
  }

  // Still loading auth state
  if (user === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#fff',
      }} />
    )
  }

  return (
    <>
      <MusicToggle shouldPlay={musicStarted} />
      {user && phase !== 'blueprint' && (
        <button
          onClick={() => {
            signOut(auth)
            clearBlueprintData()
            setAnswers(null)
            setMusicStarted(false)
            goTo('intro')
          }}
          style={{
            position: 'fixed',
            top: 24, right: 80,
            zIndex: 9999,
            height: 44,
            padding: '0 16px',
            borderRadius: 50,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: '-0.02em',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: `border-color 0.2s ${EASE_OUT}, background 0.2s ${EASE_OUT}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      )}
      {/* Mobile message */}
      <div className="mobile-only" style={{
        display: 'none',
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundImage: 'url(/Main%20image.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        padding: 32,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: 360,
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 28,
            lineHeight: 1.2,
            color: '#0D0D0D',
            letterSpacing: '-0.02em',
          }}>
            For the full experience, please switch to desktop.
          </p>
        </div>
      </div>

      {phase === 'intro' && (
        <IntroScreen onStart={() => { setMusicStarted(true); goTo('questionnaire') }} />
      )}
      {phase === 'questionnaire' && (
        <Questionnaire user={user} onComplete={a => {
          saveBlueprintData(a)
          goTo('blueprint', a)
        }} />
      )}
      {phase === 'blueprint' && (
        <BlueprintPage
          answers={answers}
          onRestart={() => {
            clearBlueprintData()
            window.location.reload()
          }}
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
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
