'use client'

import Section from './Section'
import { useYear } from '@/contexts/YearContext'
import { useTopSectors } from '@/hooks/useGhgData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

export default function TopSectorsSection() {
  const { selectedYear } = useYear()
  const { data, loading } = useTopSectors(selectedYear)

  const top5Percent = data.reduce((sum, sector) => sum + sector.percent, 0)

  return (
    <Section id="top-sectors">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">Top 5 Emitting Sectors in {selectedYear} by Total Emissions</h2>
        </div>
        <Card variant="teal" className="p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-accent-teal mb-4 text-center">
            Comparison of Top 5 Sectors by Total Emissions ({selectedYear})
          </h3>
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : data.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No sector data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] max-h-[400px]">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" />
                <XAxis 
                  type="number" 
                  stroke="#9BA0B5" 
                  tick={{ fill: '#9BA0B5', fontSize: 12 }}
                  label={{ value: 'Emissions (Million t CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 13, fontWeight: 'bold' } }}
                />
                <YAxis 
                  dataKey="sector" 
                  type="category" 
                  stroke="#9BA0B5" 
                  tick={{ fill: '#9BA0B5', fontSize: 11 }} 
                  width={200}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181A20',
                    border: '1px solid #4DE2C2',
                    borderRadius: '8px',
                    color: '#F5F7FB',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                  labelStyle={{ color: '#4DE2C2', fontWeight: 'bold', fontSize: '13px' }}
                  itemStyle={{ color: '#F5F7FB', fontSize: '13px', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value.toFixed(1)} M t CO₂e`, 'Emissions']}
                />
                <Bar dataKey="emissions" fill="#4DE2C2" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        {data.length > 0 && (
          <div className="space-y-6">
            {/* Explicit Ranking List */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-accent-primary mb-4">Top 5 Sectors Ranking ({selectedYear})</h3>
              <div className="space-y-2">
                {data.map((sector, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-bg-card-alt rounded-lg border border-accent-primary/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-accent-primary w-8">{sector.rank}.</span>
                      <span className="text-lg font-semibold text-accent-primary">{sector.sector}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent-teal">{sector.emissions.toFixed(1)} M t CO₂e</div>
                      <div className="text-sm text-text-secondary">{sector.percent.toFixed(1)}% of national total</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Insights */}
            <div className="space-y-3 text-text-secondary">
              <p className="text-lg">
                <strong className="text-accent-primary">Key Insight:</strong> I found that the top 5 sectors account for approximately{' '}
                <strong className="text-accent-teal">{top5Percent.toFixed(1)}%</strong> of total emissions in {selectedYear}. 
                <strong className="text-accent-primary"> {data[0]?.sector || 'Power Plants'}</strong> consistently dominates, 
                reflecting the significant role of electricity generation in US greenhouse gas emissions.
              </p>
              <p>
                <strong className="text-accent-primary">Sector Breakdown:</strong> My analysis shows that the dataset includes facilities from multiple 
                industrial sectors, with {data.slice(0, 4).map(s => s.sector).join(', ')} representing the largest contributors. 
                I believe the concentration in a few sectors suggests that targeted policy interventions in these industries could have 
                substantial impact on overall national emissions.
              </p>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

