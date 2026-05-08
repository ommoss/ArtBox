import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  transpilePackages: ['@artbox/ui', '@artbox/types'],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
