import type { PayloadRequest } from 'payload'

// Narrowed to `boolean` so it can be used both as an Access function
// AND as the collection's `admin:` predicate (which is stricter).
export const isAuthenticated = ({ req }: { req: PayloadRequest }): boolean =>
  Boolean(req.user)
