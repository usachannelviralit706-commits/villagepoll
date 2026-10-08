import { useEffect, useRef } from 'react'
import { AD_SLOTS, ADSENSE_CLIENT, type AdPlacement } from '@/lib/ads'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const SIZES: Record<AdPlacement, { label: string; className: string }> = {
  leaderboard: { label: '728 × 90', className: 'min-h-[90px]' },
  inFeed: { label: 'In-feed', className: 'min-h-[250px]' },
  sidebar: { label: '300 × 600', className: 'min-h-[600px]' },
  results: { label: '336 × 280', className: 'min-h-[280px]' },
}

export default function AdSlot({
  placement,
  className = '',
}: {
  placement: AdPlacement
  className?: string
}) {
  const ref = useRef<HTMLModElement>(null)
  const size = SIZES[placement]

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ref.current) return
    if (ref.current.getAttribute('data-adsbygoogle-status')) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Ad blockers or a not-yet-approved account can throw here; ignore.
    }
  }, [])

  return (
    <aside
      aria-label="Advertisement"
      className={`relative w-full ${className}`}
    >
      <span className="absolute -top-2.5 left-3 z-10 bg-paper px-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/50">
        Advertisement
      </span>
      {ADSENSE_CLIENT ? (
        <ins
          ref={ref}
          className={`adsbygoogle block w-full ${size.className}`}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={AD_SLOTS[placement] || undefined}
          data-ad-format={placement === 'inFeed' ? 'fluid' : 'auto'}
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className={`flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-white/60 text-sm text-ink/40 ${size.className}`}
        >
          Ad space · {size.label}
        </div>
      )}
    </aside>
  )
}
