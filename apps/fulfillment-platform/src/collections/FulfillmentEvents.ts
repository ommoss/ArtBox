import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const FulfillmentEvents: CollectionConfig = {
  slug: 'fulfillment-events',
  labels: {
    singular: 'Fulfillment Event',
    plural: 'Fulfillment Events',
  },
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['order', 'type', 'message', 'createdAt'],
    group: 'Fulfillment',
  },
  access: {
    create: isStaff,
    read: isStaff,
    update: isAdmin,
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
      name: 'orderLine',
      type: 'relationship',
      relationTo: 'order-lines',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'note',
      options: [
        { label: 'Status change', value: 'status_change' },
        { label: 'Note', value: 'note' },
        { label: 'Issue', value: 'issue' },
        { label: 'Customer contact', value: 'customer_contact' },
        { label: 'Shipment', value: 'shipment' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Optional structured payload (status diff, tracking info, etc.)' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
  ],
}
