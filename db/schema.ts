import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const polls = pgTable(
  'polls',
  {
    id: text().primaryKey(),
    question: text().notNull(),
    description: text().notNull().default(''),
    category: text().notNull().default('General'),
    totalVotes: integer('total_votes').notNull().default(0),
    views: integer().notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('polls_created_at_idx').on(t.createdAt),
    index('polls_total_votes_idx').on(t.totalVotes),
  ],
)

export const pollOptions = pgTable(
  'poll_options',
  {
    id: serial().primaryKey(),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    position: integer().notNull().default(0),
    votes: integer().notNull().default(0),
  },
  (t) => [index('poll_options_poll_id_idx').on(t.pollId)],
)

export const votes = pgTable(
  'votes',
  {
    id: serial().primaryKey(),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    optionId: integer('option_id')
      .notNull()
      .references(() => pollOptions.id, { onDelete: 'cascade' }),
    voterId: text('voter_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('votes_poll_voter_idx').on(t.pollId, t.voterId)],
)
