import React, { useState, useEffect, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'

// ─── Map AI blueprint data to render shape ──────────────────────────────────
function buildData(a = {}) {
  const bp = a._blueprint
  if (bp) {
    return {
      name:          bp.header?.name || a.name || 'Designer',
      currentSalary: bp.header?.currentIncome || a.currentSalary || '-',
      targetSalary:  bp.header?.targetIncome || a.targetSalary || '-',
      date:          (() => {
        const raw = bp.header?.generatedOn
        if (!raw) return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        const d = new Date(raw)
        return isNaN(d) ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      })(),
      superpower:    bp.superpower || { label: bp.positioning?.superpowerLabel || 'Design', summary: '' },
      targetRole:    a.targetRole || 'Product Designer',
      tagline:       bp.tagline || '',
      positioning:   bp.positioning?.headline || bp.positioning?.positioningStatement || '',
      brutalTruth:   bp.brutalTruth || null,
      strengths:     bp.strengths || [],
      gapActions:    bp.gapActionSystem || [],
      caseStudy:     bp.caseStudyDirection || null,
      portfolio:     bp.portfolioDirection || null,
      learning:      bp.learningRoadmap || [],
      startHere:     bp.startHere || [],
      archetype:     bp.archetype || '',
      finalStatement: bp.finalStatement || '',
      photo:         a.photo || null,
    }
  }

  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const superpower = (a.strengths || [])[0] || 'Design'
  const targetRole = Array.isArray(a.targetRole) ? a.targetRole[0] : a.targetRole || 'Product Designer'

  return {
    name: a.name || 'Designer',
    currentSalary: a.currentSalary || '-',
    targetSalary: a.targetSalary || '-',
    date,
    superpower: { label: superpower, summary: '' },
    targetRole,
    tagline: `A ${superpower.toLowerCase()}-first designer building toward ${targetRole.toLowerCase()}.`,
    positioning: '',
    brutalTruth: null,
    strengths: a.strengths || [],
    gapActions: (a.weaknesses || []).map(w => ({ gap: w, truth: '', action: '' })),
    caseStudy: null,
    portfolio: null,
    learning: [],
    startHere: [],
    archetype: '',
    finalStatement: '',
    photo: a.photo || null,
  }
}

// ─── Tokens ─────────────────────────────────────────────────────────────────
const BLK = '#0D0D0D'
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const PAGE_BG = '#FEFDFB'
const PAGE_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`
const PAGE_DOTS = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.7' fill='rgba(0,0,0,0.12)'/%3E%3C/svg%3E")`
const PAGE_GRADIENT = 'linear-gradient(145deg, rgba(254,253,251,1) 0%, rgba(248,245,240,1) 40%, rgba(252,250,247,1) 100%)'
const COVER_BG = '#E8E4DE'

// ─── Helpers ────────────────────────────────────────────────────────────────
const inter = (size, weight = 400, color = '#666') => ({
  fontFamily: 'Inter, sans-serif', fontWeight: weight,
  fontSize: size, letterSpacing: '-0.02em', color, lineHeight: 1.0,
})

const serif = (size, color = BLK) => ({
  fontFamily: "'Instrument Serif', serif", fontWeight: 400,
  fontSize: size, lineHeight: 1.15, letterSpacing: '-0.02em', color, margin: '0 0 6px',
})

const Label = ({ children, style }) => (
  <span style={{
    ...inter(11, 600, '#A8A49C'),
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 6, ...style,
  }}>{children}</span>
)

// ─── Section divider ────────────────────────────────────────────────────────
const Divider = ({ label, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 14px', ...style }}>
    <div style={{ flex: 1, height: 1.5, background: 'rgba(200,196,188,0.5)' }} />
    {label && <span style={{ ...inter(11, 600, '#A8A49C'), textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: 1.5, background: 'rgba(200,196,188,0.5)' }} />
  </div>
)

// ─── Chrome binder rings ────────────────────────────────────────────────────
const Rings = ({ pageHeight }) => {
  const count = 5
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, left: '50%',
      transform: 'translateX(-50%)', width: 44,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-evenly', alignItems: 'center',
      zIndex: 12, pointerEvents: 'none',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="44" height="17" viewBox="0 0 56 22" fill="none">
          <defs>
            {/* Chrome body gradient — top to bottom */}
            <linearGradient id={`chrome-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8e8e8" />
              <stop offset="15%" stopColor="#f5f5f5" />
              <stop offset="30%" stopColor="#d0d0d0" />
              <stop offset="50%" stopColor="#b8b8b8" />
              <stop offset="65%" stopColor="#d5d5d5" />
              <stop offset="80%" stopColor="#c0c0c0" />
              <stop offset="100%" stopColor="#999" />
            </linearGradient>
            {/* Chrome edge/stroke gradient */}
            <linearGradient id={`edge-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#aaa" />
              <stop offset="50%" stopColor="#666" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="28" cy="19" rx="22" ry="2.5" fill="rgba(0,0,0,0.06)" />
          {/* Main ring body — elongated horizontal oval, top half */}
          <path
            d="M6 18 C6 4, 50 4, 50 18"
            stroke={`url(#chrome-${i})`} strokeWidth="6" strokeLinecap="round" fill="none"
          />
          {/* Outer edge — darker contour */}
          <path
            d="M6 18 C6 4, 50 4, 50 18"
            stroke={`url(#edge-${i})`} strokeWidth="7.5" strokeLinecap="round" fill="none"
            opacity="0.3"
          />
          {/* Top highlight — bright chrome reflection */}
          <path
            d="M14 10 C14 6, 42 6, 42 10"
            stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none"
          />
          {/* Secondary highlight */}
          <path
            d="M10 14 C10 8, 46 8, 46 14"
            stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" fill="none"
          />
          {/* Center seam — where ring opens */}
          <line x1="28" y1="4.5" x2="28" y2="7" stroke="#999" strokeWidth="0.8" />
          {/* Left eyelet — dark hole where ring enters page */}
          <circle cx="6" cy="18" r="4" fill="#333" />
          <circle cx="6" cy="18" r="2.5" fill="#1a1a1a" />
          <ellipse cx="5.5" cy="17" rx="1" ry="0.6" fill="rgba(255,255,255,0.15)" />
          {/* Right eyelet */}
          <circle cx="50" cy="18" r="4" fill="#333" />
          <circle cx="50" cy="18" r="2.5" fill="#1a1a1a" />
          <ellipse cx="49.5" cy="17" rx="1" ry="0.6" fill="rgba(255,255,255,0.15)" />
        </svg>
      ))}
    </div>
  )
}

// ─── Magnetic button ────────────────────────────────────────────────────────
const MagneticButton = ({ onClick, children, style: extraStyle }) => {
  const btnRef = useRef(null)
  const [hover, setHover] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setMousePos({ x: (e.clientX - cx) * 0.25, y: (e.clientY - cy) * 0.25 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHover(false)
    setMousePos({ x: 0, y: 0 })
  }, [])

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="no-print"
      style={{
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 10,
        ...inter(12, 500, 'rgba(255,255,255,0.8)'),
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(${hover ? 1.06 : 1})`,
        transition: `transform 0.3s ${EASE}, border-color 0.2s ${EASE}, background 0.2s ${EASE}`,
        ...(hover ? {
          borderColor: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.18)',
        } : {}),
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

// ─── Tooltip for info (positioned top-right of card) ────────────────────────
const InfoTooltip = ({ text }) => {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      // Don't close if clicking the info icon itself
      if (e.target.closest('[data-info-tooltip]')) return
      setOpen(false)
    }
    // Use timeout so the opening click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener('click', close), 0)
    return () => { clearTimeout(id); document.removeEventListener('click', close) }
  }, [open])

  if (!text) return null
  return (
    <span data-info-tooltip style={{ position: 'absolute', top: 10, right: 10 }}>
      <span
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 18, height: 18, borderRadius: '50%',
          background: open ? '#555' : hover ? '#D8D4CC' : '#E8E4DE',
          color: open ? '#fff' : '#A8A49C',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: `all 0.25s ${EASE}`,
          transform: hover && !open ? 'scale(1.15)' : 'scale(1)',
          flexShrink: 0,
        }}
      >i</span>
      <span style={{
        position: 'absolute', bottom: '100%', right: 0,
        marginBottom: 8,
        padding: '10px 14px', borderRadius: 10,
        background: '#fff', color: '#555',
        ...inter(11, 400, '#555'),
        whiteSpace: 'normal', width: 210,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
        zIndex: 20,
        lineHeight: 1.5,
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.95)',
        pointerEvents: open ? 'auto' : 'none',
        transition: `opacity 0.2s ${EASE}, transform 0.25s ${EASE}`,
      }}>
        {text}
      </span>
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function BlueprintPage({ answers, onRestart }) {
  const D = buildData(answers)
  const [show, setShow] = useState(false)
  const [pageH, setPageH] = useState(800)
  const bookRef = React.useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  useEffect(() => {
    if (!bookRef.current) return
    const ro = new ResizeObserver(([e]) => setPageH(e.contentRect.height))
    ro.observe(bookRef.current)
    return () => ro.disconnect()
  }, [])

  const reveal = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(16px)',
    filter: show ? 'blur(0)' : 'blur(6px)',
    transition: `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s, filter 0.6s ${EASE} ${delay}s`,
  })

  // Staggered reveal for inner book content
  const item = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
    filter: show ? 'blur(0)' : 'blur(4px)',
    transition: `opacity 0.5s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s, filter 0.5s ${EASE} ${delay}s`,
  })

  const handleDownload = useCallback(async () => {
    const book = bookRef.current
    if (!book) return
    // Hide camera icon
    const hide = book.querySelectorAll('.no-export')
    hide.forEach(n => n.style.display = 'none')
    try {
      // Run twice — first pass warms up image loading, second captures correctly
      await toPng(book, { pixelRatio: 2, backgroundColor: '#E8E4DE', cacheBust: true }).catch(() => {})
      const dataUrl = await toPng(book, { pixelRatio: 2, backgroundColor: '#E8E4DE', cacheBust: true })
      const link = document.createElement('a')
      link.download = `${D.name || 'Blueprint'}-TheReset.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      hide.forEach(n => n.style.display = '')
    }
  }, [D.name])

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center bottom',
      backgroundColor: '#1a1a1a',
    }}>
      {/* Progressive blur on top 20% — behind content, over bg */}
      <div className="no-export" style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '20%', zIndex: 0, pointerEvents: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
      }} />
      <div data-inner style={{
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
        padding: '20px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── Top bar ── */}
        <div style={{
          width: '100%', maxWidth: 1200,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12, flexShrink: 0,
          padding: '0 4px',
          ...reveal(0.05),
        }}>
          <span style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: 32, color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            The Reset
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDownload}
              className="no-print"
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50px',
                fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12,
                letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6,
                transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, display: 'block' }}>
                <path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ lineHeight: 1 }}>Download Blueprint</span>
            </button>
            {onRestart && (
              <button
                onClick={onRestart}
                className="no-print"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  ...inter(12, 500, 'rgba(255,255,255,0.8)'),
                  cursor: 'pointer',
                  transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              >
                Retake
              </button>
            )}
          </div>
        </div>

        {/* ══ THE BOOK ══ */}
        <div data-book-wrap style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1200,
          flex: 1,
          minHeight: 0,
          height: undefined,
          display: 'flex', flexDirection: 'column',
          ...reveal(0.15),
        }}>
          {/* Outer Shell — book binding edge */}
          <div data-book-shell style={{
            width: '100%',
            background: COVER_BG, borderRadius: 20, padding: 10,
            boxShadow: `
              0 12px 60px rgba(0,0,0,0.3),
              0 2px 8px rgba(0,0,0,0.15),
              0 0 0 1px rgba(255,255,255,0.08),
              0 0 40px rgba(180,210,240,0.15),
              0 0 80px rgba(180,210,240,0.08)
            `,
            flex: 1,
            minHeight: 0,
            height: undefined,
            display: 'flex', flexDirection: 'column',
            overflow: 'visible',
          }}>
            {/* Book Interior */}
            <div ref={bookRef} data-book style={{
              position: 'relative',
              flex: 1,
              minHeight: 0,
              height: undefined,
              borderRadius: 14,
              overflow: 'hidden',
              background: PAGE_GRADIENT,
              display: 'flex',
            }}>

              {/* ── LEFT PAGE ── */}
              <div className="book-page" style={{
                flex: 1,
                background: PAGE_GRADIENT,
                backgroundImage: `${PAGE_NOISE}, ${PAGE_GRADIENT}`,
                backgroundSize: '128px 128px, 100% 100%',
                padding: '34px 28px 28px 24px',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
                overflowX: 'hidden',
                height: undefined,
                borderRight: '1px solid rgba(232,228,222,0.35)',
                borderRadius: '14px 0 0 14px',
              }}>
                {/* Header — name + date + salary inline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, ...item(0.3) }}>
                  <div>
                    <h1 style={{ ...serif('clamp(28px, 3.5vw, 38px)'), marginBottom: 3 }}>
                      {D.name}'s Blueprint
                    </h1>
                    <span style={{ ...inter(11, 600, '#A8A49C'), textTransform: 'uppercase', letterSpacing: '0.06em' }}>{D.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <Label style={{ marginBottom: 1 }}>Current</Label>
                      <p style={{
                        ...serif(22, '#B0A8A0'),
                        textDecoration: 'line-through', textDecorationColor: '#D42020',
                      }}>{D.currentSalary}</p>
                    </div>
                    <span style={{ ...inter(12, 400, '#D0CCC6') }}></span>
                    <div style={{ textAlign: 'right' }}>
                      <Label style={{ marginBottom: 1 }}>Target</Label>
                      <p style={serif(22)}>{D.targetSalary}</p>
                    </div>
                  </div>
                </div>

                <Divider style={item(0.38)} />

                <div style={{ display: 'flex', gap: 16, marginBottom: 8, alignItems: 'flex-start', ...item(0.45) }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Label>Your superpower</Label>
                    <h2 style={{ ...serif('clamp(24px, 2.5vw, 32px)'), marginBottom: 8 }}>
                      {D.superpower.label}
                    </h2>
                    {D.superpower.summary && (
                      <p style={{ ...inter(12, 400, '#666'), margin: '0 0 10px' }}>{D.superpower.summary}</p>
                    )}
                    <Label style={{ marginTop: 30 }}>Strengths</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {D.strengths.map(s => (
                        <span key={s} style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,0.08)',
                          ...inter(11, 500, '#555'),
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    flexShrink: 0, position: 'relative',
                    transform: 'rotate(4deg)',
                  }}>
                    <div style={{
                      position: 'absolute', top: -8, left: '50%',
                      transform: 'translateX(-50%) rotate(4deg)',
                      width: 56, height: 20, zIndex: 2,
                      background: 'rgba(225,215,180,0.55)',
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(200,190,150,0.25)',
                    }} />
                    <div style={{
                      padding: 5, background: '#fff', borderRadius: 4,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}>
                      <div style={{ width: 160, height: 180, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                        <img src={D.photo || '/Main image.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <label htmlFor="blueprint-photo" className="no-export" style={{
                          position: 'absolute', bottom: 6, right: 6,
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </label>
                        <input
                          id="blueprint-photo"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Photo must be under 2 MB')
                              e.target.value = ''
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = () => {
                              // Update the image in place
                              const img = e.target.parentElement.querySelector('img')
                              if (img) img.src = reader.result
                            }
                            reader.readAsDataURL(file)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Divider label="gaps" style={{ margin: '4px 0 8px' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, ...item(0.6), marginBottom: 2 }}>
                  {D.gapActions.map(g => (
                    <div key={g.gap} style={{
                      flex: '1 1 calc(50% - 6px)', minWidth: 160,
                      padding: '16px 18px', borderRadius: 10,
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      position: 'relative',
                    }}>
                      <InfoTooltip text={g.truth || g.meaning} />
                      <span style={{ ...inter(13, 500, BLK), display: 'block', marginBottom: 6, paddingRight: 24, lineHeight: 1.1 }}>
                        {g.gap}
                      </span>
                      {g.action && (
                        <p style={{ ...inter(12, 400, '#666'), margin: 0, lineHeight: 1.1 }}>{g.action}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Divider style={{ marginTop: 4 }} label="learn" />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, ...item(0.75) }}>
                  {D.learning.map((learnItem, idx) => {
                    const isObj = typeof learnItem === 'object'
                    const title = isObj ? learnItem.focus : learnItem
                    const line = isObj ? (learnItem.summary || learnItem.practice || '') : ''
                    return (
                      <div key={idx} style={{
                        flex: '1 1 calc(50% - 4px)', minWidth: 150,
                        padding: '12px 14px', borderRadius: 10,
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            ...inter(10, 500, '#C8C4BC'),
                            letterSpacing: '0.04em',
                          }}>{String(idx + 1).padStart(2, '0')}</span>
                          <span style={{ ...inter(13, 500, BLK), lineHeight: 1.1 }}>{title}</span>
                        </div>
                        {line && (
                          <p style={{
                            ...inter(12, 400, '#666'),
                            margin: 0, marginTop: 4, paddingLeft: 26, lineHeight: 1.1,
                          }}>{line}</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {D.finalStatement && (
                  <div style={{
                    marginTop: 'auto', textAlign: 'left', ...item(0.9),
                    padding: '20px 12px 4px',
                    borderTop: '1px solid rgba(232,228,222,0.35)',
                  }}>
                    <p style={{ ...serif('clamp(22px, 2.2vw, 28px)', BLK), lineHeight: 1.2 }}>
                      {D.finalStatement}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Spine ── */}
              <div style={{
                width: 10, flexShrink: 0,
                background: COVER_BG,
                position: 'relative', zIndex: 15,
              }}>
                <Rings pageHeight={pageH} />
                {/* Vertical divider lines on both sides */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0,
                  width: 1.5, background: '#D8D4CE',
                }} />
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0,
                  width: 1.5, background: '#D8D4CE',
                }} />
              </div>

              {/* ── RIGHT PAGE ── */}
              <div className="book-page" style={{
                flex: 1,
                background: PAGE_GRADIENT,
                backgroundImage: `${PAGE_DOTS}, ${PAGE_NOISE}, ${PAGE_GRADIENT}`,
                backgroundSize: '20px 20px, 128px 128px, 100% 100%',
                padding: '24px 24px 28px 28px',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
                overflowX: 'hidden',
                height: undefined,
                boxShadow: 'inset 12px 0 20px -8px rgba(0,0,0,0.04), inset -6px 0 12px -4px rgba(0,0,0,0.02)',
                borderRadius: '0 14px 14px 0',
              }}>
                {/* Positioning + Blind spot — side by side */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, ...item(0.5) }}>
                  {/* Positioning card */}
                  <div style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #e8dff5 0%, #dce8f8 25%, #f0e6f0 50%, #dde9f4 75%, #eee6f5 100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"), linear-gradient(135deg, #e8dff5 0%, #dce8f8 25%, #f0e6f0 50%, #dde9f4 75%, #eee6f5 100%)`,
                    backgroundSize: '100px 100px, 100% 100%',
                    borderRadius: 14, padding: '16px 18px',
                    border: '1px solid rgba(180,170,210,0.2)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 14 }}>✦</span>
                      <span style={{ ...inter(10, 600, '#A8A49C'), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Your Positioning
                      </span>
                    </div>
                    <p style={{
                      ...serif('clamp(24px, 2.5vw, 32px)'),
                      lineHeight: 1.3, margin: 0,
                    }}>
                      {D.positioning || D.tagline}
                    </p>
                    <span style={{ ...inter(11, 400, '#999'), display: 'block', marginTop: 8 }}>{D.archetype || D.targetRole}</span>
                  </div>

                  {/* Blind spot card */}
                  {D.brutalTruth && (
                    <div style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, rgba(245,235,228,0.9) 0%, rgba(248,240,232,0.7) 40%, rgba(252,248,244,0.6) 100%)',
                      backgroundImage: `${PAGE_NOISE}, linear-gradient(135deg, rgba(245,235,228,0.9) 0%, rgba(248,240,232,0.7) 40%, rgba(252,248,244,0.6) 100%)`,
                      backgroundSize: '128px 128px, 100% 100%',
                      borderRadius: 14, padding: '16px 18px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}>
                      <Label style={{ marginBottom: 8 }}>Blind spot</Label>
                      <p style={{ ...inter(13, 500, '#888'), lineHeight: 1.4, margin: 0 }}>
                        {D.brutalTruth.strength || D.brutalTruth.title || ''}
                      </p>
                      <p style={{ ...serif('clamp(24px, 2.5vw, 32px)', BLK), lineHeight: 1.2, marginTop: 8 }}>
                        {D.brutalTruth.gap || D.brutalTruth.summary || ''}
                      </p>
                    </div>
                  )}
                </div>

                <Divider label="case studies" />

                {/* Case study direction */}
                {D.caseStudy && (
                  <div style={{ marginBottom: 20, ...item(0.65) }}>
                    <p style={{ ...inter(12, 400, '#666'), margin: 0, marginBottom: 10 }}>
                      {D.caseStudy.summary}
                    </p>
                    {(D.caseStudy.proofBlocks || []).length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {D.caseStudy.proofBlocks.map((b, i) => (
                          <div key={i} style={{
                            flex: '1 1 120px', padding: '10px 12px', borderRadius: 10,
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.06)',
                          }}>
                            <span style={{ ...inter(10, 600, '#C8C4BC'), textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                              {b.title}
                            </span>
                            <span style={{ ...inter(12, 400, '#666'), lineHeight: 1.2, display: 'block' }}>{b.detail}</span>
                          </div>
                        ))}
                        {!(D.caseStudy.proofBlocks || []).length && (D.caseStudy.recommendations || []).map((r, i) => (
                          <div key={i} style={{
                            flex: '1 1 120px', padding: '10px 12px', borderRadius: 10,
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.06)',
                          }}>
                            <span style={{ ...inter(10, 400, '#666') }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(D.caseStudy.mustInclude || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {D.caseStudy.mustInclude.map((m, i) => (
                          <span key={i} style={{
                            padding: '5px 12px', borderRadius: 6,
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.08)',
                            ...inter(12, 500, '#555'),
                          }}>{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Divider label="portfolio" />

                {D.portfolio && (
                  <div style={{ marginBottom: 20, ...item(0.8) }}>
                    <p style={{ ...inter(12, 400, '#666'), marginBottom: 12 }}>{D.portfolio.summary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {D.portfolio.priorities.map((p, i) => (
                        <span key={i} style={{
                          padding: '5px 12px', borderRadius: 6,
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,0.08)',
                          ...inter(12, 400, '#666'),
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                <Divider label="start here" />

                {D.startHere.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, ...item(0.95) }}>
                    {D.startHere.slice(0, 3).map((step, i) => {
                      const isObj = typeof step === 'object'
                      const title = isObj ? step.title : step
                      const detail = isObj ? step.detail : ''
                      return (
                        <div key={i} style={{
                          flex: 1,
                          padding: '12px 12px', borderRadius: 10,
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,0.06)',
                        }}>
                          <span style={{
                            ...inter(10, 500, '#C8C4BC'),
                            letterSpacing: '0.04em',
                            display: 'block', marginBottom: 6,
                          }}>{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ ...inter(13, 500, BLK), display: 'block', lineHeight: 1.1 }}>{title}</span>
                          {detail && (
                            <span style={{ ...inter(11, 400, '#666'), display: 'block', marginTop: 2, lineHeight: 1.1 }}>{detail}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
