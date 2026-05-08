import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Site' },
  access: {
    create: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 480, position: 'centre' },
      { name: 'card', width: 960 },
      { name: 'full', width: 2400 },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
