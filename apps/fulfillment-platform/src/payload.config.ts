import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Artists } from './collections/Artists'
import { ProductionCatalog } from './collections/ProductionCatalog'
import { OptionGroups } from './collections/OptionGroups'
import { Options } from './collections/Options'
import { ProductTemplates } from './collections/ProductTemplates'
import { Orders } from './collections/Orders'
import { OrderLines } from './collections/OrderLines'
import { FulfillmentEvents } from './collections/FulfillmentEvents'
import { seedDemoArtist } from './seed/demo-artist'
import { seedProductionCatalog } from './seed/production-catalog'
import { seedTemplatesAndOptions } from './seed/templates-and-options'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Artbox Fulfillment',
    },
  },
  collections: [
    Users,
    Artists,
    ProductionCatalog,
    OptionGroups,
    Options,
    ProductTemplates,
    Orders,
    OrderLines,
    FulfillmentEvents,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: (() => {
    const uri = process.env.DATABASE_URI || ''
    const useSqlite = !uri || uri.startsWith('file:')
    if (useSqlite) {
      return sqliteAdapter({
        client: {
          url: uri || `file:${path.resolve(dirname, '../data/fulfillment.db')}`,
        },
      })
    }
    return postgresAdapter({
      pool: { connectionString: uri },
      push: true,
    })
  })(),
  sharp,
  onInit: async (payload) => {
    await seedProductionCatalog(payload)
    await seedTemplatesAndOptions(payload)
    await seedDemoArtist(payload)
  },
})
