import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const Artists: CollectionConfig = {
  slug: 'artists',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'contactEmail'],
    group: 'Platform',
  },
  access: {
    create: isAdmin,
    read: isStaff,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Lowercase identifier used in URLs and config (e.g. "rick-tomlinson")',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Public domain for this artist site (e.g. ricktomlinson.com)',
      },
    },
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        { name: 'contactName', type: 'text' },
        { name: 'contactEmail', type: 'email' },
        { name: 'contactPhone', type: 'text' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Helcim',
      fields: [
        {
          name: 'helcimMerchantId',
          type: 'text',
          admin: { description: 'Artist-owned Helcim merchant account ID' },
        },
        {
          name: 'helcimApiKeyHint',
          type: 'text',
          admin: {
            description:
              'Last 4 chars of the artist-side Helcim API token, for reference. The full token lives in the artist site env.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Platform API access',
      fields: [
        {
          name: 'apiKey',
          type: 'text',
          unique: true,
          index: true,
          admin: {
            readOnly: true,
            description:
              'Used by the artist site to authenticate order POSTs to the fulfillment platform. Auto-generated.',
          },
          hooks: {
            beforeChange: [
              ({ value, operation }) => {
                if (operation === 'create' && !value) {
                  return `ak_${crypto.randomBytes(24).toString('hex')}`
                }
                return value
              },
            ],
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
