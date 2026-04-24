import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { enrichLocation, computeOverlap } from '../lib/timezone'
import type { LocationWithTime } from '../lib/types'
import { flagEmoji } from '../lib/cities'

// ─── helpers ────────────────────────────────────────────────────────────────

function cityTimeBlock(locations: LocationWithTime[]): string {
  return locations
    .map(l => '  - ' + l.city + ' (' + l.country + '): ' + l.timeString + '  ' + l.dateString)
    .join('\n')
}

function overlapLine(locations: LocationWithTime[], userTz: string): string {
  const ov = computeOverlap(locations)
  void userTz
  if (!ov || ov.durationHours === 0) {
    return "I'll find a time that works across our timezones and share a few options."
  }
  const slots = ov.localTimes.map(lt => lt.city + ': ' + lt.start + ' - ' + lt.end).join(' | ')
  return 'The best mutual window appears to be: ' + slots
}

function nextWorkday(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  if (d.getDay() === 6) d.setDate(d.getDate() + 2)
  if (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ─── template definitions ───────────────────────────────────────────────────

type TemplateId =
  | 'meeting_invite'
  | 'product_demo'
  | 'client_followup'
  | 'marketing_promo'
  | 'cold_outreach'
  | 'check_in'
  | 'tz_signature'
  | 'meeting_slots'

interface BuildArgs {
  enriched: LocationWithTime[]
  userTimezone: string
  overlapStr: string
  nextDay: string
}

interface Template {
  id: TemplateId
  icon: string
  label: string
  category: 'schedule' | 'sales' | 'tools'
  description: string
  build: (args: BuildArgs) => { subject: string; body: string }
}

const TEMPLATES: Template[] = [
  {
    id: 'meeting_invite',
    icon: '📅',
    label: 'Meeting Invite',
    category: 'schedule',
    description: 'Schedule a call across timezones with auto-filled local times for each recipient.',
    build: ({ enriched, overlapStr }) => ({
      subject: 'Meeting Invite — Finding a Time That Works for Everyone',
      body: [
        'Hi [Name],',
        '',
        "I'd love to connect to discuss [topic]. Given our different timezones, here's a quick snapshot of where we each are:",
        '',
        cityTimeBlock(enriched),
        '',
        overlapStr,
        '',
        'Would any of the following slots work for you?',
        '  - Option A: [Date] at [time] your local time',
        '  - Option B: [Date] at [time] your local time',
        '  - Option C: [Date] at [time] your local time',
        '',
        "Happy to adjust — just let me know what works best.",
        '',
        'Looking forward to speaking,',
        '[Your name]',
      ].join('\n'),
    }),
  },
  {
    id: 'product_demo',
    icon: '🖥️',
    label: 'Product Demo',
    category: 'schedule',
    description: 'Invite a prospect to a live demo, with timezone context already included.',
    build: ({ enriched, overlapStr, nextDay }) => ({
      subject: "You're Invited: Live Demo of [Product Name]",
      body: [
        'Hi [Name],',
        '',
        "Thank you for your interest in [Product Name]! I'd love to walk you through what we've built.",
        '',
        "I've noted your timezone and set up a 30-minute slot that works on both ends:",
        '',
        cityTimeBlock(enriched),
        '',
        overlapStr,
        '',
        'I am proposing ' + nextDay + ' — does that work for you?',
        "I'll send a calendar invite with a video link the moment you confirm.",
        '',
        'The demo will cover:',
        '  - [Key feature 1]',
        '  - [Key feature 2]',
        '  - Live Q&A',
        '',
        'No prep needed from your side — just show up curious.',
        '',
        'Best,',
        '[Your name]',
      ].join('\n'),
    }),
  },
  {
    id: 'client_followup',
    icon: '🤝',
    label: 'Client Follow-up',
    category: 'schedule',
    description: 'Timely, professional follow-up after a meeting or proposal.',
    build: ({ enriched }) => ({
      subject: 'Following Up — [Topic / Project Name]',
      body: [
        'Hi [Name],',
        '',
        'I wanted to follow up on our recent conversation about [topic].',
        'A quick reference on where we each are:',
        '',
        cityTimeBlock(enriched),
        '',
        'A few things I wanted to share since we last spoke:',
        '  1. [Update or progress point]',
        '  2. [Next step or open question]',
        '  3. [Any resource, doc, or link]',
        '',
        "I know you're busy, so I'll keep this short. Would it make sense to reconnect for 20 minutes this week?",
        '',
        'Best,',
        '[Your name]',
      ].join('\n'),
    }),
  },
  {
    id: 'marketing_promo',
    icon: '📣',
    label: 'Marketing Promotion',
    category: 'sales',
    description: 'Launch a time-sensitive promotion across your global audience.',
    build: ({ enriched }) => ({
      subject: 'Limited Time: [Offer Name] — Ends [Date]',
      body: [
        'Hi [Name],',
        '',
        "We're launching something exciting and wanted you to be among the first to know.",
        '',
        '[Offer headline — what is the deal?]',
        '',
        "This offer is live right now. Here's what time that is for your team:",
        '',
        cityTimeBlock(enriched),
        '',
        'The offer closes on [end date/time] — no extensions.',
        '',
        'What is included:',
        '  - [Benefit 1]',
        '  - [Benefit 2]',
        '  - [Benefit 3]',
        '',
        'Claim your offer: [Link]',
        '',
        'Questions? Hit reply — we are fast.',
        '',
        '[Your name]',
        '[Company]',
      ].join('\n'),
    }),
  },
  {
    id: 'cold_outreach',
    icon: '🎯',
    label: 'Cold Outreach',
    category: 'sales',
    description: 'First-touch outreach with timezone awareness built in.',
    build: ({ enriched, overlapStr }) => ({
      subject: 'Quick Question, [Name] — [Relevant Topic]',
      body: [
        'Hi [Name],',
        '',
        'I came across [how you found them / their company] and wanted to reach out directly.',
        '',
        '[One sentence on what you do and why it is relevant to them.]',
        '',
        "I know you're based in [their city] — here's a quick timezone snapshot so scheduling is easy:",
        '',
        cityTimeBlock(enriched),
        '',
        overlapStr,
        '',
        'Would you be open to a 15-minute call this week? No pitch, just a genuine conversation about [topic].',
        '',
        'If now is not the right time, no worries at all — happy to reconnect whenever suits you.',
        '',
        '[Your name]',
        '[Title, Company]',
        '[LinkedIn / website]',
      ].join('\n'),
    }),
  },
  {
    id: 'check_in',
    icon: '👋',
    label: 'Relationship Check-in',
    category: 'sales',
    description: 'Warm, low-pressure check-in to re-engage a contact.',
    build: ({ enriched }) => ({
      subject: 'Checking In — Hope Things Are Going Well',
      body: [
        'Hi [Name],',
        '',
        'I was thinking about our last conversation and wanted to drop a quick note.',
        '',
        "No agenda here — just a genuine check-in.",
        '',
        "Since we're spread across timezones, here's where I'm at if you ever want to connect live:",
        '',
        cityTimeBlock(enriched),
        '',
        "If anything has changed on your side — new priorities, new challenges — I'd love to hear about it.",
        '',
        'Hope things are going well for you and the team.',
        '',
        'Warmly,',
        '[Your name]',
      ].join('\n'),
    }),
  },
  {
    id: 'tz_signature',
    icon: '🏷️',
    label: 'Timezone Signature',
    category: 'tools',
    description: 'A professional email signature block showing your key timezones.',
    build: ({ enriched }) => ({
      subject: '',
      body: [
        '--',
        '[Your Name] | [Title]',
        '[Company] | [website]',
        '',
        'My timezone availability:',
        enriched.map(l => flagEmoji(l.countryCode) + ' ' + l.city + ': ' + l.timeString).join('  |  '),
        '',
        'Powered by TimeOps',
      ].join('\n'),
    }),
  },
  {
    id: 'meeting_slots',
    icon: '🗓️',
    label: 'Copy Meeting Slots',
    category: 'tools',
    description: 'Generate 3 pre-calculated meeting slot options formatted across all your timezones.',
    build: ({ enriched, nextDay }) => {
      const letters = ['A', 'B', 'C']
      const baseHours = [9, 13, 16]
      const slots = baseHours.map((baseHour, idx) => {
        const d = new Date()
        d.setUTCHours(baseHour, 0, 0, 0)
        const times = enriched.map(l => {
          const local = new Intl.DateTimeFormat('en-US', {
            timeZone: l.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(d)
          return l.city + ': ' + local
        }).join(' | ')
        return 'Option ' + letters[idx] + ': ' + nextDay + ' — ' + times
      })
      return {
        subject: '',
        body: [
          "Here are 3 time slots that work across our timezones:",
          '',
          ...slots,
          '',
          'Let me know which one works for you!',
        ].join('\n'),
      }
    },
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  schedule: '📅 Scheduling',
  sales: '💼 Sales & Outreach',
  tools: '🛠 Quick Tools',
}

// ─── component ───────────────────────────────────────────────────────────────

export function EmailTemplates() {
  const navigate = useNavigate()
  const { locations, userTimezone } = useStore()
  const [activeId, setActiveId] = useState<TemplateId>('meeting_invite')
  const [copied, setCopied] = useState(false)

  const enriched = locations.map(l => enrichLocation(l, userTimezone))
  const overlapStr = overlapLine(enriched, userTimezone)
  const nextDay = nextWorkday()

  const active = TEMPLATES.find(t => t.id === activeId)!
  const built = active.build({ enriched, userTimezone, overlapStr, nextDay })

  const copyText = (active.id === 'tz_signature' || active.id === 'meeting_slots')
    ? built.body
    : 'Subject: ' + built.subject + '\n\n' + built.body

  function handleCopy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isDesktop = window.innerWidth >= 900
  const categories = ['schedule', 'sales', 'tools'] as const

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100dvh',
      background: 'var(--color-bg)', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 20px 12px',
        background: 'var(--color-bg)',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid #1e293b',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--color-card)', border: 'none', borderRadius: 10,
            width: 36, height: 36, color: '#94A3B8', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >{'<'}</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Email Templates</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Auto-filled with your timezone data</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isDesktop ? 'row' : 'column' }}>
        {/* Sidebar */}
        <div style={{
          width: isDesktop ? 260 : '100%',
          borderRight: isDesktop ? '1px solid #1e293b' : 'none',
          borderBottom: !isDesktop ? '1px solid #1e293b' : 'none',
          overflowY: 'auto',
          flexShrink: 0,
          padding: '12px 0',
          display: !isDesktop ? 'flex' : 'block',
          overflowX: !isDesktop ? 'auto' : 'hidden',
        }}>
          {categories.map(cat => (
            <div key={cat} style={{ display: !isDesktop ? 'contents' : 'block' }}>
              {isDesktop && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em',
                  padding: '10px 20px 6px', textTransform: 'uppercase',
                }}>
                  {CATEGORY_LABELS[cat]}
                </div>
              )}
              {TEMPLATES.filter(t => t.category === cat).map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveId(t.id); setCopied(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: isDesktop ? '10px 20px' : '10px 14px',
                    background: t.id === activeId ? 'var(--color-card)' : 'transparent',
                    border: 'none',
                    borderLeft: isDesktop
                      ? (t.id === activeId ? '3px solid var(--color-primary)' : '3px solid transparent')
                      : 'none',
                    borderBottom: !isDesktop
                      ? (t.id === activeId ? '2px solid var(--color-primary)' : '2px solid transparent')
                      : 'none',
                    color: t.id === activeId ? '#F8FAFC' : '#94A3B8',
                    cursor: 'pointer', textAlign: 'left',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: t.id === activeId ? 600 : 400 }}>{t.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 80px' }}>
          {/* Template header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
            <div>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{active.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{active.label}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, maxWidth: 400 }}>{active.description}</div>
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#166534' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Live timezone badges */}
          {enriched.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {enriched.map(l => (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--color-card)',
                  borderRadius: 20, padding: '5px 12px',
                  fontSize: 12, color: '#94A3B8',
                }}>
                  <span>{flagEmoji(l.countryCode)}</span>
                  <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{l.city}</span>
                  <span>{l.timeString}</span>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: l.status === 'available' ? '#22C55E' : l.status === 'edge' ? '#F59E0B' : '#EF4444',
                  }} />
                </div>
              ))}
            </div>
          )}

          {/* Subject line */}
          {built.subject && (
            <div style={{
              background: 'var(--color-card)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 16px',
              borderBottom: '1px solid #334155',
            }}>
              <span style={{ fontSize: 11, color: '#64748B', marginRight: 8 }}>Subject:</span>
              <span style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>{built.subject}</span>
            </div>
          )}

          {/* Body */}
          <pre style={{
            background: 'var(--color-card)',
            borderRadius: built.subject ? '0 0 12px 12px' : 12,
            padding: '16px',
            fontSize: 13,
            lineHeight: 1.75,
            color: '#CBD5E1',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #334155',
            borderTop: built.subject ? 'none' : '1px solid #334155',
          }}>
            {built.body}
          </pre>

          {enriched.length === 0 && (
            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: '#78350f20', border: '1px solid #F59E0B40',
              borderRadius: 10, fontSize: 13, color: '#F59E0B',
            }}>
              Add locations to your dashboard to auto-fill timezone data into templates.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
