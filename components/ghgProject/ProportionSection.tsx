'use client'

import Section from './Section'
import { useYear } from '@/contexts/YearContext'
import { useProportionData } from '@/hooks/useProportionData'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'

export default function ProportionSection() {
  const { selectedYear } = useYear()
  const { data: sectorData, loading } = useProportionData(selectedYear)

  return (
    <Section id="proportion">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">Sectoral Composition of Emissions</h2>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-accent-teal/70 bg-bg-card/80 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-accent-primary">
            Emissions Distribution by Sector ({selectedYear})
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Top 8 sectors + Other, based on total reported direct emissions.
          </p>
          
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : sectorData.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No sector data available</div>
          ) : (
            (() => {
              const totalEmissions = sectorData.reduce((sum, d) => sum + d.value, 0)
              const topSector = sectorData[0]
              const topSectorPercent = topSector ? (topSector.value / totalEmissions * 100) : 0
              
              return (
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] max-h-[400px]">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          innerRadius={70}
                          outerRadius={150}
                          paddingAngle={2}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={false}
                        >
                          {sectorData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke="#181A20"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const percent = (value / totalEmissions * 100).toFixed(1)
                            return [`${value.toFixed(2)}M t CO₂e (${percent}%)`, name]
                          }}
                          contentStyle={{
                            backgroundColor: '#181A20',
                            border: '2px solid #C6FF3F',
                            borderRadius: '8px',
                            color: '#F5F7FB',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            padding: '10px',
                          }}
                          labelStyle={{ color: '#C6FF3F', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}
                          itemStyle={{ color: '#F5F7FB', fontSize: '13px', fontWeight: 'bold', padding: '2px 0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 text-xs">
                    {sectorData.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-text-primary truncate">{s.name}</div>
                          <div className="text-text-secondary">{(s.value / totalEmissions * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()
          )}
        </div>
        {sectorData.length > 0 && (() => {
          const totalEmissions = sectorData.reduce((sum, d) => sum + d.value, 0)
          return (
            <Card variant="teal" className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-accent-teal mb-3 sm:mb-4">Sectoral Proportion Breakdown ({selectedYear})</h3>
              <div className="space-y-2 sm:space-y-3 text-text-secondary text-sm sm:text-base">
                {sectorData.length >= 2 && (
                  <p className="text-lg leading-relaxed">
                    <strong className="text-accent-primary">Dominant Sectors:</strong> I found that {sectorData[0]?.name} contributes{' '}
                    {((sectorData[0]?.value || 0) / totalEmissions * 100).toFixed(1)}% of total emissions, followed by {sectorData[1]?.name} at{' '}
                    {((sectorData[1]?.value || 0) / totalEmissions * 100).toFixed(1)}%. Together, these two sectors account for{' '}
                    {(((sectorData[0]?.value || 0) + (sectorData[1]?.value || 0)) / totalEmissions * 100).toFixed(1)}% of total national emissions in {selectedYear}, 
                    highlighting the concentration of emissions in energy-related industries.
                  </p>
                )}
                <p className="leading-relaxed">
                  <strong className="text-accent-primary">Complete Breakdown:</strong> My analysis shows {sectorData.slice(0, 3).map((s, idx) => (
                    <span key={idx}>
                      {s.name} ({(s.value / totalEmissions * 100).toFixed(1)}%){idx < Math.min(2, sectorData.length - 1) ? ', ' : idx === 2 && sectorData.length > 3 ? ', ' : ''}
                    </span>
                  ))}
                  {sectorData.length > 3 && `, and others. I found that the sectors shown represent the vast majority of reported direct emissions.`}
                </p>
                <p className="leading-relaxed">
                  <strong className="text-accent-primary">Policy Implications:</strong> I believe the high concentration 
                  in a few sectors suggests that targeted regulatory and technological interventions in these 
                  industries could yield substantial emissions reductions.
                </p>
              </div>
            </Card>
          )
        })()}
      </div>
    </Section>
  )
}

