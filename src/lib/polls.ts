// Shared, client-safe poll types and constants.
export const CATEGORIES = [
  'General',
  'Sports',
  'Entertainment',
  'Tech',
  'Food',
  'Politics',
  'Lifestyle',
  'Gaming',
] as const

export type PollOption = { id: number; label: string; votes: number }
export type Poll = {
  id: string
  question: string
  description: string
  category: string
  totalVotes: number
  views: number
  createdAt: string
  options: PollOption[]
}
