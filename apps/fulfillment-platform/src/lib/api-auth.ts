import type { Payload } from 'payload'

export type ResolvedArtist = {
  id: string | number
  slug: string
  name: string
  status: string
}

export const ARTIST_API_KEY_HEADER = 'x-artbox-api-key'

export async function resolveArtistFromRequest(
  payload: Payload,
  request: Request,
): Promise<ResolvedArtist | null> {
  const apiKey = request.headers.get(ARTIST_API_KEY_HEADER)
  if (!apiKey) return null

  const result = await payload.find({
    collection: 'artists',
    where: { apiKey: { equals: apiKey } },
    limit: 1,
    depth: 0,
  })

  const artist = result.docs[0]
  if (!artist) return null
  if (artist.status !== 'active') return null

  return {
    id: artist.id,
    slug: artist.slug,
    name: artist.name,
    status: artist.status,
  }
}
