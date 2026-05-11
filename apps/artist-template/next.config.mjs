import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@artbox/ui', '@artbox/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Cache optimized variants for 1 day. The artist's gallery doesn't change
    // often, and remote source images (Unsplash, future CDN) are immutable.
    minimumCacheTTL: 86400,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
