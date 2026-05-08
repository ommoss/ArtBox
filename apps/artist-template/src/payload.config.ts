import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { createRequire } from 'module'
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
  db: (() => {
    const uri = process.env.DATABASE_URI || ''
    if (uri.startsWith('postgres')) {
      return postgresAdapter({
        pool: { connectionString: uri },
        push: true,
      })
    }
    // Local dev only. Loaded via createRequire so Next.js does not trace
    // libsql into the production serverless bundle.
    const requireFn = createRequire(import.meta.url)
    const { sqliteAdapter } = requireFn('@payloadcms/db-sqlite') as typeof import('@payloadcms/db-sqlite')
    return sqliteAdapter({
      client: {
        url: uri || `file:${path.resolve(dirname, '../data/artist.db')}`,
      },
    })
  })(),
  sharp,
  onInit: async (payload) => {
    await seedDemoContent(payload)
  },
})
