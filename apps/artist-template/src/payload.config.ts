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
    push: true,
  }),
  sharp,
  onInit: async (payload) => {
    await seedDemoContent(payload)
  },
})
