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
  indexes: [{ fields: ['site', 'slug'], unique: true }],
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      // Which site this row belongs to when one deployment serves several
      // (MULTI_SITE): a preset name such as 'wildlife'. Single-artist
      // deployments leave it empty and nothing filters on it.
      name: 'site',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Multi-site deployments only. Preset name this gallery belongs to.' },
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
    {
      name: 'mapImageUrl',
      type: 'text',
      admin: {
        description:
          'Optional AI-generated antique map image, used as the travel route backdrop. Falls back to the drawn coastline map when empty.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lat',
          type: 'number',
          admin: { description: 'Latitude. Used by the travel theme to place this gallery on the globe.' },
        },
        {
          name: 'lng',
          type: 'number',
          admin: { description: 'Longitude. Used by the travel theme to place this gallery on the globe.' },
        },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
  ],
}
