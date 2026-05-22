import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

// Catalog is the artist's site-wide configuration for what they sell:
// which products from the fulfillment catalog they offer, and (per product)
// which sizes. Per-artwork overrides on the Artworks collection take
// precedence over these defaults when set.
//
// Slugs here MUST match the Artbox fulfillment-platform template + option
// slugs. The fulfillment catalog is the source of truth for what's available;
// this global decides what's exposed on the storefront.
export const Catalog: GlobalConfig = {
  slug: 'catalog',
  admin: {
    group: 'Storefront',
    description:
      'Choose which products and sizes appear on artwork pages. Leave a list empty to allow everything.',
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'enabledProducts',
      type: 'select',
      hasMany: true,
      admin: {
        description:
          'Products offered across the site. Leave empty to offer all available products.',
      },
      options: [
        { label: 'Paper print', value: 'paper-print' },
        { label: 'Framed print', value: 'framed-print' },
        { label: 'Canvas wrap', value: 'canvas-wrap' },
        { label: 'Block mount', value: 'block-mount' },
        { label: 'Greeting card', value: 'greeting-card' },
        { label: 'Sticker', value: 'sticker' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Pricing',
      admin: {
        description:
          'How much to charge customers on top of the Artbox fulfillment cost.',
      },
      fields: [
        {
          name: 'pricingMode',
          type: 'radio',
          defaultValue: 'percent',
          options: [
            { label: 'Percentage markup', value: 'percent' },
            { label: 'Flat amount markup', value: 'amount' },
          ],
        },
        {
          name: 'defaultMarkup',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description:
              'Percent (e.g. 50 = 50%) or flat dollar amount, depending on the pricing mode above.',
          },
        },
      ],
    },
    {
      name: 'sizeRestrictions',
      type: 'array',
      label: 'Size restrictions',
      admin: {
        description:
          'Optional. For each product, restrict to specific sizes. Products not listed here offer all their sizes.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'productSlug',
          type: 'select',
          required: true,
          options: [
            { label: 'Canvas wrap', value: 'canvas-wrap' },
            { label: 'Framed print', value: 'framed-print' },
            { label: 'Flat print', value: 'flat-print' },
            { label: 'Block mount', value: 'block-mount' },
            { label: 'Card', value: 'card' },
          ],
        },
        {
          name: 'enabledSizes',
          type: 'text',
          hasMany: true,
          admin: {
            description:
              'Size values like "16x20", "20x30". Match exactly what the fulfillment catalog uses.',
          },
        },
      ],
    },
  ],
}
