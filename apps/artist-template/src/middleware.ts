import { NextResponse, type NextRequest } from 'next/server'

import { MULTI_SITE, siteKeyForHost } from '@/lib/site'

// Every public request is rewritten to /sites/<key>/<path> so the site is a
// route param (see src/lib/site.ts). The browser URL is untouched. Admin, API,
// Next internals and static files are left alone.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const key = siteKeyForHost(request.headers.get('host') || '')
  const url = request.nextUrl.clone()
  url.pathname = `/sites/${key}${pathname === '/' ? '' : pathname}`
  url.search = search
  const res = NextResponse.rewrite(url)
  // Diagnostics: `curl -sI https://host/` shows which site the request
  // resolved to and whether the deployment is in multi-site mode.
  res.headers.set('x-moss-site', key)
  res.headers.set('x-moss-mode', MULTI_SITE ? 'multi' : 'single')
  return res
}

export const config = {
  matcher: ['/((?!api|admin|sites|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)'],
}
