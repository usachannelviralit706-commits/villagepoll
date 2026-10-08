import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2, Plus, X } from 'lucide-react'
import AdSlot from '@/components/AdSlot'
import { createPoll } from '@/server/polls.functions'
import { CATEGORIES } from '@/lib/polls'

export const Route = createFileRoute('/create')({
  head: () => ({ meta: [{ title: 'Create a free poll — PollPop' }] }),
  component: CreatePoll,
})

const MAX_OPTIONS = 10

function CreatePoll() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('General')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const filled = options.map((o) => o.trim()).filter(Boolean)

  const updateOption = (i: number, v: string) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? v : o)))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (question.trim().length < 3) return setError('Please write a question.')
    if (new Set(filled).size < 2)
      return setError('Add at least two different answer options.')
    setSaving(true)
    try {
      const { id } = await createPoll({
        data: { question, description, category, options: filled },
      })
      navigate({ to: '/p/$pollId', params: { pollId: id }, search: { created: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_300px]">
      <div className="rise">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          Create a poll
        </h1>
        <p className="mt-2 text-lg text-ink/60">
          Ask your question, add the choices, and share the link.
        </p>

        <form onSubmit={onSubmit} className="card mt-8 space-y-6 p-6 sm:p-8">
          <div>
            <label htmlFor="q" className="mb-2 block font-semibold">
              Your question
            </label>
            <input
              id="q"
              className="input font-display text-xl font-bold"
              placeholder="e.g. What should we have for dinner?"
              value={question}
              maxLength={200}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="d" className="mb-2 block font-semibold">
              Description <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <textarea
              id="d"
              rows={2}
              className="input resize-none"
              placeholder="Add a little context for voters"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="mb-2 font-semibold">Answer options</legend>
            <div className="space-y-3">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-paper font-display font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    className="input py-2.5"
                    placeholder={`Option ${i + 1}`}
                    value={o}
                    maxLength={100}
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      aria-label="Remove option"
                      onClick={() => setOptions((p) => p.filter((_, j) => j !== i))}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-transparent text-ink/50 hover:border-ink hover:text-ink"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={() => setOptions((p) => [...p, ''])}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-tomato hover:underline"
              >
                <Plus size={16} strokeWidth={3} /> Add option
              </button>
            )}
          </fieldset>

          <div>
            <p className="mb-2 font-semibold">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border-2 border-ink px-3.5 py-1 text-sm font-semibold transition ${
                    category === c ? 'bg-sun' : 'bg-white hover:bg-paper'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border-2 border-tomato bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn w-full bg-tomato py-3.5 text-lg text-white">
            {saving ? <Loader2 className="animate-spin" size={20} /> : null}
            {saving ? 'Publishing…' : 'Publish poll'}
          </button>
        </form>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="card bg-mint p-5">
            <p className="font-display text-lg font-bold">Tips for more votes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Keep the question short and punchy.</li>
              <li>2–4 options get the most votes.</li>
              <li>Share it on WhatsApp, X and Facebook.</li>
            </ul>
          </div>
          <AdSlot placement="sidebar" />
        </div>
      </div>
    </div>
  )
}
