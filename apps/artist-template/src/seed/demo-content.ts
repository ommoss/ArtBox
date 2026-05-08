import type { Payload } from 'payload'

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

const galleries = [
  {
    slug: 'coastlines',
    name: 'Coastlines',
    description: 'Long-form work from the Pacific edge.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 1,
  },
  {
    slug: 'studio',
    name: 'Studio',
    description: 'Still life and quieter work.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 2,
  },
]

const artworks: ArtworkSeed[] = [
  {
    slug: 'morning-fog',
    title: 'Morning fog',
    galleryslug: 'coastlines',
    description: 'Hand-printed from a 6×7 medium format negative.',
    year: 2024,
    location: 'Tofino, BC',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    sortOrder: 1,
  },
  {
    slug: 'low-tide',
    title: 'Low tide',
    galleryslug: 'coastlines',
    description: 'Late afternoon, west coast Vancouver Island.',
    year: 2024,
    location: 'Sombrio Beach, BC',
    imageUrl:
      'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=2000&q=80',
    sortOrder: 2,
  },
  {
    slug: 'driftwood-study',
    title: 'Driftwood study',
    galleryslug: 'coastlines',
    description: 'Detail of weathered cedar.',
    year: 2023,
    location: 'Long Beach, BC',
    imageUrl:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=80',
    sortOrder: 3,
  },
  {
    slug: 'still-life-with-lemons',
    title: 'Still life with lemons',
    galleryslug: 'studio',
    description: 'Available as a limited edition of 25.',
    year: 2025,
    location: 'Studio',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80',
    sortOrder: 1,
  },
  {
    slug: 'window-light',
    title: 'Window light',
    galleryslug: 'studio',
    description: '',
    year: 2025,
    location: 'Studio',
    imageUrl:
      'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=2000&q=80',
    sortOrder: 2,
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
    const existing = (
      await payload.find({
        collection: 'artworks',
        where: { slug: { equals: a.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (existing) continue
    const galleryId = galleryIdBySlug.get(a.galleryslug)
    if (!galleryId) continue
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
