import { NavArrowButton } from '@renderer/components/ui/NavArrowButton'

interface YearNavProps {
  year: number
  onPrevYear: () => void
  onNextYear: () => void
}

export function YearNav({ year, onPrevYear, onNextYear }: YearNavProps): JSX.Element {
  const isCurrentYear = year === new Date().getFullYear()

  return (
    <div className="flex items-center gap-1">
      <NavArrowButton direction="prev" label="Previous year" onClick={onPrevYear} />
      <span className="w-16 text-center text-base font-semibold tabular-nums">{year}</span>
      <NavArrowButton
        direction="next"
        label="Next year"
        onClick={onNextYear}
        disabled={isCurrentYear}
      />
    </div>
  )
}
