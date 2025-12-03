'use client'

import { YearProvider } from '@/contexts/YearContext'
import DashboardVisualizations from '@/components/dashboard/DashboardVisualizations'
import GlobalYearSelector from '@/components/ghgProject/GlobalYearSelector'

export default function DashboardPage() {
  return (
    <YearProvider>
      <div className="min-h-screen bg-bg-body">
        {/* Header */}
        <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b border-accent-primary/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-accent-primary">GHG Emissions Dashboard</h1>
              <p className="text-text-secondary mt-1 text-sm">Interactive Visualizations from Analysis Notebook</p>
            </div>
            <GlobalYearSelector />
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardVisualizations />
        </main>
      </div>
    </YearProvider>
  )
}
