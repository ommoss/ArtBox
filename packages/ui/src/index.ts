export { default as ProductBuilder } from './ProductBuilder'
export * from './product-builder-v2'
// V3 — re-exports only the ProductBuilderV3 component to avoid name
// collisions with V2's exports (Renderer3D, RoomPicker, etc. exist in both).
// For deeper V3 access, import from '@artbox/ui/src/product-builder-v3/...'.
export { ProductBuilderV3 } from './product-builder-v3'
