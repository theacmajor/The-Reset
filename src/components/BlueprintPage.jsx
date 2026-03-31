import React, { useState, useEffect } from 'react'

// ─── Weakness → Action map ────────────────────────────────────────────────────
const WEAKNESS_ACTIONS = {
  'Presenting work':        'Practice presenting with context, intent, and narrative',
  'Client communication':   'Build structured communication habits for every project',
  'Storytelling':           'Write one case study that leads with the problem, not the screen',
  'Product thinking':       'Study how teams define problems before designing solutions',
  'Research depth':         'Run lightweight user interviews and practice synthesizing insights',
  'Metrics understanding':  'Learn the KPIs that matter in product design contexts',
  'Business thinking':      'Connect design decisions to business outcomes and revenue',
  'Decision making':        'Practice making and defending design decisions with rationale',
  'Stakeholder management': 'Learn to align and communicate with non-design stakeholders',
  'Confidence':             'Document your process and get comfortable sharing in-progress work',
  'Consistency':            'Establish a personal design system and visual language',
  'Portfolio quality':      'Rebuild your top case study with a problem-first structure',
  'Case study writing':     'Reframe each case: problem, constraint, decision, outcome',
  'Negotiation':            'Study negotiation fundamentals for creative professionals',
  'Systems thinking':       'Practice mapping systems before jumping to UI solutions',
  'Prioritization':         'Define what "done" looks like before starting any project',
  'Strategy':               'Connect your design output to a higher-level business goal',
}

const WORK_TYPES = {
  'Mobile App': 'Product', 'Web App': 'Product', 'SaaS Dashboard': 'Data',
  'Landing Page': 'Marketing', 'Branding Project': 'Brand', 'Design System': 'Systems',
  'Personal Project': 'Personal', 'Freelance Work': 'Freelance', 'Client Work': 'Client',
  'Redesign Project': 'Redesign',
}

function buildData(a = {}) {
  // If AI-generated blueprint exists, use it directly
  const bp = a._blueprint
  if (bp) {
    return {
      name:          bp.header?.name || a.name || 'Designer',
      currentSalary: bp.header?.currentIncome || a.currentSalary || '-',
      targetSalary:  bp.header?.targetIncome || a.targetSalary || '-',
      date:          bp.header?.generatedOn || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      superpower:    bp.positioning?.superpowerLabel || 'Design',
      targetRole:    a.targetRole || 'Product Designer',
      tagline:       bp.tagline || bp.positioning?.positioningStatement || '',
      strengths:     bp.strengths || [],
      weaknesses:    (bp.weaknessToAction || []).map(w => ({ label: w.weakness, action: w.action })),
      cases:         (bp.caseStudyStack || []).map((c, i) => ({ title: c, type: '', primary: i === 0 })),
      learn:         bp.learningRoadmap || [],
      interests:     a.interests || [],
      show:          bp.thingsToShow || [],
      archetype:     bp.archetype || '',
      finalStatement: bp.finalStatement || '',
      portfolioStructure: bp.portfolioStructure || [],
      positioningStatement: bp.positioning?.positioningStatement || '',
    }
  }

  // Fallback: derive client-side from raw answers
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const superpower = (a.strengths || [])[0] || 'Design'
  const targetRoles = Array.isArray(a.targetRole) ? a.targetRole : [a.targetRole].filter(Boolean)
  const targetRole = targetRoles[0] || 'Product Designer'
  const weaknesses = (a.weaknesses || []).map(w => ({
    label: w, action: WEAKNESS_ACTIONS[w] || 'Study and practice this skill deliberately',
  }))
  const workSignal = a.workSignal || []
  const cases = workSignal.length > 0
    ? workSignal.map((w, i) => ({ title: w, type: WORK_TYPES[w] || 'Portfolio', primary: i === 0 }))
    : [{ title: 'Primary Project', type: 'Portfolio', primary: true }]
  const interests = a.interests || []
  const learn = [...new Set([...(a.weaknesses || []).slice(0, 5), ...interests.slice(0, 4)])]

  return {
    name: a.name || 'Designer', currentSalary: a.currentSalary || '-',
    targetSalary: a.targetSalary || '-', date, superpower, targetRole,
    tagline: `A ${superpower.toLowerCase()}-first designer building toward ${targetRole.toLowerCase()}.`,
    strengths: a.strengths || [], weaknesses, cases, learn, interests,
    show: workSignal.length > 0 ? workSignal : ['Visual Work', 'Motion', 'Branding'],
    archetype: '', finalStatement: '', portfolioStructure: [], positioningStatement: '',
  }
}

// ─── Shared ──────────────────────────────────────────────────────────────────
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

const Card = ({ children, style, span, className = '' }) => (
  <div className={className} style={{
    background: '#fff', borderRadius: 16, padding: '24px',
    gridColumn: span ? `span ${span}` : undefined,
    ...style,
  }}>
    {children}
  </div>
)

const Label = ({ children, style }) => (
  <span style={{
    fontFamily: 'Inter, sans-serif', fontWeight: 500,
    fontSize: 11, color: '#999', letterSpacing: '-0.02em',
    display: 'block', marginBottom: 8, ...style,
  }}>{children}</span>
)

const Heading = ({ children, size = 28, style }) => (
  <h2 style={{
    fontFamily: "'Instrument Serif', serif", fontWeight: 400,
    fontSize: size, lineHeight: 1.1, letterSpacing: '-0.02em',
    color: '#0D0D0D', margin: 0, ...style,
  }}>{children}</h2>
)

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BlueprintPage({ answers, onRestart }) {
  const D = buildData(answers)
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  const reveal = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(12px)',
    filter: show ? 'blur(0)' : 'blur(4px)',
    transition: `opacity 0.5s ${EASE} ${delay}s, transform 0.5s ${EASE} ${delay}s, filter 0.5s ${EASE} ${delay}s`,
  })

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center bottom',
      backgroundColor: '#1a1a1a',
    }}>
      {/* Top blur */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '25%', zIndex: 1,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />


      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 32px 48px', maxWidth: 900, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: 24, paddingTop: 32, ...reveal(0.1) }}>
          <Label style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{D.date}</Label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif", fontWeight: 400,
              fontSize: 'clamp(40px, 7vw, 64px)', lineHeight: 1.05,
              letterSpacing: '-0.02em', color: '#fff', marginBottom: 0,
            }}>
              {D.name}'s Blueprint
            </h1>
            {onRestart && (
              <button
                onClick={onRestart}
                style={{
                  padding: '10px 20px', background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 13, color: '#fff', cursor: 'pointer',
                  letterSpacing: '-0.02em', flexShrink: 0,
                  transition: `background 0.2s ${EASE}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                Retake quiz
              </button>
            )}
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 400,
            fontSize: 16, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em',
            maxWidth: 400, marginTop: 10,
          }}>
            {D.tagline}
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>

          {/* Superpower — large */}
          <Card span={2} style={{ ...reveal(0.15), padding: '32px' }}>
            <Label>Your superpower</Label>
            <Heading size={42}>{D.superpower}</Heading>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 400,
              fontSize: 14, color: '#888', letterSpacing: '-0.02em',
              marginTop: 12, lineHeight: 1.5,
            }}>
              This is your edge. Build your portfolio and positioning around this.
            </p>
          </Card>

          {/* Salary */}
          <Card style={{ ...reveal(0.2), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Label>Current</Label>
              <p style={{
                fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                fontSize: 20, color: '#999', letterSpacing: '-0.02em',
                textDecoration: 'line-through', textDecorationColor: '#D42020',
              }}>{D.currentSalary}</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <Label>Target</Label>
              <Heading size={28}>{D.targetSalary}</Heading>
            </div>
          </Card>

          {/* Direction */}
          <Card style={{ ...reveal(0.25) }}>
            <Label>Direction</Label>
            <Heading size={24}>{D.targetRole}</Heading>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 400,
              fontSize: 13, color: '#999', letterSpacing: '-0.02em',
              marginTop: 8, lineHeight: 1.5,
            }}>
              Your next role target
            </p>
          </Card>

          {/* Strengths */}
          <Card span={2} style={{ ...reveal(0.3) }}>
            <Label>Strengths</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {D.strengths.map(s => (
                <span key={s} style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: '#F0F7F0', color: '#2A6A2A',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 13, letterSpacing: '-0.02em',
                }}>{s}</span>
              ))}
            </div>
          </Card>

          {/* Gaps */}
          <Card span={3} style={{ ...reveal(0.35) }}>
            <Label>Gaps to close</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginTop: 4 }}>
              {D.weaknesses.map(w => (
                <div key={w.label} style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: '#FFF8F5', border: '1px solid #F0E8E2',
                }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    fontSize: 14, color: '#0D0D0D', letterSpacing: '-0.02em',
                    display: 'block', marginBottom: 4,
                  }}>{w.label}</span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 400,
                    fontSize: 12, color: '#999', letterSpacing: '-0.02em',
                    lineHeight: 1.5,
                  }}>{w.action}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Work signals */}
          <Card span={2} style={{ ...reveal(0.4) }}>
            <Label>Portfolio direction</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {D.cases.map((c, i) => (
                <div key={c.title} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: c.primary ? '#0D0D0D' : '#F5F4F2',
                  color: c.primary ? '#fff' : '#0D0D0D',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 13, letterSpacing: '-0.02em',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {c.primary && <span style={{ fontSize: 10, opacity: 0.5 }}>Lead</span>}
                  {c.title}
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{c.type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Interests */}
          <Card style={{ ...reveal(0.45) }}>
            <Label>What pulls you</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {D.interests.map(i => (
                <span key={i} style={{
                  fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                  fontSize: 18, color: '#0D0D0D', letterSpacing: '-0.01em',
                }}>{i}</span>
              ))}
            </div>
          </Card>

          {/* Learning roadmap */}
          <Card span={3} style={{ ...reveal(0.5), background: '#0D0D0D', color: '#fff' }}>
            <Label style={{ color: 'rgba(255,255,255,0.4)' }}>Learning roadmap</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {D.learn.map((topic, idx) => (
                <div key={topic} style={{
                  padding: '10px 18px', borderRadius: 10,
                  background: idx === 0 ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: idx === 0 ? '#0D0D0D' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  fontSize: 13, letterSpacing: '-0.02em',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{String(idx + 1).padStart(2, '0')}</span>
                  {topic}
                </div>
              ))}
            </div>
          </Card>

          {/* Positioning statement */}
          <Card span={3} style={{
            ...reveal(0.55),
            background: 'linear-gradient(135deg, #F8F7F5 0%, #F0EEEB 100%)',
            padding: '40px 32px', textAlign: 'center',
          }}>
            <Label style={{ textAlign: 'center' }}>Your positioning</Label>
            <Heading size={36} style={{ maxWidth: 500, margin: '0 auto' }}>
              {D.tagline}
            </Heading>
          </Card>

          {/* Actions */}
          <Card span={3} className="no-print" style={{
            ...reveal(0.6),
            background: 'transparent', padding: '0',
            display: 'flex', gap: 10, justifyContent: 'center',
          }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: '12px 24px', background: '#fff', color: '#0D0D0D',
                border: 'none', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 13, cursor: 'pointer', letterSpacing: '-0.02em',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: `transform 160ms ${EASE}`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </button>
          </Card>
        </div>

        {/* Stamp */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, ...reveal(0.65) }}>
          <img src="/Stamp.png" alt="The Reset" style={{
            width: 64, height: 64, objectFit: 'contain',
            opacity: 0.8,
          }} />
        </div>
      </div>
    </div>
  )
}
