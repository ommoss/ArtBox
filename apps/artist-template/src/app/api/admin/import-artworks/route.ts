import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { parseCsvWithHeaders } from '@/lib/csv-parser'

// Bulk CSV import for artworks. Authenticated via Payload's session cookie —
// the same login used for the admin UI. Upserts by slug: existing rows are
// updated, new rows are created.
//
// Expected CSV columns (header row required):
//   slug,title,gallerySlug,imageUrl,description,year,location,isPublished
//
// `isPublished` defaults to false for bulk imports — the artist curates which
// pieces go live, separately from importing the catalog. `year` is optional;
// non-numeric values are stored as null.
type ImportResult = {
  created: number
  updated: number
  skipped: number
  errors: { row: number; slug?: string; message: string }[]
}

// Maximum number of rows to process in a single request. Above this we ask
// the caller to chunk — keeps requests under serverless time limits and lets
// the artist see progress in batches.
const MAX_ROWS = 2000

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing "file" field (multipart upload required)' },
      { status: 400 },
    )
  }

  const text = await file.text()
  const records = parseCsvWithHeaders(text)
  if (records.length === 0) {
    return NextResponse.json(
      { error: 'CSV is empty or has no rows under the header' },
      { status: 400 },
    )
  }
  if (records.length > MAX_ROWS) {
    return NextResponse.json(
      {
        error: `Too many rows in one request (${records.length}). Limit ${MAX_ROWS}; split the file and re-upload.`,
      },
      { status: 400 },
    )
  }

  // Pre-load galleries so we can resolve gallerySlug → id without N queries.
  const galleries = await payload.find({
    collection: 'galleries',
    limit: 1000,
    depth: 0,
  })
  const galleryIdBySlug = new Map<string, number>()
  for (const g of galleries.docs) {
    galleryIdBySlug.set(g.slug as string, Number(g.id))
  }

  // Pre-load existing artworks for the slugs being imported so we know which
  // are creates vs updates without per-row lookups.
  const importSlugs = records
    .map((r) => r.slug)
    .filter((s): s is string => Boolean(s))
  const existing = await payload.find({
    collection: 'artworks',
    where: { slug: { in: importSlugs } },
    limit: importSlugs.length,
    depth: 0,
  })
  const existingBySlug = new Map<string, { id: number | string }>()
  for (const a of existing.docs) {
    existingBySlug.set(a.slug as string, { id: a.id })
  }

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] }

  // Process in chunks of 20 in parallel — same throughput shape as the
  // volume seed. Sequential within a chunk would be ~100ms/row, way too slow.
  const CHUNK = 20
  for (let chunkStart = 0; chunkStart < records.length; chunkStart += CHUNK) {
    const chunk = records.slice(chunkStart, chunkStart + CHUNK)
    await Promise.all(
      chunk.map(async (rec, idxInChunk) => {
        const rowIdx = chunkStart + idxInChunk + 2 // +2 for header + 1-based
        const slug = rec.slug?.trim()
        const title = rec.title?.trim()
        const gallerySlug = rec.gallerySlug?.trim()
        if (!slug || !title || !gallerySlug) {
          result.skipped++
          result.errors.push({
            row: rowIdx,
            slug,
            message: 'Missing required field (slug, title, gallerySlug)',
          })
          return
        }
        const galleryId = galleryIdBySlug.get(gallerySlug)
        if (!galleryId) {
          result.skipped++
          result.errors.push({
            row: rowIdx,
            slug,
            message: `Unknown gallerySlug "${gallerySlug}"`,
          })
          return
        }

        const yearNum = rec.year ? parseInt(rec.year, 10) : undefined
        const data = {
          slug,
          title,
          gallery: galleryId,
          imageUrl: rec.imageUrl || undefined,
          description: rec.description || undefined,
          year: Number.isFinite(yearNum) ? yearNum : undefined,
          location: rec.location || undefined,
          isPublished: parseBool(rec.isPublished, false),
        }

        const existingDoc = existingBySlug.get(slug)
        try {
          if (existingDoc) {
            await payload.update({
              collection: 'artworks',
              id: existingDoc.id,
              data,
            })
            result.updated++
          } else {
            await payload.create({ collection: 'artworks', data })
            result.created++
          }
        } catch (err) {
          result.skipped++
          result.errors.push({
            row: rowIdx,
            slug,
            message: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }),
    )
  }

  return NextResponse.json(result)
}

function parseBool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === '') return fallback
  const s = v.trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'y'
}
