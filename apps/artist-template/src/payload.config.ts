import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Galleries } from './collections/Galleries'
import { Artworks } from './collections/Artworks'
import { seedDemoContent } from './seed/demo-content'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: '— Artist Site' },
  },
  collections: [Users, Media, Galleries, Artworks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        (() => {
          throw new Error(
            'DATABASE_URI is not set. Provide a Postgres connection string (e.g. from Neon) in apps/artist-template/.env',
          )
        })(),
    },
    // Drizzle `push` syncs schema on every Payload init — fine in dev, but on
    // Vercel it adds 1-3s of overhead to every serverless cold start. Gate it
    // so it only runs locally or when explicitly requested.
    push: process.env.NODE_ENV !== 'production' || process.env.DB_PUSH === 'true',
  }),
  sharp,
  onInit: async (payload) => {
    // The demo seed force-updates ~20 rows on every cold start. That's ~40
    // round-trips to Neon and is the main source of slow first-paint on Vercel.
    // Default off in production; set SEED_ON_INIT=true to re-seed on next boot.
    if (process.env.NODE_ENV !== 'production' || process.env.SEED_ON_INIT === 'true') {
      await seedDemoContent(payload)
    }
  },
})
