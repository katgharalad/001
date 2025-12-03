'use client'

import Section from './Section'
import { useRelationshipData } from '@/hooks/useRelationshipData'
import { useYear } from '@/contexts/YearContext'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

const sectorColors: Record<string, string> = {
  'Power Plants': '#C6FF3F',
  'Petroleum & Natural Gas': '#4DE2C2',
  'Petroleum and Natural Gas Systems': '#4DE2C2',
  'Refineries': '#FFB347',
  'Chemicals': '#FF4D73',
}

// Custom shape for scatter points
const renderScatterPoint = (props: any) => {
  const { cx, cy, payload } = props
  const color = sectorColors[payload.sector] || '#2E86AB'
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#181A20"
      strokeWidth={1}
      opacity={0.8}
    />
  )
}

export default function RelationshipSection() {
  const { selectedYear } = useYear()
  const { data: scatterData, loading } = useRelationshipData(selectedYear)
  
  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    if (scatterData.length < 2) return null
    const n = scatterData.length
    const sumX = scatterData.reduce((sum, d) => sum + d.co2, 0)
    const sumY = scatterData.reduce((sum, d) => sum + d.ch4, 0)
    const sumXY = scatterData.reduce((sum, d) => sum + d.co2 * d.ch4, 0)
    const sumX2 = scatterData.reduce((sum, d) => sum + d.co2 * d.co2, 0)
    const sumY2 = scatterData.reduce((sum, d) => sum + d.ch4 * d.ch4, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    if (denominator === 0) return null
    return numerator / denominator
  }
  
  const correlation = calculateCorrelation()
  const nFacilities = scatterData.length
  
  // Calculate domains from data with safe defaults
  const xValues = scatterData.length > 0 ? scatterData.map(d => d.co2).filter(v => v > 0) : []
  const yValues = scatterData.length > 0 ? scatterData.map(d => d.ch4).filter(v => v > 0) : []
  
  const xMin = xValues.length > 0 ? Math.min(...xValues) : 0.001
  const xMax = xValues.length > 0 ? Math.max(...xValues) : 100
  const yMin = yValues.length > 0 ? Math.min(...yValues) : 0.001
  const yMax = yValues.length > 0 ? Math.max(...yValues) : 10
  
  // For log scale, ensure minimum values are positive and add padding
  const xDomainMin = Math.max(xMin * 0.8, 0.001)
  const xDomainMax = xMax > 0 ? xMax * 1.2 : 100
  const yDomainMin = Math.max(yMin * 0.8, 0.001)
  const yDomainMax = yMax > 0 ? yMax * 1.2 : 10
  
  return (
    <Section id="relationship">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary">Relationship Between CO₂ and CH₄ Emissions ({selectedYear})</h2>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-accent-teal/70 bg-bg-card/80 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-accent-primary">
              Relationship Between CO₂ and CH₄ Emissions ({selectedYear})
            </h3>
            {correlation !== null && scatterData.length > 0 && (
              <div className="flex gap-3 text-sm">
                <span className="rounded-full bg-accent-orange/20 border border-accent-orange px-3 py-1 text-accent-orange">
                  Correlation: {correlation.toFixed(3)}
                </span>
                <span className="rounded-full bg-accent-blue/20 border border-accent-blue px-3 py-1 text-accent-blue">
                  Facilities: {nFacilities.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">Loading chart data...</div>
          ) : scatterData.length === 0 ? (
            <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-text-secondary">No relationship data available</div>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="95%" height={280} className="min-h-[250px] sm:min-h-[280px] lg:min-h-[300px] max-h-[320px]">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    dataKey="co2" 
                    name="CO₂ emissions" 
                    unit=" Mt CO₂e"
                    stroke="#9BA0B5" 
                    tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                    scale="log"
                    domain={[xDomainMin, xDomainMax]}
                    allowDataOverflow={false}
                    label={{ value: 'CO₂ Emissions (Million Metric Tons CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="ch4" 
                    name="CH₄ emissions" 
                    unit=" Mt CO₂e"
                    stroke="#9BA0B5" 
                    tick={{ fill: '#9BA0B5', fontSize: 10, fontWeight: 'bold' }}
                    scale="log"
                    domain={[yDomainMin, yDomainMax]}
                    allowDataOverflow={false}
                    label={{ value: 'CH₄ Emissions (Million Metric Tons CO₂e)', angle: -90, position: 'insideLeft', style: { fill: '#9BA0B5', fontSize: 11, fontWeight: 'bold' } }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
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
                    formatter={(value: number, name: string) => [`${value.toFixed(2)} M t CO₂e`, name]}
                  />
                  <Scatter 
                    name="Facilities" 
                    data={scatterData} 
                    fill="#2E86AB" 
                    shape={renderScatterPoint}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <Card variant="teal" className="p-6">
          <h3 className="text-xl font-semibold text-accent-teal mb-4">Relationship Interpretation</h3>
          <div className="space-y-3 text-text-secondary">
            <p className="text-lg leading-relaxed">
              <strong className="text-accent-primary">Relationship Strength:</strong> I found a{' '}
              {correlation !== null && Math.abs(correlation) > 0.7 ? 'strong' : correlation !== null && Math.abs(correlation) > 0.4 ? 'moderate' : 'weak'}
              {' '}positive relationship between CO₂ and CH₄ emissions (r ≈ {correlation !== null ? correlation.toFixed(2) : 'N/A'}), 
              though the relationship is not perfectly linear. I observed that facilities with high CO₂ emissions tend to have higher CH₄ emissions, 
              but the ratio varies significantly by sector.
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Sector Clustering:</strong> I found that certain sectors cluster 
              in distinct regions of the scatter plot. <strong className="text-accent-teal">Petroleum & 
              Natural Gas</strong> facilities show higher CH₄-to-CO₂ ratios, reflecting methane leakage and 
              venting in extraction and processing operations. <strong className="text-accent-primary">Power 
              Plants</strong> tend to have higher CO₂ relative to CH₄, as they primarily burn fossil fuels 
              for electricity generation.
            </p>
            <p className="leading-relaxed">
              <strong className="text-accent-primary">Analytical Observation:</strong> I believe the sector-based 
              clustering suggests that emission reduction strategies should be tailored to sector-specific 
              characteristics, particularly for methane mitigation in the petroleum and natural gas sector.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}

