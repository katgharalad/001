'use client'

import { useYear } from '@/contexts/YearContext'

export default function GlobalYearSelector() {
  const { selectedYear, setSelectedYear } = useYear()

  const allYears = Array.from({ length: 14 }, (_, i) => 2010 + i)

  return (
    <div className="bg-bg-card rounded-xl px-6 py-3 border border-accent-primary/30 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="text-text-primary text-sm font-semibold tracking-wide whitespace-nowrap">Year:</span>
        <div className="flex gap-2 max-w-2xl overflow-x-auto scrollbar-hide">
          {allYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-xs font-medium min-w-[50px] whitespace-nowrap ${
                selectedYear === year
                  ? 'bg-accent-primary text-bg-body font-semibold shadow-md scale-105'
                  : 'bg-bg-card-alt text-text-secondary hover:text-accent-primary hover:bg-bg-hover border border-accent-primary/20 hover:border-accent-primary/40'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

