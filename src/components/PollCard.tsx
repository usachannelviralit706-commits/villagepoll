import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Users } from 'lucide-react'
import type { Poll } from '@/lib/polls'
import { BAR_COLORS, compact, pct } from '@/lib/format'

export default function PollCard({ poll, index = 0 }: { poll: Poll; index?: number }) {
  const top = [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3)
  return (
    <Link
      to="/p/$pollId"
      params={{ pollId: poll.id }}
      className="card rise group flex flex-col gap-4 p-5 transition hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--color-ink)]"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5">
          {poll.category}
        </span>
        <span className="flex items-center gap-1 text-ink/60">
          <Users size={14} /> {compact(poll.totalVotes)} votes
        </span>
      </div>
      <h3 className="font-display text-xl font-bold leading-snug">
        {poll.question}
      </h3>
      <div className="mt-auto space-y-2">
        {top.map((o) => {
          const p = pct(o.votes, poll.totalVotes)
          const color = BAR_COLORS[poll.options.findIndex((x) => x.id === o.id) % BAR_COLORS.length]
          return (
            <div key={o.id} className="relative overflow-hidden rounded-lg border-2 border-ink/15 bg-paper">
              <div className={`absolute inset-y-0 left-0 ${color} opacity-70`} style={{ width: `${p}%` }} />
              <div className="relative flex justify-between px-3 py-1.5 text-sm">
                <span className="truncate pr-2 font-medium">{o.label}</span>
                <span className="font-semibold tabular-nums">{p}%</span>
              </div>
            </div>
          )
        })}
      </div>
      <span className="flex items-center gap-1 text-sm font-bold text-tomato">
        Vote now
        <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  )
}
