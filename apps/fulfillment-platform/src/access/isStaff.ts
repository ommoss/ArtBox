import type { PayloadRequest } from 'payload'

// Narrowed to `boolean` so it can be used both as an Access function
// (boolean is a valid AccessResult) AND as the collection's `admin:` predicate
// (which expects strictly boolean | Promise<boolean>).
export const isStaff = ({ req }: { req: PayloadRequest }): boolean =>
  req.user?.role === 'admin' || req.user?.role === 'staffer'
