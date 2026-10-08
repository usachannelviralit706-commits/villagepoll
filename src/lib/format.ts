export const BAR_COLORS = [
  'bg-tomato',
  'bg-sky',
  'bg-sun',
  'bg-mint',
  'bg-lilac',
  'bg-tomato/60',
  'bg-sky/60',
  'bg-sun/60',
  'bg-mint/60',
  'bg-lilac/60',
]

export function pct(votes: number, total: number) {
  return total > 0 ? Math.round((votes / total) * 100) : 0
}

export function compact(n: number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(n)
}

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  const units: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [604800, 'w'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ]
  for (const [sec, label] of units) {
    if (s >= sec) return `${Math.floor(s / sec)}${label} ago`
  }
  return 'just now'
}
