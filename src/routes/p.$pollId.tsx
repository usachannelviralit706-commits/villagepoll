import { useEffect, useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Check, Copy, Eye, Loader2, PartyPopper, Users } from 'lucide-react'
import AdSlot from '@/components/AdSlot'
import PollCard from '@/components/PollCard'
import { castVote, getPoll, listPolls } from '@/server/polls.functions'
import type { Poll } from '@/lib/polls'
import { BAR_COLORS, compact, pct, timeAgo } from '@/lib/format'

export const Route = createFileRoute('/p/$pollId')({
  validateSearch: (s: Record<string, unknown>): { created?: boolean } =>
    s.created ? { created: true } : {},
  loader: async ({ params }) => {
    const [{ poll, votedOptionId }, more] = await Promise.all([
      getPoll({ data: { id: params.pollId } }),
      listPolls({ data: { sort: 'trending', limit: 7 } }),
    ])
    if (!poll) throw notFound()
    return { poll, votedOptionId, more: more.filter((p) => p.id !== poll.id).slice(0, 6) }
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.poll.question} — Vote on PollPop` : 'Poll — PollPop'
    const desc = loaderData
      ? `Vote now: ${loaderData.poll.options.map((o) => o.label).join(' · ')}`
      : ''
    return {
      meta: [
        { title },
        { name: 'description', content: desc },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
      ],
    }
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-extrabold">Poll not found</h1>
      <p className="mt-3 text-ink/60">This poll may have been removed or the link is wrong.</p>
      <Link to="/create" className="btn mt-8 bg-tomato text-white">
        Create a new poll
      </Link>
    </div>
  ),
  component: PollPage,
})

function PollPage() {
  const data = Route.useLoaderData()
  const { created } = Route.useSearch()
  const [poll, setPoll] = useState<Poll>(data.poll)
  const [voted, setVoted] = useState<number | null>(data.votedOptionId)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPoll(data.poll)
    setVoted(data.votedOptionId)
    setSelected(null)
    setShowResults(false)
  }, [data.poll.id])

  const resultsVisible = voted !== null || showResults

  // Keep results live while someone is looking at them.
  useEffect(() => {
    if (!resultsVisible) return
    const t = setInterval(async () => {
      if (document.hidden) return
      const r = await getPoll({ data: { id: poll.id, countView: false } }).catch(() => null)
      if (r?.poll) setPoll(r.poll)
    }, 8000)
    return () => clearInterval(t)
  }, [resultsVisible, poll.id])

  async function submitVote() {
    if (selected === null) return
    setSubmitting(true)
    setError('')
    try {
      const r = await castVote({ data: { pollId: poll.id, optionId: selected } })
      setPoll(r.poll)
      setVoted(r.votedOptionId)
      if (r.alreadyVoted) setError('You already voted on this poll — here are the results.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your vote.')
    } finally {
      setSubmitting(false)
    }
  }

  const leader = Math.max(...poll.options.map((o) => o.votes))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {created && (
        <div className="card rise mb-8 flex flex-col gap-4 bg-mint p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <PartyPopper /> Your poll is live! Share the link to start collecting votes.
          </p>
          <CopyLink id={poll.id} />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <article className="card rise p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink/60">
              <span className="rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-ink">{poll.category}</span>
              <span className="flex items-center gap-1"><Users size={15} /> {compact(poll.totalVotes)} votes</span>
              <span className="flex items-center gap-1"><Eye size={15} /> {compact(poll.views)} views</span>
              <span>· {timeAgo(poll.createdAt)}</span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {poll.question}
            </h1>
            {poll.description && <p className="mt-3 text-lg text-ink/70">{poll.description}</p>}

            <div className="mt-8 space-y-3">
              {poll.options.map((o, i) => {
                const color = BAR_COLORS[i % BAR_COLORS.length]
                if (resultsVisible) {
                  const p = pct(o.votes, poll.totalVotes)
                  const mine = voted === o.id
                  return (
                    <div key={o.id} className={`relative overflow-hidden rounded-xl border-2 border-ink bg-paper ${mine ? 'ring-4 ring-ink/15' : ''}`}>
                      <div className={`bar-grow absolute inset-y-0 left-0 ${color}`} style={{ width: `${p}%`, animationDelay: `${i * 80}ms` }} />
                      <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
                        <span className="flex min-w-0 items-center gap-2 font-semibold">
                          {mine && <Check size={18} strokeWidth={3} className="shrink-0" />}
                          <span className="truncate">{o.label}</span>
                          {o.votes === leader && leader > 0 && (
                            <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper">Leading</span>
                          )}
                        </span>
                        <span className="shrink-0 text-right tabular-nums">
                          <span className="font-display text-xl font-bold">{p}%</span>
                          <span className="ml-2 text-sm text-ink/60">{compact(o.votes)}</span>
                        </span>
                      </div>
                    </div>
                  )
                }
                const active = selected === o.id
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelected(o.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 border-ink px-4 py-3.5 text-left font-semibold transition ${
                      active ? `${color} shadow-[3px_3px_0_0_var(--color-ink)]` : 'bg-white hover:bg-paper'
                    }`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink ${active ? 'bg-ink text-paper' : 'bg-white'}`}>
                      {active && <Check size={15} strokeWidth={3} />}
                    </span>
                    {o.label}
                  </button>
                )
              })}
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-tomato">{error}</p>}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {voted === null && !showResults && (
                <>
                  <button onClick={submitVote} disabled={selected === null || submitting} className="btn bg-tomato px-8 py-3 text-lg text-white">
                    {submitting && <Loader2 size={18} className="animate-spin" />}
                    {submitting ? 'Voting…' : 'Vote'}
                  </button>
                  <button onClick={() => setShowResults(true)} className="font-semibold text-ink/60 underline-offset-4 hover:underline">
                    Show results
                  </button>
                </>
              )}
              {voted === null && showResults && (
                <button onClick={() => setShowResults(false)} className="btn bg-white">
                  Back to voting
                </button>
              )}
              {voted !== null && (
                <p className="flex items-center gap-2 font-semibold">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> Thanks for voting! Results update live.
                </p>
              )}
            </div>
          </article>

          {resultsVisible && <AdSlot placement="results" className="mt-10" />}

          <div className="card mt-10 p-6">
            <p className="font-display text-xl font-bold">Share this poll</p>
            <p className="text-sm text-ink/60">More shares, more votes.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CopyLink id={poll.id} />
              <ShareButtons poll={poll} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <AdSlot placement="sidebar" />
          </div>
        </div>
      </div>

      {data.more.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">More polls to vote on</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.more.map((p, i) => <PollCard key={p.id} poll={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function pollUrl(id: string) {
  return typeof window === 'undefined' ? `/p/${id}` : `${window.location.origin}/p/${id}`
}

function CopyLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(pollUrl(id)).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="btn bg-white"
    >
      {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}

function ShareButtons({ poll }: { poll: Poll }) {
  const url = encodeURIComponent(pollUrl(poll.id))
  const text = encodeURIComponent(`Vote on my poll: ${poll.question}`)
  const links = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${text}%20${url}`, cls: 'bg-mint' },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, cls: 'bg-ink text-paper' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, cls: 'bg-sky' },
  ]
  return (
    <>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className={`btn ${l.cls}`}>
          {l.name}
        </a>
      ))}
    </>
  )
}
