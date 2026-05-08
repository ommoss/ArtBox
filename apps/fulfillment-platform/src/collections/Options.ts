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
      admin: {
        description:
          "Optional photographic texture. Frame colours: square wood-grain photo (≥1200×1200px). Mat options: square mat-board scan (≥800×800px). Block edges: wide edge strip (≥1600×400px, 4:1+ aspect). Leave empty to use the CSS-generated texture. Full guidelines: see IMAGE_GUIDELINES.md in the repo root.",
      },
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
