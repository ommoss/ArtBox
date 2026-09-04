# V3 product builder review (2026-09-04, read-only)

## State
- V3 = V2 copied + three R3F scenes; 14/17 files byte-identical to V2. V2 still exported from packages/ui/src/index.ts:2, only used by dev/builder-v2.
- three: app pins 0.184 (globe), @artbox/ui resolves 0.169 (fiber 9.6.1 / drei 10.7.7). Two copies installed, no runtime conflict (pnpm isolates), ~1.9 MB unminified if both on one page. Only the travel home renders the globe. @types/three@0.169 vs three@0.184 in the app is a type mismatch.
- three/R3F/drei correctly code-split (React.lazy in Renderer3D.tsx:15-17).
- Embeddable without backend: required props templates + imageUrl; ALL_FIXTURE_TEMPLATES + FIXTURE_IMAGE_URL exported. API only touched server-side in artwork/[slug]/page.tsx; [] on failure gives "No products available".
- Stage flow: 3 steps (Format, Size, Customize), numbered dots; reconcile() pre-selects everything so Continue-disabled never fires.
- Room preview exists in 2.5D only; 3D scenes ignore `room`.
- First load: two text-only fallbacks ("Loading 3D preview…") then layout jump to a 540-680px canvas.
- Theme discipline good in the shell; radii hardcoded 4/6/8/999px (art theme has imageRadius 0).

## High
1. Renderer3D.tsx:39-43: use Renderer25D as the ClientOnly/Suspense fallback instead of text.
2. ProductBuilderV3.tsx:366 / FramedScene.tsx:26: wall picker silently no-ops in 3D; use `using3D && !room ? pickRenderer() : Renderer25D`.
3. FramedScene.tsx:96, CanvasScene.tsx:79, BlockMountScene.tsx:69: `key={cameraZ}` remounts WebGL on every size change; set camera.position.z via useThree effect + updateProjectionMatrix.
4. All three scenes: add `frameloop="demand"`; idle continuous render at 2x DPR on a home page.
5. ProductBuilderV3.tsx:311,341,359: auto-fallback pins user to 2D for the session via sessionStorage; don't persist the auto path, retry on template switch.
6. ProductBuilderV3.tsx:111: syncUrl defaults to useStageFlow, so a home embed rewrites `/` to `/?t=...`; pass syncUrl={false} / default false.
7. FramedScene.tsx:204,157: print flush with frame face, flat mat: recess print+mat to depth/2-0.01, add bevel ring (#fdfcf9), scale matInset from the actual mat option.
8. FramedScene.tsx:104-106 (+ other scenes): flat lighting: add wall plane at z=-depth/2, castShadow/receiveShadow, `shadows` on Canvas, ambient 0.25.

## Medium
9. ProductBuilderV3.tsx:423-441: template tab row duplicates StageFormat in stage mode; gate on !useStageFlow.
10. ProductBuilderV3.tsx:532: price at bottom of controls; sticky bottom price+CTA bar under 768px.
11. FramedScene.tsx:62-66: set texture.anisotropy = max; consider minFilter LinearFilter.
12. Preload 3D chunk on idle after mount; initialTemplateSlug="framed-print" for the marketing embed.
13. fixtures.ts:285: demo image hotlinks Unsplash; use an owned same-origin asset.
14. Radii hardcoded (ProductBuilderV3.tsx:801,881,968,1056; StageFormat.tsx:142; StageSize.tsx:114; StageCustomize.tsx:200): add `--control-radius` token.
15. ComparisonDrawer.tsx:171, Renderer25D.tsx:268,287,811,847: black shadows vanish on dark bg; use TOKENS.imageShadow / light border on dark.
16. apps/artist-template/package.json:41: align three to ^0.184 in packages/ui (fiber 9 / drei 10 support it) so one copy ships.

## Low
17. Remove product-builder-v2 export + folder + dev/builder-v2; rename pbv2-* class prefix optional.
18. fixtures.ts:46: mat group named 'Frame color'; should be 'Mat'.
19. Six inline `<style>` tags per render (StageFormat:37, StageSize:41, StageCustomize:40, RoomPicker:54, ComparisonDrawer:39, ProductBuilderV3:370): hoist to one.
20. ProductBuilderV3.tsx:825-833: .pbv2-preview-frame overflow:auto + min-height 420 gives nested scroll at 24x36; use overflow hidden + MIN_DIM clamp.
