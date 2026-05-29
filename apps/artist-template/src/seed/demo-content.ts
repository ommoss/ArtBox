import type { Payload } from 'payload'

// Demo content for the artist template.
//
// All imageUrl values here point to web-resolution images (~1200px wide) — this
// mirrors how the real platform works: the artist's site only ever serves the
// smaller "preview" tier. Print-quality masters live on local storage at the
// shop in Victoria, BC and are pulled per-order, not exposed over the web.
//
// Content is theme-aware: the deployment's NEXT_PUBLIC_THEME selects a content
// set so each genre demo shows genre-appropriate work. Sailing (the default)
// has its own set; the other presets fall back to the neutral set until their
// own content is authored. This assumes each demo deployment has its own
// database — otherwise the sets would overwrite each other on boot.
//
// Re-running the seed force-updates existing rows so deployed demos pick up
// new URLs / new artworks on next boot.

type ArtworkSeed = {
  slug: string
  title: string
  galleryslug: string
  description: string
  year?: number
  location?: string
  imageUrl: string
  sortOrder?: number
  isFeatured?: boolean
  isLimitedEdition?: boolean
  editionSize?: number
}

type GallerySeed = {
  slug: string
  name: string
  description: string
  coverImageUrl: string
  sortOrder: number
}

type ContentSet = {
  galleries: GallerySeed[]
  artworks: ArtworkSeed[]
}

// Unsplash query params we use everywhere:
//   w=1200  — artwork detail max usable width on desktop
//   w=900   — gallery cover cards (never displayed wider than ~600px)
//   q=75    — Unsplash's recommended quality for web preview
const COVER_PARAMS = 'auto=format&fit=crop&w=900&q=75'
const ART_PARAMS = 'auto=format&fit=crop&w=1200&q=75'

const u = (id: string, params: string) =>
  `https://images.unsplash.com/photo-${id}?${params}`

// ---------------------------------------------------------------------------
// Neutral set (default for all non-sailing presets until their own content is
// authored): coastal / studio / light / architecture.
// ---------------------------------------------------------------------------

const neutralGalleries: GallerySeed[] = [
  {
    slug: 'coastlines',
    name: 'Coastlines',
    description: 'Long-form work from the Pacific edge.',
    coverImageUrl: u('1507525428034-b723cf961d3e', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'studio',
    name: 'Studio',
    description: 'Still life and quieter work.',
    coverImageUrl: u('1506905925346-21bda4d32df4', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'light',
    name: 'Light',
    description: 'Studies in available and ambient light.',
    coverImageUrl: u('1481349518771-20055b2a7b24', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'architecture',
    name: 'Architecture',
    description: 'Found geometry in built environments.',
    coverImageUrl: u('1486325212027-8081e485255e', COVER_PARAMS),
    sortOrder: 4,
  },
]

const neutralArtworks: ArtworkSeed[] = [
  // Coastlines
  {
    slug: 'morning-fog',
    title: 'Morning fog',
    galleryslug: 'coastlines',
    description: 'Hand-printed from a 6×7 medium format negative.',
    year: 2024,
    location: 'Tofino, BC',
    imageUrl: u('1507525428034-b723cf961d3e', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'low-tide',
    title: 'Low tide',
    galleryslug: 'coastlines',
    description: 'Late afternoon, west coast Vancouver Island.',
    year: 2024,
    location: 'Sombrio Beach, BC',
    imageUrl: u('1506953823976-52e1fdc0149a', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'driftwood-study',
    title: 'Driftwood study',
    galleryslug: 'coastlines',
    description: 'Detail of weathered cedar.',
    year: 2023,
    location: 'Long Beach, BC',
    imageUrl: u('1511497584788-876760111969', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'storm-front',
    title: 'Storm front',
    galleryslug: 'coastlines',
    description: 'Looking west from Cape Scott.',
    year: 2024,
    location: 'Cape Scott, BC',
    imageUrl: u('1500534314209-a25ddb2bd429', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'kelp-line',
    title: 'Kelp line',
    galleryslug: 'coastlines',
    description: 'Bull kelp at low tide.',
    year: 2023,
    location: 'Botanical Beach, BC',
    imageUrl: u('1501949997128-2fdb9f6428f1', ART_PARAMS),
    sortOrder: 5,
  },

  // Studio
  {
    slug: 'still-life-with-lemons',
    title: 'Still life with lemons',
    galleryslug: 'studio',
    description: 'Available as a limited edition of 25.',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1506905925346-21bda4d32df4', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'ceramics-no-3',
    title: 'Ceramics No. 3',
    galleryslug: 'studio',
    description: 'Stoneware vessels, north window.',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1493106819501-66d381c466f1', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'linen-and-stone',
    title: 'Linen and stone',
    galleryslug: 'studio',
    description: 'Composition study, afternoon.',
    year: 2024,
    location: 'Studio',
    imageUrl: u('1513519245088-0e12902e5a38', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'pears',
    title: 'Pears',
    galleryslug: 'studio',
    description: 'A single sitting, late October.',
    year: 2024,
    location: 'Studio',
    imageUrl: u('1568702846914-96b305d2aaeb', ART_PARAMS),
    sortOrder: 4,
  },

  // Light
  {
    slug: 'window-light',
    title: 'Window light',
    galleryslug: 'light',
    description: '',
    year: 2025,
    location: 'Studio',
    imageUrl: u('1481349518771-20055b2a7b24', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'afternoon-corner',
    title: 'Afternoon corner',
    galleryslug: 'light',
    description: 'Hard shadows in a quiet hallway.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1499636136210-6f4ee915583e', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'curtain-study',
    title: 'Curtain study',
    galleryslug: 'light',
    description: 'Linen at 3:40 PM.',
    year: 2023,
    location: 'Studio',
    imageUrl: u('1505691938895-1758d7feb511', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'shadow-stair',
    title: 'Shadow stair',
    galleryslug: 'light',
    description: 'Cast geometry on a south wall.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1493134799591-2c9eed26201a', ART_PARAMS),
    sortOrder: 4,
  },

  // Architecture
  {
    slug: 'concrete-arch',
    title: 'Concrete arch',
    galleryslug: 'architecture',
    description: 'Brutalist civic structure, midday.',
    year: 2024,
    location: 'Vancouver, BC',
    imageUrl: u('1486325212027-8081e485255e', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'roofline',
    title: 'Roofline',
    galleryslug: 'architecture',
    description: 'A pitched roof against thin cloud.',
    year: 2023,
    location: 'Salt Spring Island, BC',
    imageUrl: u('1487958449943-2429e8be8625', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'stairwell',
    title: 'Stairwell',
    galleryslug: 'architecture',
    description: 'Repeating treads, soft daylight.',
    year: 2024,
    location: 'Victoria, BC',
    imageUrl: u('1497366754035-f200968a6e72', ART_PARAMS),
    sortOrder: 3,
  },
]

// ---------------------------------------------------------------------------
// Sailing set (the default preset): marine / regatta / yacht work. Image IDs
// below were each fetched and visually confirmed to be sailing photographs.
// Organized mixed event + vessel-class + editorial, per the research. Six
// pieces are featured (they fill the home carousel); three are limited editions
// (they exercise the edition markers).
// ---------------------------------------------------------------------------

const sailingGalleries: GallerySeed[] = [
  {
    slug: 'regattas',
    name: 'Regattas',
    description: 'Race-day action from the great regatta circuits.',
    coverImageUrl: u('1603625354572-83f7a0c498a1', COVER_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'classics',
    name: 'Classic Yachts',
    description: 'Timber, bronze and canvas — the classic and J-Class fleet.',
    coverImageUrl: u('1573925805234-22b9e43a5450', COVER_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'offshore',
    name: 'Offshore',
    description: 'Open water, long passages and the quiet between marks.',
    coverImageUrl: u('1504813205186-380b1235a5d2', COVER_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'crew',
    name: 'Crew & Details',
    description: 'Life on deck — hands, lines and the working boat up close.',
    coverImageUrl: u('1605387202149-47169c4ea58a', COVER_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'editorial',
    name: 'Editorial',
    description: 'Selected commissions and tearsheets for the sailing press.',
    coverImageUrl: u('1528580279421-f0b84f9d7640', COVER_PARAMS),
    sortOrder: 5,
  },
]

const sailingArtworks: ArtworkSeed[] = [
  // Regattas
  {
    slug: 'golden-fleet',
    title: 'Golden Fleet',
    galleryslug: 'regattas',
    description: 'The fleet reaches home in the last light of the day.',
    year: 2023,
    location: 'Porto Cervo, Sardinia',
    imageUrl: u('1603625354572-83f7a0c498a1', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'planing',
    title: 'Planing',
    galleryslug: 'regattas',
    description: 'A dinghy lifts onto a plane in a hard puff.',
    year: 2024,
    location: 'Hyères, France',
    imageUrl: u('1506527240747-720a3e17b910', ART_PARAMS),
    sortOrder: 2,
    isFeatured: true,
  },
  {
    slug: 'three-abreast',
    title: 'Three Abreast',
    galleryslug: 'regattas',
    description: 'Three boats split tacks under a flat grey sky.',
    year: 2023,
    location: 'Newport, Rhode Island',
    imageUrl: u('1631995037903-c4f8064c48ae', ART_PARAMS),
    sortOrder: 3,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 50,
  },
  {
    slug: 'the-long-beat',
    title: 'The Long Beat',
    galleryslug: 'regattas',
    description: 'Hard on the wind beneath a breaking sky.',
    year: 2022,
    location: 'Cowes, Isle of Wight',
    imageUrl: u('1602943554726-d8bebe914982', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'at-the-mark',
    title: 'At the Mark',
    galleryslug: 'regattas',
    description: 'A single-hander leans into a turn at the buoy.',
    year: 2024,
    location: 'Kiel, Germany',
    imageUrl: u('1506527115643-b3b387978fad', ART_PARAMS),
    sortOrder: 5,
  },

  // Classic Yachts
  {
    slug: 'gaff-rigger',
    title: 'Gaff Rigger',
    galleryslug: 'classics',
    description: 'A classic heels to a Caribbean trade wind.',
    year: 2023,
    location: 'Antigua',
    imageUrl: u('1573925805234-22b9e43a5450', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
    isLimitedEdition: true,
    editionSize: 25,
  },
  {
    slug: 'three-on-the-bay',
    title: 'Three on the Bay',
    galleryslug: 'classics',
    description: 'Cruising yachts ghost along under a mountain shore.',
    year: 2022,
    location: 'Auckland, New Zealand',
    imageUrl: u('1501771924607-209f42a6e7e4', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'hard-over',
    title: 'Hard Over',
    galleryslug: 'classics',
    description: 'Rail down in open water.',
    year: 2023,
    location: 'Saint-Tropez, France',
    imageUrl: u('1484226162739-491af9b312b8', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'the-anchorage',
    title: 'The Anchorage',
    galleryslug: 'classics',
    description: 'The fleet at rest below the headland.',
    year: 2021,
    location: 'Portofino, Italy',
    imageUrl: u('1720247523030-3723ee3ccb45', ART_PARAMS),
    sortOrder: 4,
  },

  // Offshore
  {
    slug: 'sun-track',
    title: 'Sun Track',
    galleryslug: 'offshore',
    description: 'A lone boat crosses a band of afternoon light.',
    year: 2024,
    location: 'Hauraki Gulf, New Zealand',
    imageUrl: u('1504813205186-380b1235a5d2', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'spinnaker-backlit',
    title: 'Spinnaker, Backlit',
    galleryslug: 'offshore',
    description: 'The kite fills against a low sun.',
    year: 2023,
    location: 'Valencia, Spain',
    imageUrl: u('1594739201538-838ea94344df', ART_PARAMS),
    sortOrder: 2,
    isLimitedEdition: true,
    editionSize: 15,
  },
  {
    slug: 'glass',
    title: 'Glass',
    galleryslug: 'offshore',
    description: 'A ketch drifts on a windless evening.',
    year: 2022,
    location: 'Salish Sea, BC',
    imageUrl: u('1503634192480-e77a6436f075', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'headland-haze',
    title: 'Headland Haze',
    galleryslug: 'offshore',
    description: 'Smoke haze softens the far shore.',
    year: 2024,
    location: 'Salish Sea, BC',
    imageUrl: u('1630534416741-9f03d63dab22', ART_PARAMS),
    sortOrder: 4,
  },
  {
    slug: 'lone-sail',
    title: 'Lone Sail',
    galleryslug: 'offshore',
    description: 'One sail against a high white sky.',
    year: 2023,
    location: 'Strait of Georgia, BC',
    imageUrl: u('1519770340285-c801df5ff3db', ART_PARAMS),
    sortOrder: 5,
  },

  // Crew & Details
  {
    slug: 'last-light-on-deck',
    title: 'Last Light on Deck',
    galleryslug: 'crew',
    description: 'The watch settles in as the sun goes down.',
    year: 2023,
    location: 'Mid-Atlantic',
    imageUrl: u('1605387202149-47169c4ea58a', ART_PARAMS),
    sortOrder: 1,
    isFeatured: true,
  },
  {
    slug: 'cockpit-dusk',
    title: 'Cockpit, Dusk',
    galleryslug: 'crew',
    description: 'Warm light along the coaming and winches.',
    year: 2022,
    location: 'Aegean Sea',
    imageUrl: u('1526761122248-c31c93f8b2b9', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'bow-watch',
    title: 'Bow Watch',
    galleryslug: 'crew',
    description: 'Looking forward from the foredeck under full sail.',
    year: 2023,
    location: 'Tyrrhenian Sea',
    imageUrl: u('1498623116890-37e912163d5d', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'two-up',
    title: 'Two Up',
    galleryslug: 'crew',
    description: 'A pair of dinghies run side by side.',
    year: 2024,
    location: 'English Channel',
    imageUrl: u('1613578699399-82ae71be53a3', ART_PARAMS),
    sortOrder: 4,
  },

  // Editorial
  {
    slug: 'dusk-fleet',
    title: 'Dusk Fleet',
    galleryslug: 'editorial',
    description: 'Commissioned for a regatta retrospective.',
    year: 2022,
    location: 'Lake Constance',
    imageUrl: u('1528580279421-f0b84f9d7640', ART_PARAMS),
    sortOrder: 1,
  },
  {
    slug: 'upwind',
    title: 'Upwind',
    galleryslug: 'editorial',
    description: 'Cover image, spring sailing annual.',
    year: 2023,
    location: 'Palma, Mallorca',
    imageUrl: u('1599922868403-9e022dfcfda0', ART_PARAMS),
    sortOrder: 2,
  },
  {
    slug: 'scattered-fleet',
    title: 'Scattered Fleet',
    galleryslug: 'editorial',
    description: 'From a feature on coastal racing.',
    year: 2024,
    location: 'San Francisco Bay',
    imageUrl: u('1505781769017-55fdc40def2b', ART_PARAMS),
    sortOrder: 3,
  },
  {
    slug: 'horizon-line',
    title: 'Horizon Line',
    galleryslug: 'editorial',
    description: 'Closing spread, offshore essay.',
    year: 2022,
    location: 'Strait of Juan de Fuca',
    imageUrl: u('1620149088397-8e168aab25c6', ART_PARAMS),
    sortOrder: 4,
  },
]

const neutral: ContentSet = {
  galleries: neutralGalleries,
  artworks: neutralArtworks,
}
const sailing: ContentSet = {
  galleries: sailingGalleries,
  artworks: sailingArtworks,
}

// Pick the content set for this deployment's theme. Sailing is the default;
// every other preset uses the neutral set until its own content is authored.
function contentSetForTheme(): ContentSet {
  const theme = (process.env.NEXT_PUBLIC_THEME || 'sailing').toLowerCase()
  return theme === 'sailing' ? sailing : neutral
}

// Generate N synthetic "volume" artworks to stress-test pagination and admin
// performance. Gated on SEED_VOLUME_COUNT so it only runs when requested, and
// idempotent — skips if a sample already exists.
async function seedVolumeArtworks(
  payload: Payload,
  galleryIdBySlug: Map<string, number>,
  count: number,
  artworks: ArtworkSeed[],
) {
  if (count <= 0) return
  // Idempotency probe: if the last volume artwork is already there, skip.
  const last = (
    await payload.find({
      collection: 'artworks',
      where: { slug: { equals: `volume-${String(count).padStart(6, '0')}` } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (last) return

  const gallerySlugs = Array.from(galleryIdBySlug.keys())
  if (gallerySlugs.length === 0) return
  const imageIds = artworks.map((a) => a.imageUrl)

  // Find which slugs already exist so we can skip them in bulk. One query
  // beats N existence probes by a wide margin on Neon.
  const expectedSlugs = Array.from({ length: count }, (_, idx) =>
    `volume-${String(idx + 1).padStart(6, '0')}`,
  )
  const existing = await payload.find({
    collection: 'artworks',
    where: { slug: { in: expectedSlugs } },
    limit: count,
    depth: 0,
  })
  const existingSlugs = new Set(existing.docs.map((d) => d.slug as string))

  // Parallelize in chunks of 20 to balance throughput with Neon's connection
  // limits. ~10s for 1000 rows.
  const CHUNK = 20
  for (let chunkStart = 1; chunkStart <= count; chunkStart += CHUNK) {
    const chunkEnd = Math.min(chunkStart + CHUNK - 1, count)
    await Promise.all(
      Array.from({ length: chunkEnd - chunkStart + 1 }, (_, k) => {
        const i = chunkStart + k
        const slug = `volume-${String(i).padStart(6, '0')}`
        if (existingSlugs.has(slug)) return Promise.resolve()
        const gSlug = gallerySlugs[i % gallerySlugs.length]
        const galleryId = galleryIdBySlug.get(gSlug)
        if (!galleryId) return Promise.resolve()
        return payload.create({
          collection: 'artworks',
          data: {
            slug,
            title: `Study ${String(i).padStart(4, '0')}`,
            gallery: galleryId,
            description: '',
            imageUrl: imageIds[i % imageIds.length],
            sortOrder: 1000 + i,
            isPublished: true,
          },
        })
      }),
    )
  }
}

export async function seedDemoContent(payload: Payload) {
  const { galleries, artworks } = contentSetForTheme()
  const galleryIdBySlug = new Map<string, number>()

  for (const g of galleries) {
    const existing = (
      await payload.find({
        collection: 'galleries',
        where: { slug: { equals: g.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (existing) {
      galleryIdBySlug.set(g.slug, Number(existing.id))
      await payload.update({
        collection: 'galleries',
        id: existing.id,
        data: {
          name: g.name,
          description: g.description,
          coverImageUrl: g.coverImageUrl,
          sortOrder: g.sortOrder,
          isPublished: true,
        },
      })
      continue
    }
    const created = await payload.create({
      collection: 'galleries',
      data: {
        slug: g.slug,
        name: g.name,
        description: g.description,
        coverImageUrl: g.coverImageUrl,
        sortOrder: g.sortOrder,
        isPublished: true,
      },
    })
    galleryIdBySlug.set(g.slug, Number(created.id))
  }

  for (const a of artworks) {
    const galleryId = galleryIdBySlug.get(a.galleryslug)
    if (!galleryId) continue
    const existing = (
      await payload.find({
        collection: 'artworks',
        where: { slug: { equals: a.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    // Edition fields: editionsRemaining is auto-initialized from editionSize by
    // the Artworks beforeChange hook, so we only set the inputs here.
    const editionData = {
      isFeatured: a.isFeatured ?? false,
      isLimitedEdition: a.isLimitedEdition ?? false,
      editionSize: a.editionSize,
    }
    if (existing) {
      await payload.update({
        collection: 'artworks',
        id: existing.id,
        data: {
          title: a.title,
          gallery: galleryId,
          description: a.description,
          year: a.year,
          location: a.location,
          imageUrl: a.imageUrl,
          sortOrder: a.sortOrder ?? 0,
          isPublished: true,
          ...editionData,
        },
      })
      continue
    }
    await payload.create({
      collection: 'artworks',
      data: {
        slug: a.slug,
        title: a.title,
        gallery: galleryId,
        description: a.description,
        year: a.year,
        location: a.location,
        imageUrl: a.imageUrl,
        sortOrder: a.sortOrder ?? 0,
        isPublished: true,
        ...editionData,
      },
    })
  }

  const volumeCount = parseInt(process.env.SEED_VOLUME_COUNT ?? '0', 10)
  if (volumeCount > 0) {
    await seedVolumeArtworks(payload, galleryIdBySlug, volumeCount, artworks)
  }
}
