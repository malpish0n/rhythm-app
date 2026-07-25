import { ExternalLink } from 'lucide-react'
import logoMark from '@renderer/assets/logo-mark.png'
import { APP_VERSION, APP_REPO_URL } from '@renderer/lib/appInfo'

export function AboutTab(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <img src={logoMark} alt="Rhythm" className="h-16 w-16 rounded-2xl shadow-elevation-md" />
      <div>
        <p className="text-base font-semibold">Rhythm</p>
        <p className="text-xs text-[var(--text-muted)]">Version {APP_VERSION}</p>
      </div>
      <p className="max-w-xs text-sm text-[var(--text-muted)]">
        A local-first activity and habit tracker with a calendar, streaks, and forward planning.
      </p>
      <a
        href={APP_REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      >
        <ExternalLink size={14} />
        View on GitHub
      </a>
    </div>
  )
}
