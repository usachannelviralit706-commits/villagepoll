import { Fragment } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { BarChart3, Link2, Sparkles, Zap } from 'lucide-react'
import AdSlot from '@/components/AdSlot'
import PollCard from '@/components/PollCard'
import { listPolls } from '@/server/polls.functions'
import { CATEGORIES } from '@/lib/polls'

type Search = { sort?: 'trending' | 'new'; category?: string }

export const Route = createFileRoute('/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    sort: s.sort === 'new' ? 'new' : undefined,
    category:
      typeof s.category === 'string' && s.category !== 'All'
        ? s.category
        : undefined,
  }),
  loaderDeps: ({ search }) => ({
    sort: search.sort ?? 'trending',
    category: search.category ?? 'All',
  }),
  loader: ({ deps }) =>
    listPolls({ data: { sort: deps.sort, category: deps.category } }),
  component: Home,
})

function Home() {
  const polls = Route.useLoaderData()
  const search = Route.useSearch()
  const sort = search.sort ?? 'trending'
  const category = search.category ?? 'All'
  const navigate = useNavigate({ from: '/' })

  const setSearch = (next: Partial<Search>) =>
    navigate({
      search: (prev) => {
        const merged = { ...prev, ...next }
        return {
          sort: merged.sort === 'new' ? 'new' : undefined,
          category: merged.category === 'All' ? undefined : merged.category,
        }
      },
      hash: 'polls',
      resetScroll: false,
    })

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="rise">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-mint px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Free · No sign-up
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              Ask the crowd.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Get answers</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 bg-sun sm:h-6" />
              </span>{' '}
              fast.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/70">
              Make a poll in under a minute, share one link anywhere, and watch
              live results as the votes pour in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/create" className="btn bg-tomato px-7 py-3.5 text-lg text-white">
                Create your poll
              </Link>
              <a href="#polls" className="btn bg-white px-7 py-3.5 text-lg">
                Vote on polls
              </a>
            </div>
            <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              {[
                { icon: Zap, t: 'Instant setup' },
                { icon: Link2, t: 'Shareable link' },
                { icon: BarChart3, t: 'Live results' },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-2 font-semibold">
                  <Icon size={18} className="text-tomato" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroDemo />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <AdSlot placement="leaderboard" />
      </div>

      {/* Poll feed */}
      <section id="polls" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight">
              {sort === 'new' ? 'Fresh polls' : 'Trending polls'}
            </h2>
            <p className="text-ink/60">Tap any poll to cast your vote.</p>
          </div>
          <div className="inline-flex rounded-full border-2 border-ink bg-white p-1 text-sm font-semibold">
            {(['trending', 'new'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSearch({ sort: s })}
                className={`rounded-full px-4 py-1.5 capitalize transition ${
                  sort === s ? 'bg-ink text-paper' : 'hover:bg-paper'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setSearch({ category: c })}
              className={`shrink-0 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold transition ${
                category === c ? 'bg-sun' : 'bg-white hover:bg-paper'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {polls.length === 0 ? (
          <div className="card mt-8 p-10 text-center">
            <p className="font-display text-2xl font-bold">
              No {category !== 'All' ? category : ''} polls yet
            </p>
            <p className="mt-2 text-ink/60">Be the first to ask the crowd.</p>
            <Link to="/create" className="btn mt-6 bg-tomato text-white">
              Create a poll
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((p, i) => (
              <Fragment key={p.id}>
                <PollCard poll={p} index={i} />
                {i === 4 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <AdSlot placement="inFeed" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="card relative overflow-hidden bg-sky p-8 sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-2 border-ink bg-sun" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">
              Got a question on your mind?
            </h2>
            <p className="mt-3 text-lg">
              Settle debates, pick a date, choose a winner. It's free and takes
              seconds.
            </p>
            <Link to="/create" className="btn mt-6 bg-white">
              Start a poll
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function HeroDemo() {
  const rows = [
    { l: 'Beach trip', p: 58, c: 'bg-tomato' },
    { l: 'Mountain cabin', p: 29, c: 'bg-sky' },
    { l: 'City break', p: 13, c: 'bg-sun' },
  ]
  return (
    <div className="relative mx-auto w-full max-w-md rise" style={{ animationDelay: '150ms' }}>
      <div className="absolute -left-4 -top-4 h-full w-full rotate-[-4deg] rounded-2xl border-2 border-ink bg-lilac" />
      <div className="card relative rotate-[1.5deg] p-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink/60">
          <span className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-ink">
            Lifestyle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> Live · 1,284 votes
          </span>
        </div>
        <p className="mt-4 font-display text-2xl font-bold leading-tight">
          Where should we go this summer?
        </p>
        <div className="mt-5 space-y-3">
          {rows.map((r, i) => (
            <div key={r.l} className="relative overflow-hidden rounded-xl border-2 border-ink bg-paper">
              <div
                className={`bar-grow absolute inset-y-0 left-0 ${r.c}`}
                style={{ width: `${r.p}%`, animationDelay: `${300 + i * 120}ms` }}
              />
              <div className="relative flex justify-between px-4 py-2.5 font-semibold">
                <span>{r.l}</span>
                <span className="tabular-nums">{r.p}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-5 -right-3 rotate-6 rounded-full border-2 border-ink bg-sun px-4 py-2 font-display text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)]">
        +1 vote! 🎉
      </div>
    </div>
  )
}
