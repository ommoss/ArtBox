import type React from 'react'

export default function SiteFooter({
  artistName,
  isPlatform = false,
  children,
}: {
  artistName: string
  isPlatform?: boolean
  children?: React.ReactNode
}) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {artistName}
      </span>
      <span style={{ opacity: 0.75 }}>
        {isPlatform
          ? 'Prints made and shipped by Artbox Printing, Victoria BC'
          : 'Prints made and shipped by Artbox Printing, Victoria BC · Site by Moss Editions'}
      </span>
      {children ? <span className="site-footer__links">{children}</span> : null}
    </footer>
  )
}
