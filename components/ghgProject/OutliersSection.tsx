'use client'

import { useState, useCallback } from 'react'
import Section from './Section'
import { useOutlierData } from '@/hooks/useOutlierData'
import { useDistributionData } from '@/hooks/useDistributionData'
import { useYear } from '@/contexts/YearContext'
import Boxplot, { BoxplotStats } from './Boxplot'
import { Card } from '@/components/ui/Card'

function BoxplotKPI({ data }: { data: number[] }) {
  const [stats, setStats] = useState<BoxplotStats | null>(null)

  // Memoize the callback to prevent infinite loops
  const handleStatsCalculated = useCallback((calculatedStats: BoxplotStats) => {
    setStats(calculatedStats)
  }, [])

  return (
    <div className="flex flex-row items-center justify-between gap-8">
      {/* Left: Boxplot */}
      <div className="flex-1 flex items-center justify-center min-h-[260px]">
        <div className="w-full max-w-[600px]">
          <Boxplot data={data} height={260} width={600} onStatsCalculated={handleStatsCalculated} />
        </div>
      </div>
      
      {/* Right: KPI Stats */}
      <div className="w-64 flex flex-col gap-3 text-sm text-text-primary">
        <p className="text-text-secondary">Heavy tail distribution with outliers visible</p>
        
        {stats && (
          <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
            <span className="font-semibold text-accent-primary">Q1</span>
            <span className="text-text-secondary">{stats.q1.toFixed(2)}</span>
            
            <span className="font-semibold text-accent-primary">Median</span>
            <span className="text-text-secondary">{stats.median.toFixed(2)}</span>
            
            <span className="font-semibold text-accent-primary">Q3</span>
            <span className="text-text-secondary">{stats.q3.toFixed(2)}</span>
            
            <span className="font-semibold text-accent-primary">Outliers</span>
            <span className="text-text-secondary">{stats.outlierCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OutliersSection() {
  const { selectedYear } = useYear()
  const { data: outlierFacilities, loading } = useOutlierData(selectedYear)
  const { boxplotData, loading: boxplotLoading } = useDistributionData(selectedYear)
  
  // Calculate total facilities for statistics (approximate)
  const totalFacilitiesApprox = outlierFacilities.length > 0 ? '~100,000' : 'N/A'
  const outlierCount = outlierFacilities.length

  return (
    <Section id="outliers">
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-accent-primary">Outlier Detection and Analysis ({selectedYear})</h2>
        </div>
        
        {/* Method Card with Formulas */}
        <Card variant="teal" className="p-6">
          <h3 className="text-2xl font-semibold text-accent-teal mb-4">Outlier Detection Methods</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-accent-primary mb-3">Method 1: Interquartile Range (IQR)</h4>
              <div className="bg-bg-card-alt rounded-lg p-4 border border-accent-teal/20 space-y-2">
                <p className="text-sm text-text-secondary mb-3">I used the IQR method to identify outliers:</p>
                <div className="space-y-1 text-sm font-mono text-text-secondary">
                  <div>Q1 = 25th percentile</div>
                  <div>Q3 = 75th percentile</div>
                  <div>IQR = Q3 - Q1</div>
                  <div className="text-accent-primary mt-2">Lower Bound = Q1 - 1.5 × IQR</div>
                  <div className="text-accent-primary">Upper Bound = Q3 + 1.5 × IQR</div>
                </div>
                <p className="text-sm text-text-secondary mt-3">
                  Facilities with emissions outside these bounds were flagged as outliers.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-accent-primary mb-3">Method 2: Z-Score Threshold</h4>
              <div className="bg-bg-card-alt rounded-lg p-4 border border-accent-teal/20 space-y-2">
                <p className="text-sm text-text-secondary mb-3">I also used z-score analysis:</p>
                <div className="space-y-1 text-sm font-mono text-text-secondary">
                  <div>z = (x - μ) / σ</div>
                  <div className="text-accent-primary mt-2">where: x = facility emissions, μ = mean, σ = standard deviation</div>
                  <div className="text-accent-primary mt-2">Threshold: |z| ≥ 2.5</div>
                </div>
                <p className="text-sm text-text-secondary mt-3">
                  Facilities with z-scores ≥ 2.5 standard deviations from the mean were identified as outliers.
                </p>
              </div>
            </div>
            
            <Card variant="alt" className="p-4">
              <p className="text-sm text-text-secondary">
                <strong className="text-accent-primary">Results:</strong> Using these methods, I identified{' '}
                <strong className="text-accent-teal">{outlierCount}</strong> outlier facilities out of approximately{' '}
                {totalFacilitiesApprox} total facility-year records. I found that these outliers represent legitimate high emitters 
                (large power plants, refineries) rather than data errors, as facility emissions data exhibits significant 
                right-skewness with a long tail of high-emitting facilities.
              </p>
            </Card>
          </div>
        </Card>

        {/* Outlier Examples Table */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-accent-primary mb-4">Outlier Facilities Examples</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading outlier data...</div>
          ) : outlierFacilities.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">
              <p>No outliers found with z-score ≥ 2.5</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-primary/20">
                    <th className="text-left p-3 text-accent-primary">Rank</th>
                    <th className="text-left p-3 text-accent-primary">Facility Name</th>
                    <th className="text-left p-3 text-accent-primary">State</th>
                    <th className="text-left p-3 text-accent-primary">Sector</th>
                    <th className="text-right p-3 text-accent-primary">Emissions (M t CO₂e)</th>
                    <th className="text-right p-3 text-accent-primary">Z-Score</th>
                  </tr>
                </thead>
                <tbody>
                  {outlierFacilities.map((facility, idx) => (
                    <tr key={idx} className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary font-semibold transition-colors">{idx + 1}</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">{facility.name}</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">{facility.state}</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">{facility.sector}</td>
                      <td className="p-3 text-right text-accent-teal group-hover:text-accent-teal font-bold transition-colors">{facility.emissions.toFixed(1)}</td>
                      <td className="p-3 text-right text-accent-primary group-hover:text-accent-primary font-semibold transition-colors">{facility.zScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <div className="flex flex-col gap-6 rounded-3xl border border-accent-primary/60 bg-bg-card/80 p-6">
          <h3 className="text-xl font-semibold text-accent-primary">Boxplot Visualization</h3>
          {boxplotLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading boxplot data...</div>
          ) : !boxplotData || boxplotData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">No boxplot data available</div>
          ) : (
            <BoxplotKPI data={boxplotData} />
          )}
        </div>
        {/* Explicit Interpretation */}
        <Card variant="alt" className="p-6">
          <h3 className="text-xl font-semibold text-accent-primary mb-4">Interpretation</h3>
          <div className="space-y-3 text-text-secondary">
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Outlier Characteristics:</strong> These outlier facilities emit 
              several standard deviations more than typical plants in the dataset. They represent the largest 
              industrial facilities in the US, primarily large-scale power plants and refineries located in states 
              like Texas (TX) and Louisiana (LA).
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Legitimacy:</strong> These outliers are legitimate high emitters 
              rather than data errors. They represent real, large industrial complexes that are expected to have 
              high emissions due to their scale and operations (e.g., coal-fired power plants, petroleum refineries, 
              chemical manufacturing facilities).
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Policy Implications:</strong> The identification of these outliers 
              is important for understanding the concentration of emissions and for policy targeting. A small number of 
              facilities account for a disproportionate share of total emissions, suggesting that targeted interventions 
              at these specific facilities could yield substantial emissions reductions.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}

