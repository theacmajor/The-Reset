import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

const CHAPTERS = [
  {
    tag: 'The Beginning',
    title: 'Why I built The Reset',
    body: `I kept seeing the same pattern — talented designers stuck in loops. Great craft, but no direction. Beautiful portfolios that said nothing. Salary complaints with no strategy behind them.\n\nI wanted to build something that didn't just motivate people — it actually told them what to do next. Not a course. Not a community. Just a sharp, honest blueprint built from their real answers.`,
  },
  {
    tag: 'Chapter 01',
    title: 'The Questionnaire',
    body: `Started with 10 carefully chosen questions. Not generic career-quiz stuff — real questions that expose where someone actually is. Current salary, target salary, strengths, gaps, what kind of work they've done.\n\nEach answer feeds into a rules engine that computes signals before the AI even touches it. Income gap multiplier, craft vs thinking tendency, proof gaps. Deterministic logic first, AI second.`,
  },
  {
    tag: 'Chapter 02',
    title: 'The AI Pipeline',
    body: `Two-step AI system. Step one: interpret the raw answers into a structured career profile — archetype classification, bottleneck identification, positioning direction. Step two: generate the actual blueprint content from that profile.\n\nBuilt 8 designer archetypes from scratch. Visual-first, craft-led, motion-first, brand-to-digital, UX generalist, product-no-business, research-heavy, multi-creative. Each has specific traits, common weaknesses, and learning priorities.`,
  },
  {
    tag: 'Chapter 03',
    title: 'The Blueprint — Open Book Layout',
    body: `The output needed to feel like something you'd pin on your wall, not a generic PDF. So I built an open-book layout — two pages side by side with a spine and chrome ring binders.\n\nLeft page: your identity — name, superpower, strengths, gaps, learning roadmap. Right page: your direction — positioning, blind spots, case study guidance, portfolio priorities, and three concrete "start here" actions.`,
  },
  {
    tag: 'Setback',
    title: 'The book animation that never worked',
    body: `I originally designed a front cover that flipped open like a real book using CSS 3D transforms. Cover on the right, flips left with a 2.5-second animation, revealing both pages underneath.\n\nIt never worked properly. The right page content kept hiding behind the flipped cover due to 3D stacking context issues. Spent hours debugging z-index, translateZ, preserve-3d. In the end, I killed it. Removed the cover, removed the flip. Just showed the open book directly.\n\nSometimes the best design decision is deletion.`,
  },
  {
    tag: 'Chapter 04',
    title: 'Firebase Authentication',
    body: `Added Google Sign-In so people can save their blueprints. But I didn't want a separate sign-in page breaking the flow. So I embedded it right inside the questionnaire card — before the first question.\n\nSign in with Google, your name auto-fills from your account, and you're immediately on question one. Seamless. If you're already signed in, you skip straight to the questions.`,
  },
  {
    tag: 'Setback',
    title: 'Supabase ran out of projects',
    body: `Originally built auth with Supabase. Hit the free-tier project limit. Had to rip it all out and switch to Firebase in the same session. Firebase Auth is completely free for Google Sign-In — no project limits, no MAU caps. Should've started there.`,
  },
  {
    tag: 'Chapter 05',
    title: 'Photo Upload',
    body: `Added a photo upload question before the reality check. Your photo appears on the blueprint's polaroid — taped at an angle with a washi-tape effect.\n\nIf you skip the photo, it falls back to the default landscape. There's also a camera icon on the blueprint itself so you can change your photo after generation. 2MB limit with instant validation.`,
  },
  {
    tag: 'Chapter 06',
    title: 'Download as PNG',
    body: `"Download Blueprint" captures the entire book as a high-res PNG using html-to-image. Runs toPng twice — first pass warms up image caching, second pass captures correctly. A known quirk with data URLs.\n\nHides all UI buttons (download, retake, camera icon) before capture, restores them after. The exported image is clean — just the book with the warm paper background.`,
  },
  {
    tag: 'Setback',
    title: 'The download that kept breaking',
    body: `The book uses flex layouts with overflow: hidden and 100vh height constraints everywhere. First attempt captured only the visible viewport — half the content missing. Tried expanding containers, restoring styles after — the rollback kept failing, breaking button layouts.\n\nEventually simplified: just capture the book interior element directly with a solid background color. No DOM manipulation needed. Sometimes the fix is using a smaller scope, not a bigger one.`,
  },
  {
    tag: 'Chapter 07',
    title: 'The Details',
    body: `Ambient music that only plays after you click "Let's start" — fades in to 40% volume. Staggered fade-up animations on every section of the blueprint. Chrome ring binders on the book spine. Progressive blur overlays on backgrounds.\n\nLine height tuning across every card. Breathing space between sections. Proof block cards, portfolio priority chips, numbered "start here" action cards. Every pixel intentional.`,
  },
  {
    tag: 'Chapter 08',
    title: 'Serverless on Vercel',
    body: `The Express server with SQLite couldn't run on Vercel. Ported the entire AI pipeline — rules engine, interpreter, blueprint generator — into a single serverless function.\n\nStateless. No database. The function receives questionnaire answers, runs both AI calls, and returns the blueprint. 60-second timeout for the two OpenAI round-trips.`,
  },
  {
    tag: 'Chapter 09',
    title: 'Mobile & Performance',
    body: `Added a mobile gate — a centered message on the background image telling users to switch to desktop for the full experience. The blueprint layout simply doesn't work on mobile and I'd rather be honest about it than ship a broken responsive version.\n\nPreloaded all images and audio in the HTML head. Compressed images (2.9MB → 1.7MB, 1.2MB → 73KB) and converted the 9.3MB MP3 to a 3.6MB M4A. Every byte matters.`,
  },
  {
    tag: 'The End',
    title: 'Built in one session',
    body: `The entire thing — questionnaire, AI pipeline, blueprint layout, authentication, photo upload, download, animations, deployment — built in a single session with Claude Code.\n\nNo Figma file. No PRD. No sprint planning. Just a clear vision, fast iteration, and the willingness to kill what doesn't work.\n\nThat's The Reset.`,
  },
]

export default function FeaturesPage() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/form%20image.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundColor: '#fff',
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
        position: 'sticky', top: 0, zIndex: 20,
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link to="/" style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 28, color: '#fff', textDecoration: 'none',
          letterSpacing: '-0.01em',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(8px)',
          transition: `opacity 0.5s ${EASE} 0.1s, transform 0.5s ${EASE} 0.1s`,
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
          opacity: show ? 1 : 0,
          transition: `opacity 0.5s ${EASE} 0.2s`,
        }}>
          Take the quiz
        </Link>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '20px 24px 80px',
      }}>
        {/* Hero */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '56px 48px',
          marginBottom: 24,
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(16px)',
          transition: `opacity 0.6s ${EASE} 0.15s, transform 0.6s ${EASE} 0.15s`,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
            color: '#B5B0AB', textTransform: 'uppercase', letterSpacing: '0.08em',
            display: 'block', marginBottom: 16,
          }}>
            Build Log
          </span>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: 'clamp(36px, 5vw, 52px)',
            lineHeight: 1.1, letterSpacing: '-0.02em',
            color: '#0D0D0D', marginBottom: 16,
          }}>
            How The Reset was built
          </h1>
          <p style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 22, lineHeight: 1.4,
            color: '#8A8580',
          }}>
            Every feature, every setback, every decision — from the first commit to deployment. Built in one session.
          </p>
        </div>

        {/* Chapter cards */}
        {CHAPTERS.map((ch, i) => {
          const isSetback = ch.tag === 'Setback'
          const isBookend = ch.tag === 'The Beginning' || ch.tag === 'The End'
          const delay = 0.25 + i * 0.04

          return (
            <div key={i} style={{
              background: isSetback ? '#FAFAF8' : '#fff',
              borderRadius: 16,
              padding: '40px 44px',
              marginBottom: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              borderLeft: isSetback ? '3px solid #D42020' : isBookend ? '3px solid #0D0D0D' : 'none',
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.5s ${EASE} ${delay}s, transform 0.5s ${EASE} ${delay}s`,
            }}>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
                color: isSetback ? '#D42020' : '#B5B0AB',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'block', marginBottom: 12,
              }}>
                {ch.tag}
              </span>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                fontSize: isBookend ? 32 : 26,
                lineHeight: 1.15, letterSpacing: '-0.02em',
                color: '#0D0D0D', marginBottom: 14,
              }}>
                {ch.title}
              </h2>
              {ch.body.split('\n\n').map((para, j) => (
                <p key={j} style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 400,
                  fontSize: 15, lineHeight: 1.6,
                  color: '#555', letterSpacing: '-0.01em',
                  marginBottom: j < ch.body.split('\n\n').length - 1 ? 14 : 0,
                }}>
                  {para}
                </p>
              ))}
            </div>
          )
        })}

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '40px 0 20px',
          opacity: show ? 1 : 0,
          transition: `opacity 0.5s ${EASE} 1s`,
        }}>
          <Link to="/" style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 20, color: '#fff', textDecoration: 'none',
            opacity: 0.8,
          }}>
            Take the quiz →
          </Link>
        </div>
      </div>
    </div>
  )
}
