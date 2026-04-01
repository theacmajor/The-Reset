import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const ADMIN_EMAIL = 'tripletech126@gmail.com'

const QUESTION_LABELS = {
  currentSalary: 'Current Salary',
  targetSalary: 'Target Salary',
  journeyState: 'Current Role',
  targetRole: 'Target Role',
  strengths: 'Strengths',
  weaknesses: 'Gaps',
  interests: 'Interests',
  workSignal: 'Work Type',
}

function countOptions(submissions, field) {
  const counts = {}
  submissions.forEach(s => {
    const val = s.answers?.[field]
    if (Array.isArray(val)) {
      val.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
    } else if (val) {
      counts[val] = (counts[val] || 0) + 1
    }
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
}

function downloadCSV(submissions) {
  const headers = ['Name', 'Email', 'Date', 'Current Salary', 'Target Salary', 'Current Role', 'Target Role', 'Strengths', 'Gaps', 'Interests', 'Work Type', 'Archetype']
  const rows = submissions.map(s => [
    s.name || '',
    s.email || '',
    s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
    s.answers?.currentSalary || '',
    s.answers?.targetSalary || '',
    s.answers?.journeyState || '',
    s.answers?.targetRole || '',
    (s.answers?.strengths || []).join('; '),
    (s.answers?.weaknesses || []).join('; '),
    (s.answers?.interests || []).join('; '),
    (s.answers?.workSignal || []).join('; '),
    s.profile?.primaryArchetype || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `the-reset-submissions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const MOCK_SUBMISSIONS = [
  {
    id: 'mock-1', name: 'Riya Sharma', email: 'riya@gmail.com', createdAt: '2026-04-01T14:30:00Z',
    answers: { currentSalary: '5–8 LPA', targetSalary: '25–40 LPA', journeyState: 'UI Designer', targetRole: 'Senior Product Designer', strengths: ['Aesthetics', 'Typography', 'Color & Composition'], weaknesses: ['Product Thinking', 'User Research', 'Business Thinking'], interests: ['Motion Design', 'Branding', 'Content Creation'], workSignal: ['Mobile App', 'Landing Page', 'Personal Project'] },
    signals: { incomeGapMultiple: 5, urgency: 'extreme', tendency: 'craft-led' },
    profile: { primaryArchetype: 'visual-product', currentLevelSummary: 'Strong visual craft, weak strategic thinking' },
  },
  {
    id: 'mock-2', name: 'Arjun Mehta', email: 'arjun.mehta@outlook.com', createdAt: '2026-04-01T11:15:00Z',
    answers: { currentSalary: '12–18 LPA', targetSalary: '40–60 LPA', journeyState: 'Product Designer', targetRole: 'Design Lead', strengths: ['Product Thinking', 'Design Systems', 'Rapid Prototyping'], weaknesses: ['Business Thinking', 'Stakeholder Management', 'Presenting Work'], interests: ['AI Tools', 'Design Systems', 'Writing'], workSignal: ['Web App', 'SaaS Dashboard', 'Client Work'] },
    signals: { incomeGapMultiple: 3.3, urgency: 'high', tendency: 'thinking-led' },
    profile: { primaryArchetype: 'product-no-business', currentLevelSummary: 'Solid product process, missing business framing' },
  },
  {
    id: 'mock-3', name: 'Priya Nair', email: 'priya.n@gmail.com', createdAt: '2026-03-31T18:45:00Z',
    answers: { currentSalary: '3–5 LPA', targetSalary: '18–25 LPA', journeyState: 'Freelancer', targetRole: 'Product Designer', strengths: ['Animation & Motion', 'Micro-interactions', 'Visual Design', 'Storytelling'], weaknesses: ['Information Architecture', 'User Research', 'Structured UX Process'], interests: ['Motion Design', 'Creative Direction', 'Branding'], workSignal: ['Freelance Work', 'Personal Project', 'Landing Page'] },
    signals: { incomeGapMultiple: 5.4, urgency: 'extreme', tendency: 'craft-led' },
    profile: { primaryArchetype: 'motion-visual', currentLevelSummary: 'Impressive motion work, lacks strategic context' },
  },
  {
    id: 'mock-4', name: 'Karan Singh', email: 'karan.s@yahoo.com', createdAt: '2026-03-31T09:20:00Z',
    answers: { currentSalary: '8–12 LPA', targetSalary: '25–40 LPA', journeyState: 'UX Designer', targetRole: 'Product Designer', strengths: ['User Research', 'Wireframing', 'Prototyping'], weaknesses: ['Visual Design', 'Typography', 'Positioning'], interests: ['AI Tools', 'Writing', 'Design Systems'], workSignal: ['Web App', 'Mobile App', 'Redesign Project'] },
    signals: { incomeGapMultiple: 3.3, urgency: 'high', tendency: 'thinking-led' },
    profile: { primaryArchetype: 'ux-generalist', currentLevelSummary: 'Broad skills but no clear positioning' },
  },
  {
    id: 'mock-5', name: 'Ananya Reddy', email: 'ananya.r@gmail.com', createdAt: '2026-03-30T22:10:00Z',
    answers: { currentSalary: 'Less than 3 LPA', targetSalary: '12–18 LPA', journeyState: 'Student', targetRole: 'UX Designer', strengths: ['Aesthetics', 'Attention to Detail', 'Layout & Grids'], weaknesses: ['Product Thinking', 'Rapid Prototyping', 'Presenting Work'], interests: ['Branding', 'Content Creation', 'Motion Design'], workSignal: ['Personal Project', 'Landing Page'] },
    signals: { incomeGapMultiple: 7.5, urgency: 'extreme', tendency: 'craft-led' },
    profile: { primaryArchetype: 'visual-product', currentLevelSummary: 'Early career, strong aesthetic sense' },
  },
  {
    id: 'mock-6', name: 'Vikram Joshi', email: 'vikram@studio.co', createdAt: '2026-03-30T15:30:00Z',
    answers: { currentSalary: '18–25 LPA', targetSalary: '60 LPA – 1 CR', journeyState: 'Product Designer', targetRole: 'Head of Design', strengths: ['Product Thinking', 'Design Systems', 'Systems thinking', 'Strategy'], weaknesses: ['Business Thinking', 'Stakeholder Management'], interests: ['Creative Direction', 'Writing', 'AI Tools'], workSignal: ['SaaS Dashboard', 'Web App', 'Client Work', 'Mobile App'] },
    signals: { incomeGapMultiple: 3.7, urgency: 'high', tendency: 'thinking-led' },
    profile: { primaryArchetype: 'product-no-business', currentLevelSummary: 'Strong product thinker, needs business language' },
  },
  {
    id: 'mock-7', name: 'Sneha Gupta', email: 'sneha.g@gmail.com', createdAt: '2026-03-29T20:00:00Z',
    answers: { currentSalary: '5–8 LPA', targetSalary: '18–25 LPA', journeyState: 'UI Designer', targetRole: 'Product Designer', strengths: ['Typography', 'Color & Composition', 'Branding', 'Visual Design'], weaknesses: ['Prototyping', 'Information Architecture', 'Product Thinking'], interests: ['Branding', 'Motion Design', 'Creative Direction'], workSignal: ['Freelance Work', 'Branding Project', 'Landing Page'] },
    signals: { incomeGapMultiple: 3.3, urgency: 'high', tendency: 'craft-led' },
    profile: { primaryArchetype: 'brand-to-digital', currentLevelSummary: 'Strong brand thinking, needs digital product experience' },
  },
  {
    id: 'mock-8', name: 'Rohan Patel', email: 'rohan.p@outlook.com', createdAt: '2026-03-29T12:45:00Z',
    answers: { currentSalary: '8–12 LPA', targetSalary: '40–60 LPA', journeyState: 'Product Designer', targetRole: 'Senior Product Designer', strengths: ['Rapid Prototyping', 'Attention to Detail', 'Visual Design'], weaknesses: ['User Research', 'Strategy', 'Decision making', 'Presenting Work'], interests: ['Design Systems', 'AI Tools', 'Writing'], workSignal: ['Mobile App', 'Web App', 'SaaS Dashboard'] },
    signals: { incomeGapMultiple: 5, urgency: 'extreme', tendency: 'balanced' },
    profile: { primaryArchetype: 'research-heavy', currentLevelSummary: 'Execution heavy, wants to do more research' },
  },
]

export default function AdminDashboard() {
  const user = useAuth()
  const [submissions, setSubmissions] = useState(null)
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const [tab, setTab] = useState('table')
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return
    user.getIdToken().then(token => {
      fetch('/api/admin-submissions', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const real = data.submissions || []
          // Use mock data if no real submissions yet
          setSubmissions(real.length > 0 ? real : MOCK_SUBMISSIONS)
        })
        .catch(() => {
          // Fallback to mock data on error
          setSubmissions(MOCK_SUBMISSIONS)
        })
    })
  }, [user])

  const anim = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.5s ${EASE} ${delay}s, transform 0.5s ${EASE} ${delay}s`,
  })

  // Loading auth
  if (user === undefined) {
    return <div style={{ minHeight: '100vh', background: '#fff' }} />
  }

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top blur */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '20%',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10,
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 20, flexShrink: 0,
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link to="/" style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 28, color: '#fff', textDecoration: 'none',
          letterSpacing: '-0.01em', ...anim(0.1),
        }}>
          The Reset
        </Link>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
          color: 'rgba(255,255,255,0.5)', ...anim(0.2),
        }}>
          Admin
        </span>
      </div>

      {/* Main card */}
      <div style={{
        flex: 1, minHeight: 0,
        maxWidth: 1400, width: '100%',
        margin: '0 auto',
        padding: '0 24px 24px',
      }}>
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '40px 44px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          height: '100%', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          ...anim(0.15),
        }}>

          {/* Not signed in */}
          {!user && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: '#0D0D0D' }}>Sign in required</h2>
              <button onClick={() => signInWithPopup(auth, googleProvider)} style={{
                padding: '12px 24px', background: '#0D0D0D', color: '#F5F2EC',
                border: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* Access denied */}
          {user && user.email !== ADMIN_EMAIL && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: '#0D0D0D' }}>Access denied</h2>
            </div>
          )}

          {/* Admin content */}
          {user && user.email === ADMIN_EMAIL && (
            <>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h1 style={{
                    fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                    fontSize: 36, lineHeight: 1.1, color: '#0D0D0D', marginBottom: 4,
                  }}>
                    Submissions
                  </h1>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#B5B0AB' }}>
                    {submissions ? `${submissions.length} total` : 'Loading...'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Tabs */}
                  {['table', 'analytics'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: tab === t ? '#0D0D0D' : '#F5F3F0',
                      color: tab === t ? '#fff' : '#777',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', textTransform: 'capitalize',
                      transition: `all 0.2s ${EASE}`,
                    }}>
                      {t}
                    </button>
                  ))}
                  {/* Download */}
                  {submissions && (
                    <button onClick={() => downloadCSV(submissions)} style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '1px solid #E0DDD8', background: '#fff', color: '#555',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      CSV
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#D42020', marginBottom: 16 }}>
                  Error: {error}
                </p>
              )}

              {!submissions && !error && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#B5B0AB', textAlign: 'center', padding: 40 }}>
                  Loading submissions...
                </p>
              )}

              {/* Table view */}
              {tab === 'table' && submissions && (
                <div style={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
                  <div style={{ minWidth: 1100 }}>
                    {/* Table header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 160px 70px 90px 90px 80px 120px 1fr 1fr 140px',
                      gap: 8, padding: '10px 14px',
                      borderBottom: '2px solid #0D0D0D',
                      position: 'sticky', top: 0, background: '#fff', zIndex: 2,
                    }}>
                      {['Name', 'Email', 'Date', 'Current', 'Target', 'Role', 'Target Role', 'Strengths', 'Gaps', 'Archetype'].map(h => (
                        <span key={h} style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                          color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>{h}</span>
                      ))}
                    </div>

                    {/* Rows */}
                    {submissions.map((s, idx) => {
                      const cell = { fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                      const chip = { display: 'inline-block', padding: '2px 6px', borderRadius: 4, background: '#F0EEEB', fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#555', marginRight: 3, marginBottom: 3, whiteSpace: 'nowrap' }
                      return (
                        <div key={s.id || idx}>
                          <div
                            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '120px 160px 70px 90px 90px 80px 120px 1fr 1fr 140px',
                              gap: 8, padding: '10px 14px',
                              borderBottom: '1px solid #F0EEEB',
                              cursor: 'pointer',
                              background: expandedRow === idx ? '#FAFAF8' : 'transparent',
                              transition: `background 0.15s ${EASE}`,
                              alignItems: 'start',
                            }}
                          >
                            <span style={{ ...cell, fontWeight: 500, color: '#0D0D0D', fontSize: 13 }}>{s.name}</span>
                            <span style={{ ...cell, color: '#999' }}>{s.email || 'N/A'}</span>
                            <span style={cell}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                            <span style={cell}>{s.answers?.currentSalary || 'N/A'}</span>
                            <span style={cell}>{s.answers?.targetSalary || 'N/A'}</span>
                            <span style={cell}>{s.answers?.journeyState || 'N/A'}</span>
                            <span style={cell}>{s.answers?.targetRole || 'N/A'}</span>
                            <div style={{ overflow: 'hidden', lineHeight: 1.6 }}>
                              {(s.answers?.strengths || []).slice(0, 3).map(st => (
                                <span key={st} style={chip}>{st}</span>
                              ))}
                              {(s.answers?.strengths || []).length > 3 && <span style={{ ...chip, background: 'none', color: '#B5B0AB' }}>+{s.answers.strengths.length - 3}</span>}
                            </div>
                            <div style={{ overflow: 'hidden', lineHeight: 1.6 }}>
                              {(s.answers?.weaknesses || []).slice(0, 3).map(w => (
                                <span key={w} style={{ ...chip, background: '#FFF0F0', color: '#D42020' }}>{w}</span>
                              ))}
                              {(s.answers?.weaknesses || []).length > 3 && <span style={{ ...chip, background: 'none', color: '#B5B0AB' }}>+{s.answers.weaknesses.length - 3}</span>}
                            </div>
                            <span style={{ ...cell, fontSize: 11, color: '#999' }}>{s.profile?.primaryArchetype || 'N/A'}</span>
                          </div>

                          {/* Expanded details */}
                          {expandedRow === idx && (
                            <div style={{
                              padding: '16px 14px 20px',
                              background: '#FAFAF8',
                              borderBottom: '1px solid #F0EEEB',
                              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16,
                            }}>
                              {Object.entries(QUESTION_LABELS).map(([key, label]) => {
                                const val = s.answers?.[key]
                                return (
                                  <div key={key}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{label}</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.4, display: 'block' }}>
                                      {Array.isArray(val) ? val.join(', ') : val || 'N/A'}
                                    </span>
                                  </div>
                                )
                              })}
                              {s.signals && (
                                <>
                                  <div>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Urgency</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: s.signals.urgency === 'extreme' ? '#D42020' : '#555', fontWeight: 500 }}>{s.signals.urgency} ({s.signals.incomeGapMultiple}x gap)</span>
                                  </div>
                                  <div>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tendency</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555' }}>{s.signals.tendency}</span>
                                  </div>
                                </>
                              )}
                              {s.profile?.currentLevelSummary && (
                                <div style={{ gridColumn: 'span 2' }}>
                                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>AI Summary</span>
                                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.4, display: 'block' }}>{s.profile.currentLevelSummary}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {submissions.length === 0 && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#B5B0AB', textAlign: 'center', padding: 40 }}>
                        No submissions yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics view */}
              {tab === 'analytics' && submissions && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {Object.entries(QUESTION_LABELS).map(([field, label]) => {
                    const counts = countOptions(submissions, field)
                    if (!counts.length) return null
                    const max = counts[0]?.[1] || 1

                    return (
                      <div key={field} style={{
                        padding: '20px 22px', borderRadius: 12,
                        background: '#F9F8F6',
                      }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                          color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em',
                          display: 'block', marginBottom: 14,
                        }}>
                          {label}
                        </span>
                        {counts.slice(0, 8).map(([option, count]) => (
                          <div key={option} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555' }}>{option}</span>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#B5B0AB', fontWeight: 500 }}>{count}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: '#E8E5E0' }}>
                              <div style={{
                                height: '100%', borderRadius: 2,
                                background: '#0D0D0D',
                                width: `${(count / max) * 100}%`,
                                transition: `width 0.4s ${EASE}`,
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
