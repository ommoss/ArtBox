export { default as ProductBuilder } from './ProductBuilder'
// V3 — re-exports only the ProductBuilderV3 component plus the fixture data
// the marketing home and dev sandbox mount it with. For deeper V3 access,
// import from '@artbox/ui/src/product-builder-v3/...'.
export {
  ALL_FIXTURE_TEMPLATES,
  FIXTURE_IMAGE_TITLE,
  FIXTURE_IMAGE_URL,
  ProductBuilderV3,
} from './product-builder-v3'
export type { V2Template } from './product-builder-v3'
