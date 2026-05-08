import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const OptionGroups: CollectionConfig = {
  slug: 'option-groups',
  labels: { singular: 'Option Group', plural: 'Option Groups' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'inputType'],
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
      admin: { description: 'Stable identifier (e.g. "frame-color")' },
    },
    {
      name: 'inputType',
      type: 'select',
      required: true,
      defaultValue: 'select',
      options: [
        { label: 'Dropdown / radio', value: 'select' },
        { label: 'Color swatch', value: 'swatch' },
        { label: 'Size grid', value: 'size' },
      ],
    },
    {
      name: 'helpText',
      type: 'textarea',
      admin: { description: 'Optional context shown to the customer.' },
    },
  ],
}
