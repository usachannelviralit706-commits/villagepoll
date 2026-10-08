import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { pollOptions, polls, votes } from '../../db/schema.js'
import { STARTER_POLLS } from './starter-polls'
import { CATEGORIES, type Poll } from '@/lib/polls'

export type { Poll, PollOption } from '@/lib/polls'

const VOTER_COOKIE = 'pv_voter'

function newId(length = 8) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function getVoterId(create: boolean) {
  let voterId = getCookie(VOTER_COOKIE)
  if (!voterId && create) {
    voterId = crypto.randomUUID()
    setCookie(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return voterId
}

async function ensureStarterPolls() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(polls)
  if (count > 0) return
  for (const p of STARTER_POLLS) {
    const inserted = await db
      .insert(polls)
      .values({
        id: p.id,
        question: p.question,
        description: p.description,
        category: p.category,
        totalVotes: p.options.reduce((s, o) => s + o.votes, 0),
      })
      .onConflictDoNothing()
      .returning({ id: polls.id })
    if (inserted.length === 0) continue
    await db.insert(pollOptions).values(
      p.options.map((o, i) => ({
        pollId: p.id,
        label: o.label,
        votes: o.votes,
        position: i,
      })),
    )
  }
}

async function attachOptions(
  rows: (typeof polls.$inferSelect)[],
): Promise<Poll[]> {
  if (rows.length === 0) return []
  const opts = await db
    .select()
    .from(pollOptions)
    .where(
      inArray(
        pollOptions.pollId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(pollOptions.position))
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    description: r.description,
    category: r.category,
    totalVotes: r.totalVotes,
    views: r.views,
    createdAt: r.createdAt.toISOString(),
    options: opts
      .filter((o) => o.pollId === r.id)
      .map((o) => ({ id: o.id, label: o.label, votes: o.votes })),
  }))
}

export const listPolls = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { sort?: 'trending' | 'new'; category?: string; limit?: number }) =>
      data,
  )
  .handler(async ({ data }) => {
    await ensureStarterPolls()
    const limit = Math.min(Math.max(data.limit ?? 24, 1), 60)
    const where =
      data.category && data.category !== 'All'
        ? eq(polls.category, data.category)
        : undefined
    const rows = await db
      .select()
      .from(polls)
      .where(where)
      .orderBy(
        data.sort === 'new' ? desc(polls.createdAt) : desc(polls.totalVotes),
        desc(polls.createdAt),
      )
      .limit(limit)
    return attachOptions(rows)
  })

export const getPoll = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string; countView?: boolean }) => data)
  .handler(async ({ data }) => {
    const [row] =
      data.countView === false
        ? await db.select().from(polls).where(eq(polls.id, data.id))
        : await db
            .update(polls)
            .set({ views: sql`${polls.views} + 1` })
            .where(eq(polls.id, data.id))
            .returning()
    if (!row) return { poll: null, votedOptionId: null }
    const [poll] = await attachOptions([row])
    const voterId = getVoterId(false)
    let votedOptionId: number | null = null
    if (voterId) {
      const [v] = await db
        .select({ optionId: votes.optionId })
        .from(votes)
        .where(and(eq(votes.pollId, data.id), eq(votes.voterId, voterId)))
      votedOptionId = v?.optionId ?? null
    }
    return { poll, votedOptionId }
  })

export const createPoll = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      question: string
      description?: string
      category?: string
      options: string[]
    }) => {
      const question = String(data.question ?? '').trim().slice(0, 200)
      const description = String(data.description ?? '').trim().slice(0, 500)
      const category = (CATEGORIES as readonly string[]).includes(
        data.category ?? '',
      )
        ? (data.category as string)
        : 'General'
      const options = Array.from(
        new Set(
          (data.options ?? [])
            .map((o) => String(o).trim().slice(0, 100))
            .filter(Boolean),
        ),
      ).slice(0, 10)
      if (question.length < 3) throw new Error('Please write a question.')
      if (options.length < 2)
        throw new Error('Add at least two different answer options.')
      return { question, description, category, options }
    },
  )
  .handler(async ({ data }) => {
    const id = newId()
    await db.insert(polls).values({
      id,
      question: data.question,
      description: data.description,
      category: data.category,
    })
    await db.insert(pollOptions).values(
      data.options.map((label, i) => ({ pollId: id, label, position: i })),
    )
    return { id }
  })

export const castVote = createServerFn({ method: 'POST' })
  .inputValidator((data: { pollId: string; optionId: number }) => ({
    pollId: String(data.pollId),
    optionId: Number(data.optionId),
  }))
  .handler(async ({ data }) => {
    const [option] = await db
      .select({ id: pollOptions.id })
      .from(pollOptions)
      .where(
        and(
          eq(pollOptions.id, data.optionId),
          eq(pollOptions.pollId, data.pollId),
        ),
      )
    if (!option) throw new Error('That option does not exist.')

    const voterId = getVoterId(true)!
    const inserted = await db
      .insert(votes)
      .values({ pollId: data.pollId, optionId: data.optionId, voterId })
      .onConflictDoNothing()
      .returning({ id: votes.id })

    if (inserted.length > 0) {
      await db
        .update(pollOptions)
        .set({ votes: sql`${pollOptions.votes} + 1` })
        .where(eq(pollOptions.id, data.optionId))
      await db
        .update(polls)
        .set({ totalVotes: sql`${polls.totalVotes} + 1` })
        .where(eq(polls.id, data.pollId))
    }

    const [row] = await db.select().from(polls).where(eq(polls.id, data.pollId))
    const [poll] = await attachOptions([row])
    const [v] = await db
      .select({ optionId: votes.optionId })
      .from(votes)
      .where(and(eq(votes.pollId, data.pollId), eq(votes.voterId, voterId)))
    return {
      poll,
      votedOptionId: v?.optionId ?? data.optionId,
      alreadyVoted: inserted.length === 0,
    }
  })
