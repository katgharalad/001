'use client'

import Section from './Section'
import { useYear } from '@/contexts/YearContext'
import { useTopStates } from '@/hooks/useGhgData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts'
import { Card } from '@/components/ui/Card'

export default function TopStatesSection() {
  const { selectedYear } = useYear()
  const { data, loading } = useTopStates(selectedYear)

  const totalEmissions = data.reduce((sum, state) => sum + state.emissions, 0)
  const top5Percent = data.reduce((sum, state) => sum + state.percent, 0)

  return (
    <Section id="top-states">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">Top 5 Emitting States in {selectedYear} by Total Emissions</h2>
        </div>
        <Card className="p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-accent-primary mb-4 text-center" style={{ fontSize: '15px', fontWeight: 'bold', paddingBottom: '20px' }}>
            Top 5 States by Total Emissions ({selectedYear})
          </h3>
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : data.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No state data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] max-h-[400px]">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                <XAxis 
                  type="number" 
                  stroke="#9BA0B5" 
                  tick={{ fill: '#9BA0B5', fontSize: 10 }}
                  label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                />
                <YAxis 
                  dataKey="state" 
                  type="category" 
                  stroke="#9BA0B5" 
                  tick={{ fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' }} 
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181A20',
                    border: '1px solid #C6FF3F',
                    borderRadius: '8px',
                    color: '#F5F7FB',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                  labelStyle={{ color: '#C6FF3F', fontWeight: 'bold', fontSize: '13px' }}
                  itemStyle={{ color: '#F5F7FB', fontSize: '13px', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value.toFixed(1)} Million MT CO₂e`, 'Emissions']}
                />
                <Bar dataKey="emissions" radius={[0, 8, 8, 0]}>
                  {data.map((entry, index) => {
                    // Viridis-like gradient colors (matching notebook)
                    const viridisColors = [
                      '#440154', // Dark purple
                      '#31688e', // Blue
                      '#35b779', // Green
                      '#6ece58', // Yellow-green
                      '#fde725', // Yellow
                    ]
                    return (
                      <Cell key={`cell-${index}`} fill={viridisColors[index] || viridisColors[0]} stroke="black" strokeWidth={1.5} />
                    )
                  })}
                  <LabelList 
                    dataKey="emissions" 
                    position="right" 
                    formatter={(value: number) => ` ${value.toFixed(1)}M`}
                    style={{ 
                      fill: '#FFFFFF', 
                      fontSize: '12px', 
                      fontWeight: 'normal'
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {data.length > 0 && (
            <div className="mt-4 text-center text-sm text-text-secondary">
              Top 5 states account for {data.reduce((sum, s) => sum + s.percent, 0).toFixed(1)}% of total US emissions
            </div>
          )}
        </Card>
        {data.length > 0 && (
          <div className="space-y-6">
            {/* Explicit Ranking List */}
            <Card variant="teal" className="p-6">
              <h3 className="text-xl font-semibold text-accent-teal mb-4">Top 5 States Ranking ({selectedYear})</h3>
              <div className="space-y-2">
                {data.map((state, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-bg-card-alt rounded-lg border border-accent-teal/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-accent-primary w-8">{state.rank}.</span>
                      <span className="text-lg font-semibold text-accent-primary">{state.state}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent-teal">{state.emissions.toFixed(1)} M t CO₂e</div>
                      <div className="text-sm text-text-secondary">{state.percent.toFixed(1)}% of national total</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Insights */}
            <div className="space-y-3 text-text-secondary">
              <p className="text-lg">
                <strong className="text-accent-primary">Key Insight:</strong> I found that these 5 states account for approximately{' '}
                <strong className="text-accent-teal">{top5Percent.toFixed(1)}%</strong> of total national emissions in {selectedYear}, 
                demonstrating significant geographic concentration of industrial greenhouse gas emissions.
              </p>
              <p>
                <strong className="text-accent-primary">Pattern:</strong> I observed that {data[0].state === 'TX' ? 'Texas (TX)' : data[0].state} 
                {data.length > 1 ? ` ranks as the top emitter, followed by ${data.slice(1, 3).map(s => s.state).join(', ')}` : ' is the top emitter'}. 
                I believe this pattern reflects the concentration of energy-intensive industries, including power generation, 
                petroleum refining, and chemical manufacturing in these states.
              </p>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

