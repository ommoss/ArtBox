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
    {
      type: 'collapsible',
      label: 'Product overrides',
      admin: {
        description:
          'Override the site-wide catalog defaults for this artwork. Leave the checkbox off to inherit.',
      },
      fields: [
        {
          name: 'overrideProducts',
          type: 'checkbox',
          defaultValue: false,
          label: 'Override enabled products for this artwork',
        },
        {
          name: 'enabledProducts',
          type: 'select',
          hasMany: true,
          admin: {
            condition: (data) => Boolean(data?.overrideProducts),
            description:
              'Products offered for this artwork. Leave empty to disable all products.',
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
          name: 'overrideMarkup',
          type: 'checkbox',
          defaultValue: false,
          label: 'Override pricing markup for this artwork',
        },
        {
          name: 'pricingMode',
          type: 'radio',
          defaultValue: 'percent',
          admin: {
            condition: (data) => Boolean(data?.overrideMarkup),
          },
          options: [
            { label: 'Percentage markup', value: 'percent' },
            { label: 'Flat amount markup', value: 'amount' },
          ],
        },
        {
          name: 'markup',
          type: 'number',
          min: 0,
          admin: {
            condition: (data) => Boolean(data?.overrideMarkup),
            description: 'Percent or flat amount, depending on the mode above.',
          },
        },
        {
          name: 'overrideSizes',
          type: 'checkbox',
          defaultValue: false,
          label: 'Override size restrictions for this artwork',
        },
        {
          name: 'sizeRestrictions',
          type: 'array',
          admin: {
            condition: (data) => Boolean(data?.overrideSizes),
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
            },
          ],
        },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
  ],
}
