import React, { useState, useEffect } from 'react'

// ─── Map AI blueprint data to render shape ──────────────────────────────────
function buildData(a = {}) {
  const bp = a._blueprint
  if (bp) {
    return {
      name:          bp.header?.name || a.name || 'Designer',
      currentSalary: bp.header?.currentIncome || a.currentSalary || '-',
      targetSalary:  bp.header?.targetIncome || a.targetSalary || '-',
      date:          bp.header?.generatedOn || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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
    }
  }

  const now = new Date()
  const date = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
  }
}

// ─── Tokens ─────────────────────────────────────────────────────────────────
const BLK = '#0D0D0D'
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const PAGE_BG = '#FEFDFB'
const COVER_BG = '#E8E4DE'
const RING_COLOR = '#C8C4BC'
const RING_SHADOW = '#A8A49C'

// ─── Helpers ────────────────────────────────────────────────────────────────
const inter = (size, weight = 400, color = '#666') => ({
  fontFamily: 'Inter, sans-serif', fontWeight: weight,
  fontSize: size, letterSpacing: '-0.02em', color, lineHeight: 1.5,
})

const serif = (size, color = BLK) => ({
  fontFamily: "'Instrument Serif', serif", fontWeight: 400,
  fontSize: size, lineHeight: 1.15, letterSpacing: '-0.02em', color, margin: 0,
})

const Label = ({ children, style }) => (
  <span style={{
    ...inter(10, 600, '#A8A49C'),
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 6, ...style,
  }}>{children}</span>
)

// ─── Section divider (thin line with label) ─────────────────────────────────
const Divider = ({ label, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 10px', ...style }}>
    <div style={{ flex: 1, height: 1, background: '#E8E4DE' }} />
    {label && <span style={{ ...inter(9, 600, '#C8C4BC'), textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: '#E8E4DE' }} />
  </div>
)

// ─── Ring binding ───────────────────────────────────────────────────────────
const Rings = ({ pageHeight }) => {
  // One ring every ~90px, min 5
  const ringCount = Math.max(5, Math.floor((pageHeight || 800) / 90))
  return (
    <div style={{
      position: 'absolute', top: 20, bottom: 20, left: '50%',
      transform: 'translateX(-50%)', width: 28,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', alignItems: 'center',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {Array.from({ length: ringCount }).map((_, i) => (
        <div key={i} style={{ width: 20, height: 32, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 2, left: 1,
            width: 18, height: 30, borderRadius: '50%',
            border: `2.5px solid ${RING_SHADOW}`, borderLeft: '2.5px solid transparent',
            opacity: 0.4,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 18, height: 30, borderRadius: '50%',
            border: `2.5px solid ${RING_COLOR}`, borderLeft: '2.5px solid transparent',
          }} />
          <div style={{
            position: 'absolute', top: 4, left: 8,
            width: 3, height: 8, borderRadius: 2,
            background: 'rgba(255,255,255,0.6)',
          }} />
        </div>
      ))}
    </div>
  )
}

// ─── Floating card ──────────────────────────────────────────────────────────
const FloatingCard = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
    ...style,
  }}>
    {children}
  </div>
)

// ─── Page ───────────────────────────────────────────────────────────────────
export default function BlueprintPage({ answers, onRestart }) {
  const D = buildData(answers)
  const [show, setShow] = useState(false)
  const [pageH, setPageH] = useState(800)
  const bookRef = React.useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  // Measure page height for ring count
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

  return (
    <div style={{
      height: '100vh', position: 'relative', overflow: 'hidden',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center bottom',
      backgroundColor: '#1a1a1a',
    }}>

      {/* ── Outer frame — lets bg peek through edges ── */}
      <div style={{
        height: '100vh', overflow: 'hidden',
        padding: '20px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* ── Top bar (above book) ── */}
        <div style={{
          width: '100%', maxWidth: 1200,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12, flexShrink: 0,
          ...reveal(0.05),
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/Stamp.png" alt="" style={{ width: 28, height: 28, opacity: 0.6 }} />
            <span style={{ ...inter(11, 500, 'rgba(255,255,255,0.4)'), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              The Reset Blueprint
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.print()}
              className="no-print"
              style={{
                padding: '8px 18px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                ...inter(12, 500, 'rgba(255,255,255,0.7)'), cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: `background 0.2s ${EASE}`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </button>
            {onRestart && (
              <button
                onClick={onRestart}
                className="no-print"
                style={{
                  padding: '8px 18px', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                  ...inter(12, 500, 'rgba(255,255,255,0.7)'), cursor: 'pointer',
                  transition: `background 0.2s ${EASE}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                Retake
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            THE BOOK — single open spread, full viewport width
         ═══════════════════════════════════════════════════════════════════ */}
        <div style={{
          width: '100%', maxWidth: 1200,
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          ...reveal(0.15),
        }}>
          {/* Book cover */}
          <div style={{
            background: COVER_BG,
            borderRadius: 20,
            padding: 10,
            boxShadow: '0 12px 60px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)',
            position: 'relative',
            flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Two-page spread */}
            <div ref={bookRef} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              borderRadius: 14, overflow: 'hidden',
              position: 'relative',
              flex: 1, minHeight: 0,
            }}>
              <Rings pageHeight={pageH} />

              {/* ════════════════════════════════════════════════════════════
                  LEFT PAGE
               ════════════════════════════════════════════════════════════ */}
              <div className="book-page" style={{
                background: PAGE_BG,
                padding: '28px 32px 32px 28px',
                borderRight: '1px solid #E8E4DE',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto', overflowX: 'hidden',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h1 style={{ ...serif('clamp(28px, 3.5vw, 38px)'), marginBottom: 4 }}>
                      {D.name}'s Blueprint
                    </h1>
                    <span style={{ ...inter(11, 500, '#C8C4BC') }}>{D.date}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Label style={{ marginBottom: 2 }}>Current</Label>
                    <p style={{
                      ...serif(16, '#B0A8A0'),
                      textDecoration: 'line-through', textDecorationColor: '#D42020',
                    }}>{D.currentSalary}</p>
                    <Label style={{ marginBottom: 2, marginTop: 8 }}>Target</Label>
                    <p style={serif(16)}>{D.targetSalary}</p>
                  </div>
                </div>

                <Divider />

                {/* Superpower */}
                <div style={{ marginBottom: 14 }}>
                  <Label>Your superpower</Label>
                  <h2 style={{ ...serif('clamp(24px, 2.8vw, 32px)'), marginBottom: 3 }}>
                    {D.superpower.label}
                  </h2>
                  {D.superpower.summary && (
                    <p style={{ ...inter(11), color: '#999', margin: 0 }}>{D.superpower.summary}</p>
                  )}
                </div>

                {/* Small image */}
                <div style={{
                  width: 110, height: 72, borderRadius: 8, overflow: 'hidden',
                  marginBottom: 14, border: '1px solid #E8E4DE', flexShrink: 0,
                }}>
                  <img src="/Main image.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>

                {/* Strengths */}
                <div style={{ marginBottom: 14 }}>
                  <Label>Strengths</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {D.strengths.map(s => (
                      <span key={s} style={{
                        padding: '4px 10px', borderRadius: 5,
                        background: '#EDF5ED', color: '#2A6A2A',
                        ...inter(11, 600),
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                <Divider label="gaps" />

                {/* Gaps to close */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {D.gapActions.map(g => (
                    <div key={g.gap} style={{
                      padding: '10px 12px', borderRadius: 8,
                      background: '#F8F7F5', border: '1px solid #ECEAE6',
                    }}>
                      <span style={{ ...inter(11, 700, BLK), display: 'block', marginBottom: 2 }}>{g.gap}</span>
                      {(g.truth || g.meaning) && (
                        <p style={{ ...inter(11), color: '#888', margin: 0 }}>{g.truth || g.meaning}</p>
                      )}
                      {g.action && (
                        <p style={{ ...inter(11, 600, BLK), margin: 0, marginTop: 2 }}>→ {g.action}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Divider style={{ marginTop: 10 }} label="learn" />

                {/* Learning roadmap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {D.learning.map((item, idx) => {
                    const isObj = typeof item === 'object'
                    const title = isObj ? item.focus : item
                    const line = isObj ? (item.summary || item.practice || '') : ''
                    return (
                      <div key={idx} style={{
                        padding: '8px 12px', borderRadius: 8,
                        background: idx === 0 ? BLK : '#F8F7F5',
                        border: idx === 0 ? 'none' : '1px solid #ECEAE6',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            ...inter(9, 700, idx === 0 ? 'rgba(255,255,255,0.3)' : '#C8C4BC'),
                            letterSpacing: '0.04em',
                          }}>{String(idx + 1).padStart(2, '0')}</span>
                          <span style={{ ...inter(12, 700, idx === 0 ? '#fff' : BLK) }}>{title}</span>
                        </div>
                        {line && (
                          <p style={{
                            ...inter(11, 400, idx === 0 ? 'rgba(255,255,255,0.5)' : '#999'),
                            margin: 0, marginTop: 2, paddingLeft: 24,
                          }}>{line}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  RIGHT PAGE
               ════════════════════════════════════════════════════════════ */}
              <div className="book-page" style={{
                background: PAGE_BG,
                padding: '28px 28px 32px 32px',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto', overflowX: 'hidden',
              }}>
                {/* Positioning card */}
                <FloatingCard style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ ...inter(9, 600, '#A8A49C'), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Your Positioning
                    </span>
                    <span style={{ ...inter(9, 500, '#C8C4BC') }}>{D.archetype || D.targetRole}</span>
                  </div>
                  <p style={{
                    ...serif('clamp(18px, 2vw, 22px)'),
                    lineHeight: 1.35, textAlign: 'center', padding: '6px 0',
                  }}>
                    {D.positioning || D.tagline}
                  </p>
                  <div style={{
                    display: 'flex', justifyContent: 'center', marginTop: 8,
                    paddingTop: 10, borderTop: '1px solid #F0EEEB',
                  }}>
                    <span style={{ ...inter(9, 500, '#C8C4BC'), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {D.targetRole}
                    </span>
                  </div>
                </FloatingCard>

                {/* Blind spot */}
                {D.brutalTruth && (
                  <div style={{
                    background: BLK, borderRadius: 12,
                    padding: '14px 16px', marginBottom: 12,
                  }}>
                    <Label style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Blind spot</Label>
                    <p style={{ ...serif(16, '#fff'), lineHeight: 1.35 }}>
                      {D.brutalTruth.strength || D.brutalTruth.title || ''}
                    </p>
                    <p style={{ ...serif(16, 'rgba(255,255,255,0.45)'), lineHeight: 1.35, marginTop: 3 }}>
                      {D.brutalTruth.gap || D.brutalTruth.summary || ''}
                    </p>
                  </div>
                )}

                <Divider label="case studies" />

                {/* Case study direction */}
                {D.caseStudy && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ ...inter(11, 500, BLK), margin: 0, marginBottom: 8 }}>
                      {D.caseStudy.summary}
                    </p>
                    {(D.caseStudy.proofBlocks || []).length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        {D.caseStudy.proofBlocks.map((b, i) => (
                          <div key={i} style={{
                            flex: '1 1 130px', padding: '10px 12px', borderRadius: 8,
                            background: BLK,
                          }}>
                            <span style={{ ...inter(9, 600, 'rgba(255,255,255,0.35)'), textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>
                              {b.title}
                            </span>
                            <span style={{ ...inter(11, 400, 'rgba(255,255,255,0.8)') }}>{b.detail}</span>
                          </div>
                        ))}
                        {/* Old format fallback */}
                        {!(D.caseStudy.proofBlocks || []).length && (D.caseStudy.recommendations || []).map((r, i) => (
                          <div key={i} style={{
                            flex: '1 1 130px', padding: '10px 12px', borderRadius: 8,
                            background: BLK,
                          }}>
                            <span style={{ ...inter(11, 400, 'rgba(255,255,255,0.8)') }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(D.caseStudy.mustInclude || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {D.caseStudy.mustInclude.map((m, i) => (
                          <span key={i} style={{
                            padding: '3px 9px', borderRadius: 4,
                            background: '#F0EEEB',
                            ...inter(10, 600, '#888'),
                          }}>{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Divider label="portfolio" />

                {/* Portfolio direction */}
                {D.portfolio && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ ...serif(16), marginBottom: 8 }}>{D.portfolio.summary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {D.portfolio.priorities.map((p, i) => (
                        <span key={i} style={{
                          padding: '5px 11px', borderRadius: 5,
                          background: i === 0 ? BLK : '#F0EEEB',
                          color: i === 0 ? '#fff' : BLK,
                          ...inter(11, 600),
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                <Divider label="start here" />

                {/* Start here */}
                {D.startHere.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {D.startHere.slice(0, 3).map((step, i) => {
                      const isObj = typeof step === 'object'
                      const title = isObj ? step.title : step
                      const detail = isObj ? step.detail : ''
                      return (
                        <div key={i} style={{
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                          padding: '10px 12px', borderRadius: 8,
                          border: `1.5px solid ${BLK}`,
                          background: i === 0 ? BLK : 'transparent',
                        }}>
                          <span style={{
                            ...serif(24, i === 0 ? '#fff' : BLK),
                            flexShrink: 0, width: 24,
                          }}>{String(i + 1).padStart(2, '0')}</span>
                          <div style={{ paddingTop: 4 }}>
                            <span style={{ ...inter(12, 700, i === 0 ? '#fff' : BLK), display: 'block' }}>{title}</span>
                            {detail && (
                              <span style={{ ...inter(11, 400, i === 0 ? 'rgba(255,255,255,0.5)' : '#999'), display: 'block', marginTop: 1 }}>{detail}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Final statement + stamp */}
                {D.finalStatement && (
                  <div style={{
                    marginTop: 'auto', textAlign: 'center',
                    padding: '20px 12px 8px',
                    borderTop: '1px solid #E8E4DE',
                  }}>
                    <p style={{ ...serif('clamp(18px, 2vw, 22px)', BLK), lineHeight: 1.3 }}>
                      {D.finalStatement}
                    </p>
                    <img src="/Stamp.png" alt="The Reset" style={{
                      width: 36, height: 36, objectFit: 'contain',
                      opacity: 0.4, marginTop: 12,
                    }} />
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
