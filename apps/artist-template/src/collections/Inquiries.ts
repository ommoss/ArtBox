import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

// Every submission from the intake form (marketing root) and the contact
// forms (demo + artist sites) lands here first, then gets emailed. Rows are
// created only through the server action in src/lib/inquiry-actions.ts, which
// uses the local API with overrideAccess; the public REST API cannot create.
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'source', 'status', 'createdAt'],
    group: 'Inquiries',
  },
  access: {
    create: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'portfolioUrl', type: 'text', admin: { description: 'Instagram, website or folder link.' } },
    {
      type: 'row',
      fields: [
        {
          name: 'look',
          type: 'select',
          options: ['wildlife', 'lifestyle', 'art', 'travel', 'unsure'],
        },
        {
          name: 'pieces',
          type: 'select',
          options: ['1-10', '10-30', '30-100', '100+'],
          admin: { description: 'How many pieces they want to launch with.' },
        },
        {
          name: 'sellsToday',
          type: 'select',
          options: ['no', 'occasionally', 'under-1k', '1k-3k', 'over-3k'],
          admin: { description: 'Current monthly print sales, self-reported. Maps to a pricing tier.' },
        },
      ],
    },
    {
      name: 'source',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Which form and site this came from, e.g. intake:home or contact:wildlife.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'replied', 'closed'],
      admin: { position: 'sidebar' },
    },
    {
      name: 'emailed',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Notification email went out.' },
    },
    { name: 'userAgent', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  ],
}
