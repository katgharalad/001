'use client'

import Section from './Section'
import { useNationalTrend } from '@/hooks/useGhgData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

export default function NationalTrendSection() {
  const { data, loading } = useNationalTrend()

  const firstYear = data[0]
  const lastYear = data[data.length - 1]
  const percentChange = firstYear && lastYear
    ? ((lastYear.emissions - firstYear.emissions) / firstYear.emissions * 100).toFixed(1)
    : '0'

  return (
    <Section id="trends">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">National Emissions Trend (2010–2023)</h2>
        </div>
        <Card className="p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-accent-primary mb-4 text-center" style={{ fontSize: '15px', fontWeight: 'bold', paddingBottom: '20px' }}>
            US Total Greenhouse Gas Emissions Over Time (2010-2023)
          </h3>
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : data.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No trend data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] max-h-[400px]">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                <XAxis 
                  dataKey="year" 
                  stroke="#9BA0B5"
                  tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                />
                <YAxis 
                  stroke="#9BA0B5"
                  tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                  label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', angle: -90, position: 'insideLeft', style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181A20',
                    border: '1px solid #2E86AB',
                    borderRadius: '8px',
                    color: '#F5F7FB',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                  labelStyle={{ color: '#2E86AB', fontWeight: 'bold', fontSize: '13px' }}
                  itemStyle={{ color: '#F5F7FB', fontSize: '13px', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value.toFixed(2)} Million MT CO₂e`, 'Emissions']}
                />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="#2E86AB"
                  strokeWidth={2}
                  dot={{ fill: '#2E86AB', r: 8 }}
                  activeDot={{ r: 10 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        {data.length > 0 && firstYear && lastYear && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">{firstYear.year} Emissions</div>
              <div className="text-2xl font-bold text-accent-primary">{firstYear.emissions.toFixed(2)} M t</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">{lastYear.year} Emissions</div>
              <div className="text-2xl font-bold text-accent-primary">{lastYear.emissions.toFixed(2)} M t</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-text-secondary mb-1">Percent Change</div>
              <div className={`text-2xl font-bold ${parseFloat(percentChange) < 0 ? 'text-accent-teal' : 'text-accent-orange'}`}>
                {percentChange}%
              </div>
            </Card>
          </div>
        )}
        {/* Direct Interpretation */}
        <Card variant="teal" className="p-6">
          <h3 className="text-xl font-semibold text-accent-teal mb-4">Trend Interpretation</h3>
          <div className="space-y-3 text-text-secondary">
            {firstYear && lastYear && (
            <p className="text-lg leading-relaxed">
              <strong className="text-accent-primary">Overall Direction:</strong> From {firstYear.year} to {lastYear.year}, 
              I found that national reported direct emissions {parseFloat(percentChange) < 0 ? 'decreased' : 'increased'} by approximately 
              {` ${Math.abs(parseFloat(percentChange))}%`}, from {firstYear.emissions.toFixed(2)} million metric tons CO₂e 
              to {lastYear.emissions.toFixed(2)} million metric tons CO₂e.
            </p>
            )}
            {data.length > 0 && (
              <p className="leading-relaxed">
                <strong className="text-accent-primary">Major Changes:</strong> {data.some(d => d.year === 2020) 
                  ? 'I observed a noticeable dip around 2020, likely related to economic impacts and reduced industrial activity during the COVID-19 pandemic, followed by a partial rebound in subsequent years. ' 
                  : 'My analysis shows various fluctuations over the period, reflecting economic and industrial changes. '}
                {data.some(d => d.year >= 2015 && d.year <= 2017) && 'I found that between 2015 and 2017, emissions showed relative stability, '}
                {data.some(d => d.year >= 2018) && 'with more recent years showing continued variation based on economic conditions and policy changes.'}
              </p>
            )}
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Trend Pattern:</strong> I observed that the {parseFloat(percentChange) < 0 ? 'decline' : 'change'} 
              is {parseFloat(percentChange) < 0 ? 'gradual but consistent' : 'observable'} over the 14-year period, suggesting 
              long-term structural changes in the US industrial emissions profile. I believe this pattern is likely driven by fuel switching 
              (from coal to natural gas), efficiency improvements in industrial processes, and regulatory measures such as emissions 
              standards and carbon pricing mechanisms in some states.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}

