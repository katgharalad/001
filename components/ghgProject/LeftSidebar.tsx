'use client'

import { useYear } from '@/contexts/YearContext'
import Clock from './Clock'
import { Card } from '@/components/ui/Card'

export default function LeftSidebar() {
  const { selectedYear, setSelectedYear } = useYear()

  return (
    <aside className="fixed left-4 top-0 z-50 hidden lg:flex flex-col gap-6 pt-16 xl:left-6 xl:pt-20">

      {/* Year Selector in middle */}
      <Card className="px-4 py-4 lg:px-5 lg:py-5 xl:px-6 xl:py-5 shadow-lg backdrop-blur-sm">
        <div className="space-y-4">
          <div className="text-xs lg:text-sm font-semibold text-text-primary tracking-wide text-center mb-3">
            Year Selection
          </div>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {Array.from({ length: 14 }, (_, i) => 2010 + i).map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-xs font-medium min-w-[80px] lg:min-w-[100px] xl:px-6 xl:py-2.5 xl:text-sm ${
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
      </Card>

      {/* Clock at bottom */}
      <Clock />
    </aside>
  )
}

