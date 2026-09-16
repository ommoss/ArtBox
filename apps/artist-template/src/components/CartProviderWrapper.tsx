'use client'

import { CartProvider } from '@/lib/cart-context'

export default function CartProviderWrapper({
  children,
  siteKey,
}: {
  children: React.ReactNode
  siteKey?: string
}) {
  return <CartProvider siteKey={siteKey}>{children}</CartProvider>
}
