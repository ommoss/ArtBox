import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const Options: CollectionConfig = {
  slug: 'options',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'optionGroup', 'priceModifierAmount', 'isActive'],
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
      name: 'optionGroup',
      type: 'relationship',
      relationTo: 'option-groups',
      required: true,
      index: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Customer-facing label (e.g. "Walnut")' },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: { description: 'Machine identifier (e.g. "walnut")' },
    },
    {
      name: 'priceModifierAmount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Amount added to base price when this option is selected (CAD).' },
    },
    {
      name: 'swatchColor',
      type: 'text',
      admin: {
        description: 'Hex color (e.g. #4a3520) for swatch-input groups. Optional.',
      },
    },
    {
      name: 'previewImage',
      type: 'text',
      admin: { description: 'Optional preview image URL (frame mock, edge sample, etc.)' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'widthIn',
          type: 'number',
          admin: { description: 'Physical width in inches (size options only).' },
        },
        {
          name: 'heightIn',
          type: 'number',
          admin: { description: 'Physical height in inches (size options only).' },
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
