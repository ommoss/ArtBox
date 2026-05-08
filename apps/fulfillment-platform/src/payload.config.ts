import { postgresAdapter } from '@payloadcms/db-postgres'
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
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        (() => {
          throw new Error(
            'DATABASE_URI is not set. Provide a Postgres connection string (e.g. from Neon) in apps/fulfillment-platform/.env',
          )
        })(),
    },
    push: true,
  }),
  sharp,
  onInit: async (payload) => {
    await seedProductionCatalog(payload)
    await seedTemplatesAndOptions(payload)
    await seedDemoArtist(payload)
  },
})
