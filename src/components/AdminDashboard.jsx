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

export default function AdminDashboard() {
  const user = useAuth()
  const [submissions, setSubmissions] = useState(null)
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const [tab, setTab] = useState('table') // 'table' | 'analytics'
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
        .then(data => setSubmissions(data.submissions || []))
        .catch(err => setError(err.message))
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
        maxWidth: 1100, width: '100%',
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
                <div style={{ flex: 1, minHeight: 0 }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1.2fr',
                    gap: 1, padding: '10px 14px',
                    borderBottom: '2px solid #0D0D0D',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 2,
                  }}>
                    {['Name', 'Email', 'Date', 'Current', 'Target', 'Archetype'].map(h => (
                      <span key={h} style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                        color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>{h}</span>
                    ))}
                  </div>

                  {/* Rows */}
                  {submissions.map((s, idx) => (
                    <div key={s.id || idx}>
                      <div
                        onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1.2fr',
                          gap: 1, padding: '12px 14px',
                          borderBottom: '1px solid #F0EEEB',
                          cursor: 'pointer',
                          background: expandedRow === idx ? '#FAFAF8' : 'transparent',
                          transition: `background 0.15s ${EASE}`,
                        }}
                      >
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#0D0D0D' }}>{s.name}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email || 'N/A'}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#777' }}>{s.answers?.currentSalary || 'N/A'}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#777' }}>{s.answers?.targetSalary || 'N/A'}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999' }}>{s.profile?.primaryArchetype || 'N/A'}</span>
                      </div>

                      {/* Expanded details */}
                      {expandedRow === idx && (
                        <div style={{
                          padding: '16px 14px 20px',
                          background: '#FAFAF8',
                          borderBottom: '1px solid #F0EEEB',
                          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                        }}>
                          {Object.entries(QUESTION_LABELS).map(([key, label]) => {
                            const val = s.answers?.[key]
                            return (
                              <div key={key}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{label}</span>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#555' }}>
                                  {Array.isArray(val) ? val.join(', ') : val || 'N/A'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {submissions.length === 0 && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#B5B0AB', textAlign: 'center', padding: 40 }}>
                      No submissions yet
                    </p>
                  )}
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
