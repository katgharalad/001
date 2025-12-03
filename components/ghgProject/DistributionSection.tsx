'use client'

import Section from './Section'
import { useDistributionData } from '@/hooks/useDistributionData'
import { useYear } from '@/contexts/YearContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import Boxplot from './Boxplot'

export default function DistributionSection() {
  const { selectedYear } = useYear()
  const { linearData, logData, boxplotData, stats, loading } = useDistributionData(selectedYear)
  return (
    <Section id="distribution">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">Distribution of Facility Emissions ({selectedYear})</h2>
        </div>
        
        {/* Two Histograms Side-by-Side (matching notebook) */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-accent-primary mb-3 sm:mb-4 text-center">
            Distribution of Facility Emissions
          </h3>
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : linearData.length === 0 || logData.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No distribution data available</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Linear Scale Histogram */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-accent-teal mb-2 sm:mb-3 text-center">
                  Distribution of Facility Emissions<br />
                  <span className="text-xs sm:text-sm font-normal text-text-secondary">(Linear Scale)</span>
                </h4>
                <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] max-h-[350px]">
                  <BarChart data={linearData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                    <XAxis 
                      dataKey="bin" 
                      stroke="#9BA0B5" 
                      tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                      label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                    />
                    <YAxis 
                      stroke="#9BA0B5" 
                      tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                      label={{ value: 'Frequency (Number of Facilities)', angle: -90, position: 'insideLeft', style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181A20',
                        border: '1px solid #2E86AB',
                        borderRadius: '8px',
                        color: '#F5F7FB',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                      labelStyle={{ color: '#2E86AB', fontWeight: 'bold', fontSize: '12px' }}
                      itemStyle={{ color: '#F5F7FB', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: number) => [value, 'Facilities']}
                      labelFormatter={(label) => `Bin: ${label} M t CO₂e`}
                    />
                    <Bar dataKey="count" fill="#2E86AB" />
                  </BarChart>
                </ResponsiveContainer>
                {stats && (
                  <div className="mt-2 text-center">
                    <div className="inline-block px-3 py-1 bg-bg-card-alt rounded border border-red-500/30">
                      <span className="text-xs text-text-secondary">
                        Median: <span className="text-red-400 font-semibold">{stats.median.toFixed(2)}M</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Log Scale Histogram */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-accent-teal mb-2 sm:mb-3 text-center">
                  Distribution of Facility Emissions<br />
                  <span className="text-xs sm:text-sm font-normal text-text-secondary">(Log Scale)</span>
                </h4>
                <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] max-h-[350px]">
                  <BarChart data={logData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                    <XAxis 
                      dataKey="bin" 
                      stroke="#9BA0B5" 
                      tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                      label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                    />
                    <YAxis 
                      stroke="#9BA0B5" 
                      tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                      label={{ value: 'Frequency (Number of Facilities)', angle: -90, position: 'insideLeft', style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181A20',
                        border: '1px solid #A23B72',
                        borderRadius: '8px',
                        color: '#F5F7FB',
                        fontSize: '13px',
                        fontWeight: 'bold',
                      }}
                      labelStyle={{ color: '#A23B72', fontWeight: 'bold', fontSize: '13px' }}
                      itemStyle={{ color: '#F5F7FB', fontSize: '13px', fontWeight: 'bold' }}
                      formatter={(value: number) => [value, 'Facilities']}
                      labelFormatter={(label) => `Bin: ${label} M t CO₂e`}
                    />
                    <Bar dataKey="count" fill="#A23B72" />
                  </BarChart>
                </ResponsiveContainer>
                {stats && (
                  <div className="mt-2 text-center">
                    <div className="inline-block px-3 py-1 bg-bg-card-alt rounded border border-red-500/30">
                      <span className="text-xs text-text-secondary">
                        Median: <span className="text-red-400 font-semibold">{stats.median.toFixed(2)}M</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Distribution Statistics */}
        {stats && (
          <Card variant="alt" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-text-secondary mb-1">Mean</div>
                <div className="text-lg font-bold text-accent-primary">{stats.mean.toFixed(2)} M t CO₂e</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary mb-1">Median</div>
                <div className="text-lg font-bold text-accent-primary">{stats.median.toFixed(2)} M t CO₂e</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary mb-1">Std Dev</div>
                <div className="text-lg font-bold text-accent-primary">{stats.std.toFixed(2)} M t CO₂e</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary mb-1">Skewness</div>
                <div className="text-lg font-bold text-accent-primary">{stats.skew.toFixed(2)}</div>
                <div className="text-xs text-text-muted">(positive = right-skewed)</div>
              </div>
            </div>
          </Card>
        )}

        <Card variant="teal" className="p-6">
          <h3 className="text-xl font-semibold text-accent-teal mb-4">Distribution Interpretation</h3>
          <div className="space-y-3 text-text-secondary">
            <p className="text-lg leading-relaxed">
              <strong className="text-accent-primary">Distribution Shape:</strong> I found that the distribution of facility emissions 
              is highly right-skewed, with many small facilities and a few very large ones. Most facilities have relatively 
              low emissions, while a long tail of high-emitting facilities extends to the right.
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Long Tail Pattern:</strong> I observed that a small number of facilities account 
              for a disproportionately large share of total emissions. I believe this pattern is consistent with the 
              industrial structure of US emissions, where large power plants and refineries dominate the emissions profile.
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Most Common Ranges:</strong> My analysis shows that the majority of facilities 
              emit less than 1 million metric tons CO₂e annually, with the modal bin falling in the 0–0.5 
              million ton range. This indicates that while most facilities are relatively small emitters, the 
              aggregate impact is driven by a small number of very large facilities.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}

