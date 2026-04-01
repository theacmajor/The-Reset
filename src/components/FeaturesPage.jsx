import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

const FEATURES = [
  {
    tag: 'Why',
    title: 'Designers are stuck in loops',
    body: 'Great craft, no direction. Beautiful portfolios that say nothing. I wanted to build something that tells you what to do next.',
    type: 'full',
  },
  {
    tag: 'Questionnaire',
    title: '10 sharp questions',
    body: 'Not generic career quiz stuff. Real questions that expose where you actually are.',
    type: 'third',
  },
  {
    tag: 'Rules Engine',
    title: 'Deterministic signals first',
    body: 'Income gap multiplier, craft vs thinking tendency, proof gaps. Hard logic before AI.',
    type: 'third',
  },
  {
    tag: 'AI Pipeline',
    title: 'Two step generation',
    body: 'Step one interprets your answers into a career profile. Step two generates the blueprint from it.',
    type: 'third',
  },
  {
    tag: 'Blueprint',
    title: 'Open book layout',
    body: 'Two pages side by side with a spine and chrome ring binders. Left page is your identity. Right page is your direction. Felt like something you\'d pin on your wall.',
    type: 'full',
  },
  {
    tag: 'Setback',
    title: 'The book flip animation',
    body: 'Built a 3D cover that flipped open. CSS transforms, preserve-3d, translateZ. Never worked. Killed it. Sometimes deletion is the best design decision.',
    type: 'half',
    isSetback: true,
  },
  {
    tag: 'Setback',
    title: 'Supabase ran out',
    body: 'Hit the free tier project limit. Ripped it out, switched to Firebase in the same session. Should\'ve started there.',
    type: 'half',
    isSetback: true,
  },
  {
    tag: 'Auth',
    title: 'Google Sign In',
    body: 'Embedded inside the questionnaire card, not a separate page. Sign in, name auto fills, you\'re on question one.',
    type: 'third',
  },
  {
    tag: 'Upload',
    title: 'Your photo on the blueprint',
    body: 'Upload a photo, it appears on the polaroid. Skip it, get the default landscape.',
    type: 'third',
  },
  {
    tag: 'Export',
    title: 'Download as PNG',
    body: 'High res capture with html-to-image. Runs twice to warm up image caching.',
    type: 'third',
  },
  {
    tag: 'Setback',
    title: 'Download kept breaking',
    body: 'Flex layouts with overflow hidden clipped the content. Style rollbacks broke buttons. Fixed by capturing a smaller scope.',
    type: 'full',
    isSetback: true,
  },
  {
    tag: 'Sound',
    title: 'Ambient music',
    body: 'Plays only after Let\'s start. Fades in to 40%.',
    type: 'third',
  },
  {
    tag: 'Animation',
    title: 'Staggered reveals',
    body: 'Every section fades up with blur and scale. Cascading delays across both pages.',
    type: 'third',
  },
  {
    tag: 'Deploy',
    title: 'Serverless on Vercel',
    body: 'Ported the Express + SQLite pipeline into a single stateless function.',
    type: 'third',
  },
  {
    tag: 'Mobile',
    title: 'Honest about limits',
    body: 'The blueprint doesn\'t work on mobile. Instead of shipping a broken responsive version, I show a message asking to switch to desktop.',
    type: 'half',
  },
  {
    tag: 'Performance',
    title: 'Every byte matters',
    body: 'Compressed images from 6.4MB to 3MB total. Converted 9.3MB MP3 to 3.6MB M4A. Preloaded everything in HTML head.',
    type: 'half',
  },
  {
    tag: 'Admin',
    title: 'Data rich dashboard',
    body: 'Admin panel at /admin with email gated access. Submissions table with expandable rows, per question analytics with bar charts, and CSV export. All data stored in Firestore, served through authenticated serverless functions.',
    type: 'full',
  },
  {
    tag: 'The End',
    title: 'Built in 3 sleepless nights',
    body: 'No Figma. No PRD. No sprint planning. Three days, no sleep, just a clear vision and the willingness to kill what doesn\'t work. That\'s The Reset.',
    type: 'full',
    isEnd: true,
  },
]

export default function FeaturesPage() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
    window.scrollTo(0, 0)
  }, [])

  const anim = (delay) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.5s ${EASE} ${delay}s, transform 0.5s ${EASE} ${delay}s`,
  })

  // Group features into rows
  const rows = []
  let i = 0
  while (i < FEATURES.length) {
    const f = FEATURES[i]
    if (f.type === 'full') {
      rows.push([f])
      i++
    } else if (f.type === 'half') {
      const pair = [f]
      if (i + 1 < FEATURES.length && FEATURES[i + 1].type === 'half') pair.push(FEATURES[++i])
      rows.push(pair)
      i++
    } else if (f.type === 'third') {
      const trio = [f]
      if (i + 1 < FEATURES.length && FEATURES[i + 1].type === 'third') trio.push(FEATURES[++i])
      if (i + 1 < FEATURES.length && FEATURES[i + 1].type === 'third') trio.push(FEATURES[++i])
      rows.push(trio)
      i++
    } else {
      rows.push([f])
      i++
    }
  }

  let itemIdx = 0

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
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
        <Link to="/" style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
          padding: '8px 18px', borderRadius: 50,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          ...anim(0.2),
        }}>
          Take the quiz
        </Link>
      </div>

      {/* Main card */}
      <div style={{
        flex: 1, minHeight: 0,
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: '0 24px 24px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '52px 48px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          height: '100%',
          overflowY: 'auto',
          ...anim(0.15),
        }}>
          {/* Hero */}
          <div style={{ marginBottom: 44 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
              color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'block', marginBottom: 14,
            }}>
              Build Log
            </span>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif", fontWeight: 400,
              fontSize: 'clamp(43px, 6vw, 58px)',
              lineHeight: 1.1, letterSpacing: '-0.02em',
              color: '#0D0D0D', marginBottom: 12,
            }}>
              How The Reset was built
            </h1>
            <p style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 20, lineHeight: 1.4, color: '#8A8580',
            }}>
              Every feature, every setback. Three sleepless nights.
            </p>
          </div>

          {/* Feature blocks */}
          {rows.map((row, rIdx) => {
            return (
              <div key={rIdx} style={{
                display: 'flex', gap: 12,
                marginBottom: 12,
              }}>
                {row.map((f) => {
                  const idx = itemIdx++
                  const delay = 0.2 + idx * 0.03
                  return (
                    <div key={idx} style={{
                      flex: 1,
                      padding: '24px 26px',
                      borderRadius: 12,
                      background: f.isSetback ? '#FDFBF9' : '#F9F8F6',
                      borderLeft: f.isSetback ? '3px solid #D42020' : f.isEnd ? '3px solid #0D0D0D' : 'none',
                      ...anim(delay),
                    }}>
                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                        color: f.isSetback ? '#D42020' : '#C8C4BC',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        display: 'block', marginBottom: 8,
                      }}>
                        {f.tag}
                      </span>
                      <h3 style={{
                        fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                        fontSize: f.type === 'full' || f.isEnd ? 29 : 23,
                        lineHeight: 1.15, letterSpacing: '-0.02em',
                        color: '#0D0D0D', marginBottom: 8,
                      }}>
                        {f.title}
                      </h3>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 400,
                        fontSize: 13, lineHeight: 1.5,
                        color: '#777', letterSpacing: '-0.01em',
                        margin: 0,
                      }}>
                        {f.body}
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
