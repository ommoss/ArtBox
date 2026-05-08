export type OrderStatus =
  | 'new'
  | 'in_production'
  | 'printing'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled'
  | 'on_hold'

export type OrderLineStatus =
  | 'new'
  | 'in_production'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'issue'

export type ProductionCategory =
  | 'paper_print'
  | 'canvas'
  | 'framed'
  | 'block_mount'
  | 'art_card'
  | 'sticker'
  | 'poster'
  | 'calendar'

export type FulfillmentEventType =
  | 'status_change'
  | 'note'
  | 'issue'
  | 'customer_contact'
  | 'shipment'
  | 'system'

export type Address = {
  name: string
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  country: string
  phone?: string
}

export type OptionInputType = 'select' | 'swatch' | 'size'

export type PublicOption = {
  id: string | number
  label: string
  value: string
  priceModifierAmount: number
  swatchColor?: string
  previewImage?: string
  widthIn?: number
  heightIn?: number
  sortOrder: number
}

export type PublicOptionGroup = {
  id: string | number
  name: string
  slug: string
  inputType: OptionInputType
  helpText?: string
  isRequired: boolean
  options: PublicOption[]
}

export type PublicProductTemplate = {
  id: string | number
  name: string
  slug: string
  category: ProductionCategory
  description?: string
  basePrice: number
  thumbnailImage?: string
  optionGroups: PublicOptionGroup[]
}

export type BuilderSelection = {
  optionGroupSlug: string
  optionId: string | number
  optionValue: string
  optionLabel: string
  priceModifierAmount: number
}

export type BuilderConfiguration = {
  templateSlug: string
  selections: BuilderSelection[]
  basePrice: number
  unitPrice: number
}

export type IncomingOrderLine = {
  productionSku?: string
  templateSlug?: string
  configuration?: BuilderConfiguration
  artistProductRef: string
  artistProductName: string
  imageUrl: string
  imageNotes?: string
  quantity: number
  lineSubtotal: number
}

export type IncomingOrder = {
  externalOrderId: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  shippingAddress: Address
  billingAddress?: Address
  lines: IncomingOrderLine[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: 'CAD' | 'USD'
  helcimTransactionId?: string
  notes?: string
}
