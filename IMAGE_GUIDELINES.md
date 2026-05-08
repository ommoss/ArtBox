# Option preview image guidelines

The product builder ships with CSS-only textures (wood grain, mat noise, glass
shimmer, canvas weave, block-mount depth) so it works out of the box. When
you're ready to upgrade the realism with actual photographs of Artbox samples,
upload them to the `previewImage` field on each option in
**Catalog → Options** in the fulfillment platform admin.

When `previewImage` is set on an option, the builder uses it as a `cover`-fit
background for that material; when empty, the CSS texture takes over. So you
can do these one option at a time without breaking anything.

## What to capture, per option type

### Frame colours (Walnut, Oak, Maple, Black painted, White painted)

A **flat-on, evenly lit photograph of the wood-frame face**. Crop tight to
the wood — no mat, no print, no background.

- **Aspect ratio:** square (1:1)
- **Resolution:** ≥ 1200×1200 px (the builder may render up to ~360 px tall,
  retina screens benefit from headroom)
- **Format:** WebP preferred, JPEG fine. Skip PNG — no transparency needed.
- **File size target:** < 80 KB
- **Lighting:** soft, indirect, no specular highlights from glass or finish
- **Wood grain orientation:** vertical when shooting (grain will run top-to-
  bottom in the rendered frame, matching how real frames are constructed)

Tip: photograph all five frame colours in the same session, same lighting,
same camera distance. Crops should be visually interchangeable so they read
as a set.

### Mat options (None, 2″ white, 4″ white, 2″ black)

The "None" option needs no image (no mat = no preview). For the others:

- **What to capture:** flat scan or photograph of an actual mat board face
- **Aspect ratio:** square (1:1)
- **Resolution:** ≥ 800×800 px
- **Format:** WebP preferred
- **File size:** < 50 KB
- **Lighting/scan:** even, no shadows, no fingerprints visible

The texture is subtle and the builder applies the image as a tiled
background, so even a small high-quality patch (~4″×4″ photographed at 600
DPI) is plenty.

### Block-mount edges (Natural wood, White, Black)

A **side-on photograph of the block edge** showing the cut wood profile.

- **Aspect ratio:** wide rectangle (4:1 or wider) — the builder uses this as
  a thin border-strip
- **Resolution:** ≥ 1600×400 px
- **Format:** WebP preferred
- **File size:** < 80 KB

If you photograph the block at an angle that shows the edge plus a slice of
the front face, crop to just the edge before uploading.

### Sizes, finishes, glass types

These options don't have visual textures — leave `previewImage` empty.

## Hosting the files

Two options:

1. **Upload to a CDN** (Cloudinary, Bunny.net, S3, even Vercel Blob) and
   paste the public URL into the `previewImage` text field.
2. **Use Payload's Media collection** — currently the artist-template app has
   a Media collection ready, but the fulfillment-platform app's Options
   collection uses a plain text URL field. If we want first-class uploads
   on the Artbox side, we'd add a Media collection to fulfillment-platform
   and switch `previewImage` to an `upload` field. ~1 hour of work; ask when
   you're ready.

## Quality control

- Run a side-by-side comparison after each upload: load `/builder/framed-print`
  and toggle between the new image and the CSS fallback by clearing the
  `previewImage` field. The transition should feel like a quality upgrade,
  not a different product.
- If the photograph clashes with the on-screen `swatchColor` (e.g. you
  uploaded a darker walnut than the swatch), update `swatchColor` to match
  so option pickers and previews stay consistent.
- Mobile preview matters most — most customer browsing is on phones. Test
  any new image at 375 px width.

## What not to do

- Don't photograph framed prints in situ (with images inside) — the builder
  renders the customer's own image inside the frame; including a sample
  print in your photo would create a double-image.
- Don't bake shadows or vignettes into the source image — the builder adds
  shadows in CSS based on the selected size.
- Don't upload a transparent PNG for the wood — solid backgrounds are
  expected; the builder layers things in z-order.
