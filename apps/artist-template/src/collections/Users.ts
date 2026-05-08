import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '../access/isAuthenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Site',
  },
  access: {
    create: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
    admin: isAuthenticated,
  },
  fields: [{ name: 'name', type: 'text' }],
}
