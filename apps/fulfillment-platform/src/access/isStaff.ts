import type { Access } from 'payload'

export const isStaff: Access = ({ req }) =>
  req.user?.role === 'admin' || req.user?.role === 'staffer'
