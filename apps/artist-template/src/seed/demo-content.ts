import type { Payload } from 'payload'

// Demo content for the artist template.
//
// All imageUrl values here point to web-resolution images (~1200px wide) — this
// mirrors how the real platform works: the artist's site only ever serves the
// smaller "preview" tier. Print-quality masters live on local storage at the
// shop in Victoria, BC and are pulled per-order, not exposed over the web.
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
}

// Unsplash query params we use everywhere:
//   w=1200  — artwork detail max usable width on desktop
//   w=900   — gallery cover cards (never displayed wider than ~600px)
//   q=75    — Unsplash's recommended quality for web preview
const COVER_PARAMS = 'auto=format&fit=crop&w=900&q=75'
const ART_PARAMS = 'auto=format&fit=crop&w=1200&q=75'

const u = (id: string, params: string) =>
  `https://images.unsplash.com/photo-${id}?${params}`

const galleries = [
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

const artworks: ArtworkSeed[] = [
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

export async function seedDemoContent(payload: Payload) {
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
      },
    })
  }
}
