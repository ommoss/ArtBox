import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

const addressFields = [
  { name: 'name', type: 'text', required: true } as const,
  { name: 'line1', type: 'text', required: true } as const,
  { name: 'line2', type: 'text' } as const,
  { name: 'city', type: 'text', required: true } as const,
  { name: 'region', type: 'text', required: true } as const,
  { name: 'postalCode', type: 'text', required: true } as const,
  { name: 'country', type: 'text', required: true } as const,
  { name: 'phone', type: 'text' } as const,
]

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'externalOrderId',
    defaultColumns: ['externalOrderId', 'artist', 'status', 'total', 'createdAt'],
    group: 'Fulfillment',
  },
  access: {
    create: isStaff,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'artist',
      type: 'relationship',
      relationTo: 'artists',
      required: true,
      index: true,
    },
    {
      name: 'externalOrderId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: "The artist site's own order ID. Unique per artist, not globally.",
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In production', value: 'in_production' },
        { label: 'Printing', value: 'printing' },
        { label: 'Packing', value: 'packing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'On hold', value: 'on_hold' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      type: 'group',
      name: 'customer',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'shippingAddress',
      fields: addressFields,
    },
    {
      type: 'group',
      name: 'billingAddress',
      fields: addressFields,
    },
    {
      type: 'collapsible',
      label: 'Totals',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'subtotal', type: 'number', required: true },
            { name: 'shipping', type: 'number', required: true, defaultValue: 0 },
            { name: 'tax', type: 'number', required: true, defaultValue: 0 },
            { name: 'total', type: 'number', required: true },
          ],
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'CAD',
          options: [
            { label: 'CAD', value: 'CAD' },
            { label: 'USD', value: 'USD' },
          ],
        },
      ],
    },
    {
      name: 'helcimTransactionId',
      type: 'text',
      admin: {
        description: "Helcim's transaction reference for the artist's payment.",
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
