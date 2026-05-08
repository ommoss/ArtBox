import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'gallery', 'year', 'isPublished'],
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
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      required: true,
      index: true,
    },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'year', type: 'number' },
        { name: 'location', type: 'text' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'External image URL. Used if no upload is selected.',
      },
    },
    {
      type: 'collapsible',
      label: 'Limited edition',
      fields: [
        { name: 'isLimitedEdition', type: 'checkbox', defaultValue: false },
        { name: 'editionSize', type: 'number' },
        { name: 'editionsRemaining', type: 'number' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
  ],
}
