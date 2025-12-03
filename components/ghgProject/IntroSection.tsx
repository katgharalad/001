'use client'

import Section from './Section'
import { Card } from '@/components/ui/Card'
import { useDatasetStats } from '@/hooks/useDatasetStats'

export default function IntroSection() {
  const { data: stats, loading } = useDatasetStats()

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  return (
    <Section id="intro">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent-primary leading-tight mb-4">
            Greenhouse Gas Emissions in the United States (2010–2023)
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl text-text-secondary">
                An Analytical Study Using EPA GHGRP Data
              </h2>
              <div className="space-y-2 text-text-muted text-xs sm:text-sm">
                <p>Student: Aarav Singh</p>
                <p>Course: Data 300:2</p>
                <p>Semester: Fall 2025</p>
              </div>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                My analysis uses a real-world dataset from the EPA Greenhouse Gas Reporting Program 
                (GHGRP) Direct Emitters to fulfill a comprehensive data analysis assignment. I collected, 
                cleaned, analyzed, visualized, and interpreted emissions data spanning {stats?.years_covered || 14} years to understand 
                patterns, trends, and key contributors to US greenhouse gas emissions.
              </p>
            </div>
            <Card className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-accent-primary mb-4 sm:mb-6">Dataset Overview</h3>
              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-6 sm:h-8 bg-bg-card-alt rounded animate-pulse" />
                  <div className="h-6 sm:h-8 bg-bg-card-alt rounded animate-pulse" />
                  <div className="h-6 sm:h-8 bg-bg-card-alt rounded animate-pulse" />
                </div>
              ) : stats ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-accent-teal">{stats.years_covered}</div>
                    <div className="text-xs sm:text-sm text-text-secondary">Years Covered ({stats.years_list[0]}–{stats.years_list[stats.years_list.length - 1]})</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-accent-teal">{formatNumber(stats.total_records)}</div>
                    <div className="text-xs sm:text-sm text-text-secondary">Facility-Year Records</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-accent-teal">{stats.column_count}</div>
                    <div className="text-xs sm:text-sm text-text-secondary">Core Fields</div>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary">Unable to load dataset statistics</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Section>
  )
}

