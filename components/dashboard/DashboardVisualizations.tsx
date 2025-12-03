'use client'

import { useYear } from '@/contexts/YearContext'
import { Card } from '@/components/ui/Card'
import { useNationalTrend } from '@/hooks/useGhgData'
import { useTopStates } from '@/hooks/useGhgData'
import { useTopSectors } from '@/hooks/useGhgData'
import { useDistributionData } from '@/hooks/useDistributionData'
import { useRelationshipData } from '@/hooks/useRelationshipData'
import { useProportionData } from '@/hooks/useProportionData'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

export default function DashboardVisualizations() {
  const { selectedYear } = useYear()
  
  // Fetch all data
  const { data: trendData = [] } = useNationalTrend()
  const { data: topStates = [] } = useTopStates(selectedYear)
  const { data: topSectors = [] } = useTopSectors(selectedYear)
  const { linearData, logData, loading: distributionLoading } = useDistributionData(selectedYear)
  const { data: relationshipData = [], loading: relationshipLoading } = useRelationshipData(selectedYear)
  const { data: proportionData = [], loading: proportionLoading } = useProportionData(selectedYear)

  // Calculate correlation for scatter plot
  const calculateCorrelation = () => {
    if (relationshipData.length < 2) return null
    const n = relationshipData.length
    const sumX = relationshipData.reduce((sum, d) => sum + d.co2, 0)
    const sumY = relationshipData.reduce((sum, d) => sum + d.ch4, 0)
    const sumXY = relationshipData.reduce((sum, d) => sum + d.co2 * d.ch4, 0)
    const sumX2 = relationshipData.reduce((sum, d) => sum + d.co2 * d.co2, 0)
    const sumY2 = relationshipData.reduce((sum, d) => sum + d.ch4 * d.ch4, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    if (denominator === 0) return null
    return numerator / denominator
  }

  const correlation = calculateCorrelation()

  // Calculate domains for scatter plot
  const xValues = relationshipData.length > 0 ? relationshipData.map(d => d.co2).filter(v => v > 0) : []
  const yValues = relationshipData.length > 0 ? relationshipData.map(d => d.ch4).filter(v => v > 0) : []
  const xMin = xValues.length > 0 ? Math.min(...xValues) : 0.001
  const xMax = xValues.length > 0 ? Math.max(...xValues) : 100
  const yMin = yValues.length > 0 ? Math.min(...yValues) : 0.001
  const yMax = yValues.length > 0 ? Math.max(...yValues) : 10
  const xDomainMin = Math.max(xMin * 0.8, 0.001)
  const xDomainMax = xMax > 0 ? xMax * 1.2 : 100
  const yDomainMin = Math.max(yMin * 0.8, 0.001)
  const yDomainMax = yMax > 0 ? yMax * 1.2 : 10

  // Colors for pie chart
  const sectorColors: Record<string, string> = {
    'Power Plants': '#C6FF3F',
    'Petroleum & Natural Gas': '#4DE2C2',
    'Petroleum and Natural Gas Systems': '#4DE2C2',
    'Refineries': '#FFB347',
    'Chemicals': '#FF4D73',
    'Minerals': '#FFD700',
    'Waste': '#9B59B6',
    'Metals': '#3498DB',
    'Other': '#95A5A6',
  }

  const set3Colors = [
    '#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3',
    '#FDB462', '#B3DE69', '#FCCDE5', '#D9D9D9', '#BC80BD'
  ]

  return (
    <div className="space-y-6">
      {/* Visualization 1: Trend Over Time (Line Plot) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-accent-primary mb-4">Visualization 1: Trend Over Time (2010–2023)</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                stroke="#9BA0B5"
                tick={{ fill: '#9BA0B5', fontSize: 12, fontWeight: 'bold' }}
                label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 13, fontWeight: 'bold' } }}
              />
              <YAxis 
                stroke="#9BA0B5"
                tick={{ fill: '#9BA0B5', fontSize: 12, fontWeight: 'bold' }}
                label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', angle: -90, position: 'insideLeft', style: { fill: '#9BA0B5', fontSize: 13, fontWeight: 'bold' } }}
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
                strokeWidth={3}
                dot={{ fill: '#2E86AB', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-text-secondary mt-4 text-sm">
          <strong>Interpretation:</strong> This line chart shows the overall trend of US greenhouse gas emissions from 2010 to 2023. 
          The data reveals a general decline over the period, with notable fluctuations including a dip around 2020 likely related to 
          COVID-19 economic impacts.
        </p>
      </Card>

      {/* Visualization 2: Top 5 States (Bar Chart) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-accent-primary mb-4">Visualization 2: Top 5 States by Total Emissions ({selectedYear})</h2>
        {topStates.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-text-secondary">Loading state data...</div>
        ) : (
          <>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStates} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    stroke="#9BA0B5" 
                    tick={{ fill: '#9BA0B5', fontSize: 12 }}
                    label={{ value: 'Total Emissions (Million Metric Tons CO₂e)', position: 'insideBottom', offset: -5, style: { fill: '#9BA0B5', fontSize: 13, fontWeight: 'bold' } }}
                  />
                  <YAxis 
                    dataKey="state" 
                    type="category" 
                    stroke="#9BA0B5" 
                    tick={{ fill: '#9BA0B5', fontSize: 13, fontWeight: 'bold' }} 
                    width={80}
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
                    {topStates.map((entry, index) => {
                      const viridisColors = ['#440154', '#31688e', '#35b779', '#6ece58', '#fde725']
                      return (
                        <Cell key={`cell-${index}`} fill={viridisColors[index] || viridisColors[0]} stroke="black" strokeWidth={1.5} />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-text-secondary mt-4 text-sm">
              <strong>Interpretation:</strong> The horizontal bar chart shows the geographic concentration of emissions, with Texas leading by a significant margin. 
              The top 5 states account for over 40% of total US emissions, demonstrating that emissions are highly concentrated in specific industrial regions.
            </p>
          </>
        )}
      </Card>

      {/* Visualization 3: Distribution (Histogram - Linear and Log) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-accent-primary mb-4">Visualization 3: Distribution of Facility Emissions ({selectedYear})</h2>
        {distributionLoading || linearData.length === 0 || logData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-text-secondary">Loading distribution data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linear Scale */}
          <div>
            <h3 className="text-lg font-semibold text-accent-teal mb-3 text-center">
              Distribution (Linear Scale)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
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
                    formatter={(value: number) => [value, 'Facilities']}
                    labelFormatter={(label) => `Bin: ${label} M t CO₂e`}
                  />
                  <Bar dataKey="count" fill="#2E86AB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Log Scale */}
          <div>
            <h3 className="text-lg font-semibold text-accent-teal mb-3 text-center">
              Distribution (Log Scale)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={logData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5D6273" opacity={0.3} />
                  <XAxis 
                    dataKey="bin" 
                    stroke="#9BA0B5" 
                    scale="log"
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
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(value: number) => [value, 'Facilities']}
                    labelFormatter={(label) => `Bin: ${label} M t CO₂e`}
                  />
                  <Bar dataKey="count" fill="#A23B72" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        )}
        <p className="text-text-secondary mt-4 text-sm">
          <strong>Interpretation:</strong> The distribution of facility emissions is highly right-skewed, with many small facilities and a few very large ones. 
          The log scale reveals patterns across the full range of emissions values, showing that most facilities are relatively small emitters while 
          aggregate impact is driven by a small number of very large facilities.
        </p>
      </Card>

      {/* Visualization 4: Relationship (Scatter Plot - CO2 vs CH4) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-accent-primary mb-4">
          Visualization 4: Relationship Between CO₂ and CH₄ Emissions ({selectedYear})
          {correlation !== null && (
            <span className="ml-4 text-lg font-normal text-accent-teal">
              (Correlation: {correlation.toFixed(3)})
            </span>
          )}
        </h2>
        {relationshipLoading || relationshipData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-text-secondary">Loading relationship data...</div>
        ) : (
          <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
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
                data={relationshipData} 
                fill="#2E86AB" 
                shape={(props: any) => {
                  const { cx, cy } = props
                  return <circle cx={cx} cy={cy} r={4} fill="#2E86AB" stroke="#181A20" strokeWidth={1} opacity={0.7} />
                }}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        )}
        <p className="text-text-secondary mt-4 text-sm">
          <strong>Interpretation:</strong> The scatter plot shows a positive correlation between CO₂ and CH₄ emissions, indicating that facilities with 
          higher CO₂ emissions tend to also have higher CH₄ emissions. However, the relationship is not perfectly linear, with some facilities showing 
          high CH₄ relative to CO₂ (particularly in petroleum and natural gas systems) and others showing high CO₂ with relatively low CH₄ (power plants).
        </p>
      </Card>

      {/* Visualization 5: Proportions (Pie Chart - by sector) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-accent-primary mb-4">Visualization 5: Emissions Distribution by Sector ({selectedYear})</h2>
        {proportionLoading || proportionData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-text-secondary">Loading sector data...</div>
        ) : (
          <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={proportionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (percent < 0.05) return ''
                  return `${name}: ${(percent * 100).toFixed(1)}%`
                }}
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {proportionData.map((entry, index) => {
                  const color = sectorColors[entry.name] || set3Colors[index % set3Colors.length]
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={color}
                      stroke="#181A20"
                      strokeWidth={2}
                    />
                  )
                })}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  const totalEmissions = proportionData.reduce((sum, d) => sum + d.value, 0)
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
              <Legend
                wrapperStyle={{ color: '#F5F7FB', fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }}
                iconType="circle"
                formatter={(value) => value}
                iconSize={14}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        )}
        <p className="text-text-secondary mt-4 text-sm">
          <strong>Interpretation:</strong> The pie chart shows the sectoral breakdown of emissions, with Power Plants and Petroleum & Natural Gas Systems 
          dominating. A few sectors account for the majority of total emissions, highlighting opportunities for targeted emissions reduction strategies 
          in these high-emitting industries.
        </p>
      </Card>
    </div>
  )
}

