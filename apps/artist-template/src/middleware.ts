import { NextResponse, type NextRequest } from 'next/server'

import { siteKeyForHost } from '@/lib/site'

// Every public request is rewritten to /sites/<key>/<path> so the site is a
// route param (see src/lib/site.ts). The browser URL is untouched. Admin, API,
// Next internals and static files are left alone.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const key = siteKeyForHost(request.headers.get('host') || '')
  const url = request.nextUrl.clone()
  url.pathname = `/sites/${key}${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|admin|sites|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)'],
}
