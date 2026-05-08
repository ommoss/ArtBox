import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const OrderLines: CollectionConfig = {
  slug: 'order-lines',
  admin: {
    useAsTitle: 'artistProductName',
    defaultColumns: ['order', 'productionItem', 'quantity', 'status'],
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
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'productionItem',
      type: 'relationship',
      relationTo: 'production-catalog',
      admin: {
        description:
          'Closest Artbox production SKU. Optional when a template + configuration uniquely describes the work.',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'product-templates',
      admin: {
        description: 'The product template the customer configured.',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description:
          'Snapshot of the customer\'s template configuration (selected options, labels, prices) at order time.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'artistProductRef',
          type: 'text',
          admin: { description: "Artist site's own product identifier" },
        },
        {
          name: 'artistProductName',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'High-resolution master image URL the artist site provides for printing.',
      },
    },
    {
      name: 'imageNotes',
      type: 'textarea',
      admin: { description: 'Cropping, color, or special handling notes' },
    },
    {
      type: 'row',
      fields: [
        { name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
        { name: 'lineSubtotal', type: 'number', required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In production', value: 'in_production' },
        { label: 'Ready', value: 'ready' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Issue', value: 'issue' },
      ],
    },
    {
      name: 'shipmentTracking',
      type: 'text',
    },
    {
      name: 'shipmentCarrier',
      type: 'text',
    },
  ],
}
