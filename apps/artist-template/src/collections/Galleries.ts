import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isPublished', 'sortOrder'],
    group: 'Content',
  },
  access: {
    create: isAuthenticated,
    read: ({ req }) =>
      req.user
        ? true
        : { isPublished: { equals: true } },
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'coverImageUrl',
      type: 'text',
      admin: {
        description: 'External cover image URL. Used if no upload is selected.',
      },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
  ],
}
