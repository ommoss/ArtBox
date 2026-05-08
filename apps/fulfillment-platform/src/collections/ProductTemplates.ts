import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const ProductTemplates: CollectionConfig = {
  slug: 'product-templates',
  labels: { singular: 'Product Template', plural: 'Product Templates' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'basePrice', 'isActive'],
    group: 'Catalog',
  },
  access: {
    create: isAdmin,
    read: isStaff,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Stable identifier (e.g. "framed-print")' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Paper print', value: 'paper_print' },
        { label: 'Framed', value: 'framed' },
        { label: 'Canvas', value: 'canvas' },
        { label: 'Block-mount', value: 'block_mount' },
        { label: 'Card', value: 'art_card' },
        { label: 'Poster', value: 'poster' },
        { label: 'Sticker', value: 'sticker' },
        { label: 'Calendar', value: 'calendar' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description:
          'Starting price (CAD) before any options are applied. Often 0; size options carry the size-driven price.',
      },
    },
    {
      name: 'baseProductionSku',
      type: 'relationship',
      relationTo: 'production-catalog',
      admin: {
        description:
          'The closest matching ProductionCatalog SKU. Used as a starting hint for fulfillment routing.',
      },
    },
    {
      name: 'thumbnailImage',
      type: 'text',
      admin: { description: 'Optional preview image URL for the template card.' },
    },
    {
      name: 'configuration',
      type: 'array',
      labels: { singular: 'Option group binding', plural: 'Option group bindings' },
      admin: {
        description:
          'Which option groups this template exposes, in display order. Each binding picks a subset of allowed options.',
      },
      fields: [
        {
          name: 'optionGroup',
          type: 'relationship',
          relationTo: 'option-groups',
          required: true,
        },
        {
          name: 'allowedOptions',
          type: 'relationship',
          relationTo: 'options',
          hasMany: true,
          required: true,
          admin: {
            description: 'Subset of the option group available for this template.',
          },
        },
        {
          name: 'isRequired',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
