export default function SiteFooter({ artistName }: { artistName: string }) {
  return (
    <footer className="site-footer">
      <span>
        © {new Date().getFullYear()} {artistName}
      </span>
      <span style={{ opacity: 0.75 }}>
        Prints made and shipped by Artbox Printing, Victoria BC · Site by Moss Editions
      </span>
    </footer>
  )
}
