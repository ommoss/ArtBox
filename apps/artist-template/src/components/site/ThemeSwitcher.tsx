import { demoLinks } from '@/lib/site'

// Cross-links between the genre demos. Demo-only.
export default function ThemeSwitcher({ activePreset }: { activePreset: string }) {
  return (
    <div className="theme-switcher">
      <span className="theme-switcher__label">Demo · the same platform in other looks:</span>
      <div className="theme-switcher__links">
        {demoLinks().map((link) => {
          const isActive = link.preset === activePreset
          return (
            <a
              key={link.preset}
              href={link.url}
              className={
                isActive ? 'theme-switcher__link theme-switcher__link--active' : 'theme-switcher__link'
              }
            >
              <span className="theme-switcher__name">{link.label}</span>
              <span className="theme-switcher__tagline">{link.tagline}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
