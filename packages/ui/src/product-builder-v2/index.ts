export { default as ProductBuilderV2 } from './ProductBuilderV2'
export type {
  BuilderResult,
  BuilderStage,
  RoomBackground,
  SavedBuild,
  SelectionMap,
  V2Option,
  V2OptionExtras,
  V2OptionGroup,
  V2Template,
} from './types'
export type { Renderer, RendererCapability, RendererDescriptor } from './renderers/types'
export { Renderer25D } from './renderers/Renderer25D'
export { Renderer3D } from './renderers/Renderer3D'
export {
  buildBuilderQueryString,
  readBuilderUrlState,
  useInitialBuilderUrlState,
  useSyncBuilderUrl,
  type BuilderUrlState,
} from './use-builder-url-state'
export {
  ALL_FIXTURE_TEMPLATES,
  FIXTURE_IMAGE_URL,
  FIXTURE_IMAGE_TITLE,
  fixtureBlockMount,
  fixtureCanvasWrap,
  fixtureFramedPrint,
  fixtureGreetingCard,
  fixturePaperPrint,
  fixtureSticker,
} from './fixtures'
export { RoomPicker } from './room-preview/RoomPicker'
export { CURATED_ROOMS } from './room-preview/curated-rooms'
export { ComparisonDrawer } from './comparison/ComparisonDrawer'
export { usePinnedBuilds } from './comparison/use-pinned-builds'
export { computeIncludedChips, type IncludedChip } from './lib/included-chips'
