'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import CartButton from '@/components/CartButton'
import type { HeaderLayout, HeaderStyle } from '@/lib/themes'

// Site header for every preset. Two axes come from the theme:
//   headerLayout — 'split' (name left, nav right) or 'centered' (stacked)
//   headerStyle  — 'solid' or 'glass' (see globals.css for the states)
//
// For the glass style the bar needs to know two things about the page: has
// it scrolled at all, and is a hero image currently underneath it. Both are
// measured with IntersectionObservers rather than scroll listeners: a 1px
// sentinel at the top of the document, and the first [data-hero] element on
// the page (heroes opt in by rendering that attribute + the .site-hero class).
// The results land on data attributes the stylesheet keys off.

const NAV = [
  { href: '/gallery', label: 'Galleries' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteHeader({
  artistName,
  layout,
  style,
}: {
  artistName: string
  layout: HeaderLayout
  style: HeaderStyle
}) {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [overHero, setOverHero] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerH, setHeaderH] = useState(72)

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Publish the measured header height so heroes and page padding can offset
  // by the real value (nav wraps on narrow screens, centered layout is taller).
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const publish = () => {
      const h = Math.round(el.getBoundingClientRect().height)
      if (h > 0) {
        setHeaderH(h)
        document.documentElement.style.setProperty('--header-h', `${h}px`)
      }
    }
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => ro.disconnect()
  }, [layout])

  // Scrolled state: a sentinel at the very top of the document leaves the
  // viewport as soon as the page moves.
  useEffect(() => {
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;'
    document.body.prepend(sentinel)
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(sentinel)
    return () => {
      io.disconnect()
      sentinel.remove()
    }
  }, [])

  // Over-hero state: only meaningful for the glass style. The hero counts as
  // "under the bar" while any part of it sits below the header's bottom edge.
  useEffect(() => {
    if (style !== 'glass') return
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    if (!hero) {
      setOverHero(false)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: `-${headerH}px 0px 0px 0px`, threshold: 0 },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [style, headerH, pathname])

  const className = ['site-header', `site-header--${layout}`, `site-header--${style}`].join(' ')

  return (
    <header
      ref={headerRef}
      className={className}
      data-scrolled={scrolled ? 'true' : 'false'}
      data-over-hero={style === 'glass' && overHero ? 'true' : 'false'}
      data-menu-open={menuOpen ? 'true' : 'false'}
    >
      <div className="site-header__inner">
        <Link href="/" className="site-header__name">
          {artistName}
        </Link>
        <button
          type="button"
          className="site-nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <nav className="site-nav" id="site-nav" aria-label="Primary">
          {NAV.map((item) => {
            const current = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} aria-current={current ? 'page' : undefined}>
                {item.label}
              </Link>
            )
          })}
          <CartButton />
          <Link href="/admin" className="site-nav__admin">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
