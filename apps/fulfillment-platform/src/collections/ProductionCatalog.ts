import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const ProductionCatalog: CollectionConfig = {
  slug: 'production-catalog',
  labels: {
    singular: 'Production Item',
    plural: 'Production Catalog',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['sku', 'name', 'category', 'baseCost', 'isActive'],
    group: 'Catalog',
  },
  access: {
    create: isAdmin,
    read: isStaff,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable identifier referenced by artist sites (e.g. "PRT-FA-16x20")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Paper print (giclée)', value: 'paper_print' },
        { label: 'Canvas', value: 'canvas' },
        { label: 'Framed', value: 'framed' },
        { label: 'Block-mount', value: 'block_mount' },
        { label: 'Art card', value: 'art_card' },
        { label: 'Sticker', value: 'sticker' },
        { label: 'Poster', value: 'poster' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'widthIn', type: 'number', label: 'Width (in)' },
        { name: 'heightIn', type: 'number', label: 'Height (in)' },
      ],
    },
    {
      name: 'material',
      type: 'text',
      admin: {
        description: 'Paper / canvas / frame stock (e.g. "Hahnemühle Photo Rag", "Walnut wood frame")',
      },
    },
    {
      name: 'finish',
      type: 'text',
      admin: { description: 'Optional finish notes (matte, gloss, satin, etc.)' },
    },
    {
      name: 'baseCost',
      type: 'number',
      required: true,
      admin: {
        description: "Artbox's internal production cost in CAD. Excludes shipping.",
      },
    },
    {
      name: 'leadTimeDays',
      type: 'number',
      defaultValue: 5,
      admin: { description: 'Typical days from order receipt to ready-to-ship' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
