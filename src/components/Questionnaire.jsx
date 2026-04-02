import React, { useState, useEffect, useRef } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BLK     = '#0D0D0D'
const CARD_BG = '#F2EFE9'
const RED     = '#D42020'
const GRY     = '#7A7670'

const LABEL_S = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: '0.14em',
  color: GRY,
}

// ─── Sections ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'current',   label: 'Current'   },
  { id: 'target',    label: 'Target'    },
  { id: 'skills',    label: 'Skills'    },
  { id: 'gaps',      label: 'Gaps'      },
  { id: 'direction', label: 'Direction' },
  { id: 'reality',   label: 'Reality'   },
]

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  // ── CURRENT ──────────────────────────────────────────────────────────────────
  {
    id: 'name', section: 'current',
    q: "What should we call you?",
    helper: "First name is enough.",
    type: 'text', placeholder: 'Your name...',
  },
  {
    id: 'currentSalary', section: 'current',
    q: "What are you earning right now?",
    helper: "Be honest. This stays private.",
    type: 'searchable', single: true,
    noSearch: true,
    options: [
      'Less than 3 LPA', '3–5 LPA', '5–8 LPA', '8–12 LPA',
      '12–18 LPA', '18–25 LPA', '25–40 LPA', '40–60 LPA',
      '60 LPA – 1 CR', '1–2 CR', '2+ CR',
      'Freelance (varies)', 'Not earning yet',
    ],
  },
  {
    id: 'targetSalary', section: 'current',
    q: "What salary do you actually want?",
    helper: "Not the safe number. The real one.",
    type: 'searchable', single: true,
    noSearch: true,
    options: [
      '5–8 LPA', '8–12 LPA', '12–18 LPA', '18–25 LPA',
      '25–40 LPA', '40–60 LPA', '60 LPA – 1 CR',
      '1–2 CR', '2–5 CR', '5+ CR',
    ],
  },
  {
    id: 'journeyState', section: 'current',
    q: "What's your current role?",
    helper: "Pick what fits best right now.",
    type: 'searchable', single: true, noSearch: true,
    options: [
      'Product Designer', 'UI Designer', 'UX Designer',
      'Freelancer', 'Student', 'Career Switch',
      'Intern', 'Not working',
    ],
  },
  // ── TARGET ───────────────────────────────────────────────────────────────────
  {
    id: 'targetRole', section: 'target',
    q: "Where do you want to go next as a designer?",
    helper: "You can choose more than one direction.",
    type: 'searchable', single: true, noSearch: true,
    options: [
      'Product Designer', 'Senior Product Designer', 'UX Designer',
      'Design Lead', 'Creative Director', 'Head of Design',
      'Design Manager', 'Principal Designer', 'Motion Designer',
      'Brand Designer', 'UX Researcher',
    ],
  },
  // ── SKILLS ───────────────────────────────────────────────────────────────────
  {
    id: 'strengths', section: 'skills',
    q: "What's your superpower?",
    helper: "That one thing no one can beat you at.",
    type: 'searchable', single: false,
    options: [
      'Aesthetics', 'Typography', 'Storytelling', 'Color & Composition',
      'Layout & Grids', 'Micro-interactions', 'Animation & Motion',
      'Illustration', 'Attention to Detail', 'Visual Hierarchy',
      'Simplifying Complexity', 'Rapid Prototyping',
    ],
  },
  // ── GAPS ─────────────────────────────────────────────────────────────────────
  {
    id: 'weaknesses', section: 'gaps',
    q: "Where do you usually get stuck?",
    helper: "Think about your last few projects.",
    type: 'searchable', single: false,
    options: [
      'Presenting work', 'Client communication', 'Storytelling', 'Product thinking',
      'Research depth', 'Metrics understanding', 'Business thinking', 'Decision making',
      'Stakeholder management', 'Confidence', 'Consistency',
      'Portfolio quality', 'Case study writing', 'Negotiation',
      'Systems thinking', 'Prioritization', 'Strategy',
    ],
  },
  // ── DIRECTION ────────────────────────────────────────────────────────────────
  {
    id: 'interests', section: 'direction',
    q: "What kind of work naturally pulls your interest?",
    helper: "Even if it's not your main role yet.",
    type: 'searchable', single: false,
    options: [
      'Motion Design', 'Branding', 'Creative Direction', 'Writing',
      'Content Creation', 'Design Systems', 'AI Tools', 'No-code / Development',
      'Teaching', 'Community Building', 'Experimentation', '3D Design',
      'Video Editing', 'Storytelling', 'Creative Coding', 'Strategy',
    ],
  },
  {
    id: 'workSignal', section: 'direction',
    q: "What kind of work have you done or want to do more of?",
    helper: "Real projects, concepts, anything counts.",
    type: 'searchable', single: false,
    options: [
      'Mobile App', 'Web App', 'SaaS Dashboard', 'Landing Page',
      'Branding Project', 'Design System', 'Personal Project',
      'Freelance Work', 'Client Work', 'Redesign Project',
    ],
  },
  // ── PHOTO ────────────────────────────────────────────────────────────────────
  {
    id: 'photo', section: 'direction',
    q: "Add a photo for your blueprint",
    helper: "This will appear on your blueprint. Max 2 MB.",
    type: 'photo',
  },
  // ── REALITY ──────────────────────────────────────────────────────────────────
  {
    id: 'realityCheck', section: 'reality',
    q: "Does this feel like you?",
    helper: "Honest answer helps us build a better blueprint.",
    type: 'reality-check',
  },
]

// ─── AI Summary (local derivation) ───────────────────────────────────────────
function generateAISummary(answers) {
  const skills    = answers.strengths  || []
  const gaps      = answers.weaknesses || []
  const direction = Array.isArray(answers.targetRole)
    ? answers.targetRole
    : [answers.targetRole].filter(Boolean)

  const topSkills = skills.slice(0, 3).join(', ').toLowerCase()
  const topGaps   = gaps.slice(0, 2).join(', ').toLowerCase()
  const target    = direction.slice(0, 2).join(' or ')

  return {
    strength: topSkills
      ? `You seem strongest in ${topSkills}. These are your execution anchors.`
      : "Your craft foundation is clear. The challenge is making it legible in your portfolio work.",
    gap: topGaps
      ? `The real friction is around ${topGaps}, not output quality.`
      : "The gap isn't about making things. It's about framing decisions and showing the thinking behind the work.",
    direction: target
      ? `To move toward ${target.toLowerCase()}, your portfolio needs more problem-led thinking, not just polished screens.`
      : "Your portfolio needs to shift from showing execution to showing how you think through problems.",
  }
}

// ─── Pill pop animation (injected once) ───────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('q-styles')) {
  const style = document.createElement('style')
  style.id = 'q-styles'
  style.textContent = `
    .q-pill {
      transition: border-color 150ms cubic-bezier(0.23,1,0.32,1),
                  background 150ms cubic-bezier(0.23,1,0.32,1),
                  transform 160ms cubic-bezier(0.23,1,0.32,1) !important;
    }
    .q-pill:hover {
      border-color: rgba(13,13,13,0.3) !important;
      background: rgba(13,13,13,0.03) !important;
    }
    .q-pill:active {
      transform: scale(0.96) !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .q-pill { transition: none !important; }
    }
  `
  document.head.appendChild(style)
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
const PILL_LIMIT = 6

function SearchableSelect({ options, selected, onToggle, onAddCustom, single, max, noSearch }) {
  const [query, setQuery]       = useState('')
  const [expanded, setExpanded] = useState(false)
  const [addingCustom, setAddingCustom] = useState(false)
  const [customVal, setCustomVal] = useState('')
  const customRef = useRef(null)

  const available = options.filter(
    o => !selected.includes(o) && o.toLowerCase().includes(query.toLowerCase())
  )
  const trimmed       = query.trim()
  const hasExactMatch = options.some(o => o.toLowerCase() === trimmed.toLowerCase())
  const canAdd        = trimmed.length > 0 && !hasExactMatch && !selected.includes(trimmed)
  const atMax         = !!(max && selected.length >= max)

  const isSearching = query.length > 0
  const firstBatch  = available.slice(0, PILL_LIMIT)
  const restBatch   = available.slice(PILL_LIMIT)
  const hasMore     = !isSearching && restBatch.length > 0

  const handleKey = e => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (atMax) return
    if (available.length > 0) { onToggle(available[0]); setQuery('') }
    else if (canAdd)           { onAddCustom(trimmed);  setQuery('') }
  }

  return (
    <div>
      {/* Selected */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
          {selected.map(s => (
            <button
              key={s}
              onClick={() => onToggle(s)}
              style={{
                padding: '9px 14px', borderRadius: 6,
                border: 'none', background: BLK, color: CARD_BG,
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 11, letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              {s}
              <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 14, lineHeight: 1 }}>×</span>
            </button>
          ))}
          {/* Inline + button among selected pills */}
          {!single && !atMax && (
            addingCustom ? (
              <input
                ref={customRef}
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customVal.trim()) {
                    onAddCustom(customVal.trim())
                    setCustomVal('')
                    setAddingCustom(false)
                  }
                  if (e.key === 'Escape') { setCustomVal(''); setAddingCustom(false) }
                }}
                onBlur={() => { if (!customVal.trim()) setAddingCustom(false) }}
                placeholder="Type to add..."
                autoFocus
                style={{
                  padding: '9px 14px', borderRadius: 6,
                  border: '1.5px dashed rgba(13,13,13,0.15)', background: 'transparent',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 11, color: BLK, width: 130, letterSpacing: '0.04em',
                  outline: 'none',
                }}
              />
            ) : (
              <button
                onClick={() => { setAddingCustom(true); setTimeout(() => customRef.current?.focus(), 50) }}
                className="q-pill"
                style={{
                  padding: '9px 14px', borderRadius: 6,
                  border: '1.5px dashed rgba(13,13,13,0.15)', background: 'transparent',
                  color: '#999', cursor: 'pointer', outline: 'none',
                  fontFamily: 'Inter, sans-serif', fontWeight: 400,
                  fontSize: 14, lineHeight: 1,
                }}
              >
                +
              </button>
            )
          )}
        </div>
      )}

      {/* Search field */}
      {!noSearch && (!single || selected.length === 0) && (
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder={atMax ? `Max ${max} selected` : 'Search or type to add...'}
            disabled={atMax}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', borderBottom: `1.5px solid ${atMax ? '#D5D0C8' : BLK}`,
              fontFamily: 'Inter, sans-serif', fontWeight: 400,
              fontSize: 14, color: BLK,
              padding: '6px 0 8px', outline: 'none', caretColor: RED,
              opacity: atMax ? 0.4 : 1,
            }}
          />
          {canAdd && !atMax && (
            <span style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              ...LABEL_S, fontSize: 8,
            }}>
              ↵ enter to add
            </span>
          )}
        </div>
      )}

      {/* Options */}
      {!atMax && (
        <div>
          {/* First batch — always visible */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {(isSearching ? available : firstBatch).map(opt => (
              <button
                key={opt}
                onClick={() => { onToggle(opt); setQuery('') }}
                className="q-pill"
                style={{
                  padding: '9px 16px', borderRadius: 6,
                  border: '1.5px solid rgba(13,13,13,0.12)', background: 'transparent', color: BLK,
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 11, letterSpacing: '0.04em',
                  cursor: 'pointer', outline: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {opt}
              </button>
            ))}
            {canAdd && (
              <button
                onClick={() => { onAddCustom(trimmed); setQuery('') }}
                className="q-pill"
                style={{
                  padding: '9px 16px', borderRadius: 6,
                  border: '1.5px solid rgba(13,13,13,0.12)', background: 'rgba(13,13,13,0.04)', color: BLK,
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 11, letterSpacing: '-0.02em',
                  cursor: 'pointer', outline: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.4 }}>+</span>
                {trimmed}
              </button>
            )}
            {/* Add custom for noSearch */}
            {noSearch && !single && !atMax && (
              addingCustom ? (
                <input
                  ref={customRef}
                  value={customVal}
                  onChange={e => setCustomVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customVal.trim()) {
                      onAddCustom(customVal.trim())
                      setCustomVal('')
                      setAddingCustom(false)
                    }
                    if (e.key === 'Escape') { setCustomVal(''); setAddingCustom(false) }
                  }}
                  onBlur={() => { if (!customVal.trim()) setAddingCustom(false) }}
                  placeholder="Type to add..."
                  autoFocus
                  style={{
                    padding: '9px 16px', borderRadius: 6,
                    border: '1.5px dashed rgba(13,13,13,0.15)', background: 'transparent',
                    fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    fontSize: 11, color: BLK, width: 140, letterSpacing: '0.04em',
                    outline: 'none',
                  }}
                />
              ) : (
                <button
                  onClick={() => { setAddingCustom(true); setTimeout(() => customRef.current?.focus(), 50) }}
                  className="q-pill"
                  style={{
                    padding: '9px 14px', borderRadius: 6,
                    border: '1.5px dashed rgba(13,13,13,0.15)', background: 'transparent',
                    color: '#999', cursor: 'pointer', outline: 'none',
                    fontFamily: 'Inter, sans-serif', fontWeight: 400,
                    fontSize: 14, lineHeight: 1,
                  }}
                >
                  +
                </button>
              )
            )}
          </div>

          {/* Overflow batch — animated in/out */}
          {!isSearching && restBatch.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateRows: expanded ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.3s cubic-bezier(0.23,1,0.32,1)',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingTop: 7 }}>
                  {restBatch.map(opt => (
                    <button
                      key={opt}
                      onClick={e => {
                        e.currentTarget.classList.remove('pill-pop')
                        void e.currentTarget.offsetWidth
                        e.currentTarget.classList.add('pill-pop')
                        onToggle(opt); setQuery('')
                      }}
                      className="q-pill"
                      style={{
                        padding: '9px 16px', borderRadius: 6,
                        border: '1.5px solid rgba(13,13,13,0.12)', background: 'transparent', color: BLK,
                        fontFamily: 'Inter, sans-serif', fontWeight: 500,
                        fontSize: 11, letterSpacing: '0.04em',
                        cursor: 'pointer', outline: 'none',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasMore && (
            <span
              onClick={() => setExpanded(e => !e)}
              style={{
                display: 'inline-block',
                marginTop: 10,
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 11, color: '#999',
                cursor: 'pointer',
                borderBottom: '1px dashed #CCC',
                paddingBottom: 1,
              }}
            >
              {expanded ? 'Show less' : `+${restBatch.length} more`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Reality Check Input ──────────────────────────────────────────────────────
function RealityCheckInput({ answers, value, onChange }) {
  const summary  = generateAISummary(answers)
  const selected = value?.choice

  const choose = choice => {
    onChange({ choice })
  }

  const CHOICES = [
    { id: 'yes', label: 'Yes, this feels right' },
    { id: 'no',  label: 'No' },
  ]

  const SIGNALS = [
    { label: 'Strength',  text: summary.strength  },
    { label: 'Gap',       text: summary.gap        },
    { label: 'Direction', text: summary.direction  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* AI signals */}
      <div style={{
        background: '#F8F7F5', borderRadius: 10,
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {SIGNALS.map(({ label, text }) => (
          <div key={label}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12,
              color: '#999', letterSpacing: '-0.02em',
              display: 'block', marginBottom: 4,
            }}>
              {label}
            </span>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 400,
              fontSize: 14, color: BLK, lineHeight: 1.5, margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Choice buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {CHOICES.map(opt => (
          <button
            key={opt.id}
            onClick={() => choose(opt.id)}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: `1.5px solid ${selected === opt.id ? BLK : 'rgba(13,13,13,0.12)'}`,
              background: selected === opt.id ? BLK : '#fff',
              color: selected === opt.id ? '#fff' : BLK,
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 13, letterSpacing: '-0.02em',
              cursor: 'pointer', outline: 'none',
              transition: 'border-color 0.15s cubic-bezier(0.23,1,0.32,1), background 0.15s cubic-bezier(0.23,1,0.32,1), color 0.15s cubic-bezier(0.23,1,0.32,1)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

    </div>
  )
}

// ─── Loading Screen ──────────────────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0)
  const [ready, setReady] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  useEffect(() => {
    const DURATION = 30000
    const start = Date.now()
    // Pre-generate random pause points
    const pauses = Array.from({ length: 4 }, () => 15 + Math.random() * 70)
    let pauseUntil = 0

    const tick = () => {
      const elapsed = Date.now() - start
      const raw = (elapsed / DURATION) * 100

      if (raw >= 100) {
        setPct(100)
        setReady(true)
        setTimeout(onDone, 1200)
        return
      }

      // Random pauses and speed bursts
      const now = Date.now()
      if (now < pauseUntil) {
        requestAnimationFrame(tick)
        return
      }

      // Chance to pause at certain thresholds
      for (const p of pauses) {
        if (Math.abs(raw - p) < 0.5 && Math.random() < 0.03) {
          pauseUntil = now + 800 + Math.random() * 2000
          break
        }
      }

      // Add jitter — sometimes jump ahead
      const jitter = Math.random() < 0.05 ? Math.random() * 3 : 0
      setPct(Math.min(99, raw + jitter))
      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [onDone])

  const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* BG */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/form%20image.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#fff',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '30%', zIndex: 1,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 1,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
      }}>
        {/* Percentage */}
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: ready ? 'clamp(80px, 15vw, 140px)' : 'clamp(100px, 20vw, 200px)',
          lineHeight: 1, color: '#fff',
          letterSpacing: '-0.03em',
          transition: `font-size 0.8s ${EASE}`,
          marginBottom: 24,
        }}>
          {ready ? (
            <span style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              display: 'block', textAlign: 'center', lineHeight: 1.15,
            }}>
              Your blueprint<br />is ready.
            </span>
          ) : (
            `${Math.round(pct)}%`
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', maxWidth: 320,
          height: 3, borderRadius: 100,
          background: 'rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: '#fff',
            width: `${pct}%`,
            transition: `width 0.3s ${EASE}`,
          }} />
        </div>

        {/* Status text */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 400,
          fontSize: 14, color: 'rgba(255,255,255,0.5)',
          letterSpacing: '-0.02em',
          marginTop: 16,
          transition: `opacity 0.4s ${EASE}`,
          opacity: ready ? 0 : 1,
        }}>
          {pct < 20 ? 'Reading your answers...'
            : pct < 45 ? 'Analyzing your strengths...'
            : pct < 65 ? 'Mapping your gaps...'
            : pct < 85 ? 'Building your direction...'
            : 'Finalizing your blueprint...'}
        </p>
      </div>
    </div>
  )
}

// ─── Completion Screen ────────────────────────────────────────────────────────
function CompletionScreen({ onView, answers }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/Main%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: '#B93938',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Tabs placeholder — show all as done */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 10, paddingLeft: 2,
        }}>
          {SECTIONS.map(sec => (
            <div
              key={sec.id}
              style={{
                flex: 1, padding: '10px 10px',
                borderRadius: 6, background: CARD_BG,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.45,
              }}
            >
              <span style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 11, color: BLK,
                letterSpacing: '0.06em',
              }}>
                {sec.label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: CARD_BG, borderRadius: 6,
          boxShadow: 'none',
          padding: '28px 36px 28px',
        }}>
          <span style={{ ...LABEL_S, display: 'block', marginBottom: 18 }}>Complete</span>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: 'clamp(28px, 5vw, 42px)',
            lineHeight: 1.05, letterSpacing: '-0.02em',
            color: BLK, marginBottom: 20,
          }}>
            Your Blueprint Is Ready.
          </h2>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13, color: '#8A8580', lineHeight: 1.55,
            marginBottom: 24,
          }}>
            We've mapped your career path based on your answers.
          </p>

          <div style={{
            paddingTop: 14,
            borderTop: '1px solid rgba(13,13,13,0.08)',
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => onView(answers)}
              style={{
                padding: '12px 28px', background: BLK, color: CARD_BG,
                border: 'none', borderRadius: 6,
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
              }}
            >
              View Blueprint →
            </button>
          </div>
        </div>

        {/* Progress bar — all filled */}
        <div style={{ display: 'flex', gap: 3, marginTop: 16, paddingLeft: 2 }}>
          {Array(10).fill(0).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2, borderRadius: 1,
              background: '#FFFFFF',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Questionnaire({ onComplete, user }) {
  const [currentQ, setCurrentQ] = useState(user ? 0 : -1) // -1 = sign-in step
  const [answers, setAnswers]   = useState(() => {
    if (user?.displayName) {
      return { name: user.displayName.split(' ')[0] }
    }
    return {}
  })
  const [fading, setFading]     = useState(false)
  const [done, setDone]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [loadPct, setLoadPct]   = useState(0)
  const [loadReady, setLoadReady] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const inputRef = useRef(null)
  const cardRef  = useRef(null)
  const [entered, setEntered] = useState(false)

  // When user signs in (from -1 step), auto-fill name and advance
  const hasAutoAdvanced = useRef(false)
  useEffect(() => {
    if (user && currentQ === -1 && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true
      const firstName = user.displayName?.split(' ')[0] || ''
      if (firstName) setAnswers(prev => ({ ...prev, name: firstName }))
      // Fade out sign-in, then swap to first question
      setFading(true)
      setTimeout(() => {
        setCurrentQ(0)
        setFading(false)
      }, 300)
    }
  }, [user, currentQ])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [])


  // Loading: visual timer + real API call running in parallel
  const apiResultRef = useRef(null)

  useEffect(() => {
    if (!loading) return
    let cancelled = false

    // Start the real API call
    const sendRequest = async () => {
      const token = await auth.currentUser?.getIdToken?.().catch(() => null)
      return fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(answers),
      })
    }
    sendRequest()
      .then(r => r.json())
      .then(data => {
        if (!cancelled) apiResultRef.current = data
      })
      .catch(err => {
        console.error('Blueprint API failed:', err)
        if (!cancelled) apiResultRef.current = { error: err.message }
      })

    // Visual progress timer
    const DURATION = 25000 // 25s base, will jump to 100 when API returns
    const start = Date.now()
    const pauses = [20, 40, 60, 80].map(p => p + Math.random() * 8)
    let pauseUntil = 0
    let lastPct = 0

    const interval = setInterval(() => {
      // If API returned, animate to 100 then transition
      if (apiResultRef.current && lastPct >= 60) {
        clearInterval(interval)
        setLoadPct(100)
        setTimeout(() => setLoadReady(true), 600)
        return
      }

      const elapsed = Date.now() - start
      const raw = (elapsed / DURATION) * 100
      const now = Date.now()

      // Cap at 95% until API returns
      const cap = apiResultRef.current ? 100 : 95

      if (raw >= cap) {
        if (cap === 100) {
          clearInterval(interval)
          setLoadPct(100)
          setTimeout(() => setLoadReady(true), 600)
        } else {
          setLoadPct(95)
        }
        return
      }

      if (now < pauseUntil) return

      for (const p of pauses) {
        if (raw > p && raw < p + 2 && lastPct <= p) {
          pauseUntil = now + 800 + Math.random() * 1500
          return
        }
      }

      const rounded = Math.round(raw)
      if (rounded !== lastPct) {
        lastPct = rounded
        setLoadPct(Math.min(cap - 1, rounded))
      }
    }, 100)

    return () => { cancelled = true; clearInterval(interval) }
  }, [loading, answers])


  const isSignIn = currentQ === -1
  const q          = isSignIn ? null : QUESTIONS[currentQ]
  const sectionId  = q?.section

  const answer = q ? answers[q.id] : undefined

  const canProceed = () => {
    if (isSignIn) return false
    if (q.type === 'text')
      return typeof answer === 'string' && answer.trim().length > 0
    if (q.type === 'searchable') {
      if (q.single) return typeof answer === 'string' && answer.trim().length > 0
      return Array.isArray(answer) && answer.length > 0
    }
    if (q.type === 'photo')
      return true // photo is optional
    if (q.type === 'reality-check')
      return !!(answer && answer.choice)
    return false
  }

  useEffect(() => {
    if (q?.type === 'text' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 260)
    }
  }, [currentQ, q?.type])


  const animateCard = (changeFn) => {
    const el = cardRef.current
    if (!el) { changeFn(); return }
    // Snapshot current height
    const fromH = el.offsetHeight
    el.style.height = fromH + 'px'
    el.style.transition = 'none'
    // Fade out
    setFading(true)
    setTimeout(() => {
      // Swap content
      changeFn()
      setFading(false)
      // Measure new height next frame
      requestAnimationFrame(() => {
        el.style.height = 'auto'
        const toH = el.offsetHeight
        // Snap back to old, then animate to new
        el.style.height = fromH + 'px'
        el.style.transition = 'height 0.3s cubic-bezier(0.23,1,0.32,1)'
        requestAnimationFrame(() => {
          el.style.height = toH + 'px'
        })
        // Clean up after animation
        const onEnd = () => {
          el.style.height = 'auto'
          el.style.transition = ''
          el.removeEventListener('transitionend', onEnd)
        }
        el.addEventListener('transitionend', onEnd)
      })
    }, 200)
  }

  const advance = () => {
    if (!canProceed()) return
    animateCard(() => {
      if (currentQ === QUESTIONS.length - 1) { setLoadPct(0); setLoadReady(false); setLoading(true) }
      else setCurrentQ(p => p + 1)
    })
  }

  const goBack = () => {
    if (currentQ <= 0) return
    animateCard(() => setCurrentQ(p => p - 1))
  }

  // Global Enter key to advance — but not during animation or for single-select (which auto-advances)
  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'Enter' || e.repeat || loading || fading || isSignIn) return
      if (q?.type === 'searchable' && q?.single) return // single-select auto-advances on pill click
      const el = e.target
      if (el.tagName === 'TEXTAREA') return
      if (el.tagName === 'INPUT' && el.placeholder?.includes('Search')) return
      if (el.tagName === 'INPUT' && el.placeholder?.includes('Type to add')) return
      advance()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const setAnswer = val => q && setAnswers(p => ({ ...p, [q.id]: val }))

  const advancingRef = useRef(false)

  const forceAdvance = () => {
    if (advancingRef.current || fading) return
    advancingRef.current = true
    animateCard(() => {
      if (currentQ === QUESTIONS.length - 1) { setLoadPct(0); setLoadReady(false); setLoading(true) }
      else setCurrentQ(p => p + 1)
      advancingRef.current = false
    })
  }

  const toggleOption = option => {
    if (q.single) {
      if (answer === option) {
        setAnswer('')
      } else {
        setAnswer(option)
        setTimeout(() => forceAdvance(), 350)
      }
      return
    }
    const cur = answers[q.id] || []
    if (cur.includes(option)) {
      setAnswer(cur.filter(o => o !== option))
    } else {
      if (q.max && cur.length >= q.max) return
      setAnswer([...cur, option])
    }
  }

  const addCustom = custom => {
    if (q.single) { setAnswer(custom); return }
    const cur = answers[q.id] || []
    if (!cur.includes(custom)) {
      if (q.max && cur.length >= q.max) return
      setAnswer([...cur, custom])
    }
  }


  if (done) return null

  const selected = q?.type === 'searchable'
    ? (q.single ? (answer ? [answer] : []) : (answer || []))
    : []

  return (
    <div style={{
      height: '100vh', position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Full-screen BG ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/form%20image.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: '#fff',
      }} />

      {/* ── Top progressive blur ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '30%', zIndex: 1,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Bottom gradient overlay — starts low ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Bottom progressive blur ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 1,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar: "The Reset" ── */}
      <div style={{
        position: 'relative', zIndex: 3, flexShrink: 0,
        padding: '16px 36px',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s, transform 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s',
      }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: 32, color: '#fff',
          letterSpacing: '-0.01em',
        }}>
          The Reset
        </span>
      </div>

      {/* ── Main content area ── */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'flex-end',
        padding: '0 32px 32px',
        gap: 40,
      }}>

        {/* ── Left: Quote ── */}
        <div style={{
          flex: 1, paddingBottom: 12,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s cubic-bezier(0.23,1,0.32,1) 0.25s, transform 0.5s cubic-bezier(0.23,1,0.32,1) 0.25s',
        }}>
          <p style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: 'clamp(32px, 3.5vw, 48px)',
            lineHeight: 1.15, letterSpacing: '-0.01em',
            color: '#fff',
          }}>
            A quick reset can change<br />the direction of your design career.
          </p>
        </div>

        {/* ── Right: Form card ── */}
        <div style={{
          width: 420, flexShrink: 0,
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 8,
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s cubic-bezier(0.23,1,0.32,1) 0.15s, transform 0.5s cubic-bezier(0.23,1,0.32,1) 0.15s',
        }}>

          {/* Card */}
          <div
            ref={cardRef}
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.06)',
              overflow: 'visible',
              display: 'flex', flexDirection: 'column',
              minHeight: (loading || isSignIn) ? 500 : undefined,
            }}>

            {/* Progress bar + step count — hidden during loading and sign-in */}
            {!loading && !isSignIn && (
              <div style={{ padding: '24px 28px 0' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    fontSize: 15, color: '#777', letterSpacing: '-0.03em',
                  }}>
                    {{ current: 'About you', target: 'Your ambition', skills: 'Your strengths', gaps: 'Honest gaps', direction: 'What excites you', reality: 'Reality check' }[sectionId]}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    fontSize: 11, color: '#999',
                  }}>
                    {currentQ + 1} of {QUESTIONS.length}
                  </span>
                </div>
                <div style={{
                  width: '100%', height: 3, borderRadius: 100,
                  background: 'rgba(13,13,13,0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 100,
                    background: BLK,
                    width: `${((currentQ + 1) / QUESTIONS.length) * 100}%`,
                    transition: 'width 0.5s cubic-bezier(0.23,1,0.32,1)',
                  }} />
                </div>
              </div>
            )}

            <div style={{ padding: (loading || isSignIn) ? '28px 28px 28px' : '36px 28px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

            {isSignIn ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', gap: 16, padding: '20px 8px',
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.2s cubic-bezier(0.23,1,0.32,1)',
              }}>
                <style>{`
                  @keyframes signInFadeUp {
                    from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                  }
                `}</style>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                  fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.02em',
                  color: BLK,
                  animation: 'signInFadeUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.05s both',
                }}>
                  Before we begin
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 400,
                  fontSize: 14, lineHeight: 1.5, color: GRY,
                  maxWidth: 280,
                  animation: 'signInFadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.2s both',
                }}>
                  Sign in so we can save your blueprint and you can revisit it anytime.
                </p>
                <button
                  onClick={async () => {
                    setSigningIn(true)
                    try { await signInWithPopup(auth, googleProvider) }
                    catch (err) { console.error('Sign in error:', err.message) }
                    setSigningIn(false)
                  }}
                  disabled={signingIn}
                  style={{
                    width: '100%', maxWidth: 300,
                    padding: '14px 24px', marginTop: 8,
                    background: '#fff', color: BLK,
                    border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10,
                    fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    fontSize: 14, letterSpacing: '-0.02em',
                    cursor: signingIn ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    animation: 'signInFadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.35s both',
                    opacity: signingIn ? 0.7 : undefined,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {signingIn ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>
            ) : loading ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', gap: 20,
              }}>
                {!loadReady ? (
                  <>
                    <span style={{
                      fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                      fontSize: 'clamp(72px, 12vw, 100px)',
                      lineHeight: 1, color: BLK, letterSpacing: '-0.03em',
                    }}>
                      {Math.round(loadPct)}%
                    </span>
                    <div style={{ width: '100%', maxWidth: 200 }}>
                      <div style={{
                        width: '100%', height: 2, borderRadius: 100,
                        background: 'rgba(13,13,13,0.1)',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 100,
                          background: BLK,
                          width: `${Math.max(0.5, loadPct)}%`,
                        }} />
                      </div>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 400,
                        fontSize: 12, color: '#999', letterSpacing: '-0.02em',
                        textAlign: 'center', marginTop: 10,
                      }}>
                        {loadPct < 20 ? 'Reading your answers'
                          : loadPct < 45 ? 'Analyzing your strengths'
                          : loadPct < 65 ? 'Mapping your gaps'
                          : loadPct < 85 ? 'Building your direction'
                          : 'Finalizing'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <img src="/Stamp.png" alt="" style={{
                      width: 88, height: 88, objectFit: 'contain', marginBottom: 8,
                    }} />
                    <span style={{
                      fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                      fontSize: 32, lineHeight: 1.2, color: BLK, letterSpacing: '-0.02em',
                    }}>
                      Your blueprint is ready.
                    </span>
                    <button
                      onClick={() => {
                        const result = apiResultRef.current
                        if (result?.blueprint) {
                          onComplete({ ...answers, _blueprint: result.blueprint, _profile: result.profile })
                        } else {
                          // Fallback to raw answers if API failed
                          onComplete(answers)
                        }
                      }}
                      style={{
                        marginTop: 8, padding: '14px 32px',
                        background: BLK, color: '#fff',
                        border: 'none', borderRadius: 10,
                        fontFamily: 'Inter, sans-serif', fontWeight: 500,
                        fontSize: 15, cursor: 'pointer', letterSpacing: '-0.02em',
                        transition: 'background 0.2s cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#2A2520'}
                      onMouseLeave={e => e.currentTarget.style.background = BLK}
                    >
                      View now
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
            {/* Animated content */}
            <div style={{
              opacity: fading ? 0 : 1,
              filter: fading ? 'blur(3px)' : 'blur(0)',
              transform: fading ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 0.18s cubic-bezier(0.23,1,0.32,1), filter 0.18s cubic-bezier(0.23,1,0.32,1), transform 0.18s cubic-bezier(0.23,1,0.32,1)',
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                fontSize: 32,
                lineHeight: 1.15, letterSpacing: '-0.01em', color: BLK,
                marginBottom: 20,
              }}>
                {q.q}
              </h2>

              {/* Text */}
              {q.type === 'text' && (
                <input
                  ref={inputRef}
                  key={q.id}
                  type="text"
                  value={answer || ''}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') advance() }}
                  placeholder={q.placeholder}
                  style={{
                    width: '100%', background: '#fff',
                    border: '1.5px solid #E0DDD8', borderRadius: 10,
                    fontFamily: 'Inter, sans-serif', fontWeight: 400,
                    fontSize: 15, color: BLK, letterSpacing: '-0.02em',
                    padding: '12px 14px', outline: 'none', caretColor: BLK,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#555'}
                  onBlur={e => e.target.style.borderColor = '#E0DDD8'}
                />
              )}

              {/* Searchable */}
              {q.type === 'searchable' && (
                <>
                  <SearchableSelect
                    key={q.id}
                    options={q.options}
                    selected={selected}
                    onToggle={toggleOption}
                    onAddCustom={addCustom}
                    single={q.single}
                    max={q.max}
                    noSearch={q.noSearch}
                  />
                  {q.example && (
                    <div style={{
                      marginTop: 14, padding: '8px 12px',
                      background: '#FBF9F6', border: '1px solid #EDE9E4',
                      borderRadius: 8,
                    }}>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 400,
                        fontSize: 12, color: '#8A8580', lineHeight: 1.5, margin: 0,
                      }}>
                        {q.example}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Photo upload */}
              {q.type === 'photo' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <label
                    htmlFor="photo-upload"
                    style={{
                      width: 180, height: 200, borderRadius: 10,
                      border: answer ? 'none' : '2px dashed #D0CCC6',
                      background: answer ? 'transparent' : '#FAFAF8',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden',
                      transition: 'border-color 0.2s',
                      position: 'relative',
                    }}
                  >
                    {answer ? (
                      <>
                        <img src={answer} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute', bottom: 8, right: 8,
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B5B0AB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#B5B0AB', marginTop: 8 }}>
                          Upload photo
                        </span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#D0CCC6', marginTop: 2 }}>
                          Max 2 MB
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    id="photo-upload"
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
                      reader.onload = () => setAnswer(reader.result)
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
              )}

              {/* Reality check */}
              {q.type === 'reality-check' && (
                <RealityCheckInput
                  key={q.id}
                  answers={answers}
                  value={answer}
                  onChange={setAnswer}
                />
              )}

            </div>

            {/* Helper — pushed to bottom */}
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 400,
              fontSize: 15, color: '#6B6560', lineHeight: 1.5,
              letterSpacing: '-0.04em',
              marginTop: 'auto', paddingTop: 14, marginBottom: 0,
              opacity: fading ? 0 : 1,
            }}>
              {q.helper}
            </p>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              marginTop: 16, paddingTop: 16,
              borderTop: '1px solid #F0EEEB',
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {currentQ > 0 && (
                  <button
                    onClick={goBack}
                    style={{
                      padding: '10px 18px',
                      background: '#fff', color: '#555',
                      border: '1.5px solid #E0DDD8',
                      border: 'none', borderRadius: 10,
                      fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      fontSize: 13, cursor: 'pointer', flexShrink: 0,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F3F0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Back
                  </button>
                )}
                {q.type === 'reality-check' && answer?.choice === 'no' ? (
                  <button
                    onClick={() => { setCurrentQ(0); setAnswers({}); setFading(false) }}
                    style={{
                      padding: '10px 22px',
                      background: BLK, color: '#fff',
                      border: 'none', borderRadius: 10,
                      fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.2s ease', flexShrink: 0,
                    }}
                  >
                    Restart quiz
                  </button>
                ) : (
                  <button
                    onClick={advance}
                    disabled={!canProceed()}
                    style={{
                      padding: '10px 22px',
                      background: canProceed() ? BLK : '#E0DDD8',
                      color: canProceed() ? '#fff' : '#B5B0AB',
                      border: 'none', borderRadius: 10,
                      fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      fontSize: 13,
                      cursor: canProceed() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease', flexShrink: 0,
                    }}
                  >
                    {currentQ === QUESTIONS.length - 1 ? 'Generate blueprint' : 'Continue'}
                    <span style={{ marginLeft: 6, opacity: 0.5, fontSize: 11 }}>↵</span>
                  </button>
                )}
              </div>
            </div>
            </>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
