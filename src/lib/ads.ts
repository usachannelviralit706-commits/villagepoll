// Google AdSense configuration. Set these as environment variables in the
// Netlify UI (Project configuration → Environment variables) and redeploy.
//   VITE_ADSENSE_CLIENT  – your publisher id, e.g. "ca-pub-1234567890123456"
//   VITE_ADSENSE_SLOT_*  – optional ad unit ids for each placement
// Until VITE_ADSENSE_CLIENT is set, ad slots render as labelled placeholders.
export const ADSENSE_CLIENT: string = import.meta.env.VITE_ADSENSE_CLIENT ?? ''

export const AD_SLOTS = {
  leaderboard: import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD ?? '',
  inFeed: import.meta.env.VITE_ADSENSE_SLOT_INFEED ?? '',
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR ?? '',
  results: import.meta.env.VITE_ADSENSE_SLOT_RESULTS ?? '',
} as const

export type AdPlacement = keyof typeof AD_SLOTS
