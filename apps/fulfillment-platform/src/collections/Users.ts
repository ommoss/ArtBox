import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: 'Platform',
  },
  access: {
    create: isAdmin,
    read: isStaff,
    update: ({ req, id }) =>
      req.user?.role === 'admin' || req.user?.id === id,
    delete: isAdmin,
    admin: isStaff,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation !== 'create') return data
        const count = await req.payload.count({ collection: 'users' })
        if (count.totalDocs === 0) {
          return { ...data, role: 'admin' }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staffer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staffer', value: 'staffer' },
      ],
      access: {
        update: isAdminField,
      },
    },
  ],
}
