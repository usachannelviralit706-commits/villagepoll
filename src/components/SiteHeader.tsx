import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-tomato shadow-[2px_2px_0_0_var(--color-ink)] transition group-hover:-rotate-6">
        <span className="flex items-end gap-[3px]">
          <span className="block h-2 w-1.5 rounded-sm bg-white" />
          <span className="block h-4 w-1.5 rounded-sm bg-white" />
          <span className="block h-3 w-1.5 rounded-sm bg-white" />
        </span>
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">
        PollPop
      </span>
    </Link>
  )
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-5 text-sm font-semibold">
          <Link
            to="/"
            hash="polls"
            className="hidden sm:inline hover:text-tomato"
          >
            Browse polls
          </Link>
          <Link to="/create" className="btn bg-sun py-2 text-sm">
            <Plus size={16} strokeWidth={3} /> Create a poll
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold">PollPop</p>
          <p className="text-sm text-paper/60">
            Free online polls. Ask anything, share the link, watch the votes
            roll in.
          </p>
        </div>
        <p className="text-xs text-paper/50">
          © {new Date().getFullYear()} PollPop · Free to use, supported by ads.
        </p>
      </div>
    </footer>
  )
}
