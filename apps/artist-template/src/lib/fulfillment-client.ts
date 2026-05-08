import type { PublicProductTemplate } from '@artbox/types'

const API_URL = process.env.FULFILLMENT_API_URL || ''
const API_KEY = process.env.FULFILLMENT_API_KEY || ''

export const fulfillmentConfigured = Boolean(API_URL && API_KEY)

async function getJson<T>(path: string): Promise<T | null> {
  if (!fulfillmentConfigured) return null
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'x-artbox-api-key': API_KEY },
      // Templates change rarely; cache aggressively.
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      console.warn(`fulfillment fetch ${path} -> ${res.status}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn(`fulfillment fetch ${path} failed`, err)
    return null
  }
}

export async function fetchTemplates(): Promise<PublicProductTemplate[]> {
  const data = await getJson<{ templates: PublicProductTemplate[] }>(
    '/api/v1/templates',
  )
  return data?.templates ?? []
}

export async function fetchTemplate(
  slug: string,
): Promise<PublicProductTemplate | null> {
  const data = await getJson<{ template: PublicProductTemplate }>(
    `/api/v1/templates/${encodeURIComponent(slug)}`,
  )
  return data?.template ?? null
}
