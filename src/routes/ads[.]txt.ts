import { createFileRoute } from '@tanstack/react-router'

// Serves /ads.txt so ad networks can verify you own this site.
// Uses the same VITE_ADSENSE_CLIENT variable as the ad slots.
export const Route = createFileRoute('/ads.txt')({
  server: {
    handlers: {
      GET: async () => {
        const client = process.env.VITE_ADSENSE_CLIENT ?? ''
        const pub = client.replace(/^ca-/, '')
        const body = pub
          ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
          : '# Set VITE_ADSENSE_CLIENT to publish your ads.txt entry\n'
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})
