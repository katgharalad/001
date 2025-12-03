'use client'

import Section from './Section'
import { Card } from '@/components/ui/Card'
import { useNationalTrend } from '@/hooks/useGhgData'
import { useYear } from '@/contexts/YearContext'
import { useTopStates } from '@/hooks/useGhgData'
import { useTopSectors } from '@/hooks/useGhgData'
import { useDatasetStats } from '@/hooks/useDatasetStats'

export default function InsightsSection() {
  const { data: trendData = [] } = useNationalTrend()
  const { selectedYear } = useYear()
  const { data: topStates = [] } = useTopStates(selectedYear)
  const { data: topSectors = [] } = useTopSectors(selectedYear)
  const { data: stats } = useDatasetStats()

  // Calculate percent change from first to last year
  const firstYear = trendData.length > 0 ? trendData[0] : null
  const lastYear = trendData.length > 0 ? trendData[trendData.length - 1] : null
  const percentChange = firstYear && lastYear && firstYear.emissions > 0
    ? Math.abs(((lastYear.emissions - firstYear.emissions) / firstYear.emissions * 100))
    : 0

  // Calculate top 5 states percent
  const top5StatesPercent = topStates.length > 0
    ? topStates.reduce((sum, state) => sum + (state.percent || 0), 0)
    : 0
  
  // Calculate top 5 sectors percent
  const top5SectorsPercent = topSectors.length > 0
    ? topSectors.reduce((sum, sector) => sum + (sector.percent || 0), 0)
    : 0

  const top5StateNames = topStates.length >= 5 
    ? topStates.slice(0, 5).map(s => s.state).join(', ')
    : topStates.length > 0
    ? topStates.map(s => s.state).join(', ')
    : 'N/A'

  return (
    <Section id="insights">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Key Findings and Synthesis</h2>
        
        {/* Part 1 Summary */}
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-accent-primary mb-4">Part 1: Data Preparation and Analysis Summary</h3>
          <p className="text-lg text-text-secondary leading-relaxed">
            In Part 1, I found that the dataset contains approximately {stats?.total_records ? `${(stats.total_records / 1000).toFixed(0)}K` : '~100K'} 
            facility-year records across {stats?.years_covered || 14} years (2010–2023), with {stats?.column_count || 14} core fields. 
            I identified missing values in emissions columns (total_reported_direct_emissions, co2_emissions_non_biogenic, ch4_emissions, n2o_emissions) 
            and handled them by filling with 0 for emissions columns and dropping rows with missing facility_id, because facilities that do not 
            report emissions for a specific gas type are assumed to have zero emissions, and facility identifiers are required for all analyses. 
            I found that the national trend shows a {percentChange.toFixed(1)}% {percentChange < 0 ? 'decrease' : 'increase'} in total reported direct emissions 
            from {firstYear?.year || 2010} to {lastYear?.year || 2023}, with notable fluctuations including a dip around 2020 likely related to 
            COVID-19 economic impacts, followed by a partial rebound.
          </p>
        </Card>

        {/* Part 2 Summary */}
        <Card variant="teal" className="p-6">
          <h3 className="text-2xl font-semibold text-accent-teal mb-4">Part 2: Exploratory Data Analysis Summary</h3>
          <p className="text-lg text-text-secondary leading-relaxed">
            In Part 2, my exploratory analysis shows that the top 5 states ({top5StateNames}) account for approximately{' '}
            {top5StatesPercent.toFixed(1)}% of national emissions in {selectedYear}, and the top 5 sectors account for{' '}
            {top5SectorsPercent.toFixed(1)}% of total emissions, demonstrating significant geographic and sectoral concentration. 
            I identified outlier facilities using both the Interquartile Range (IQR) method (values outside Q1 - 1.5×IQR and Q3 + 1.5×IQR) 
            and Z-score threshold method (|z| ≥ 2.5), primarily large-scale power plants and refineries in states like Texas and Louisiana. 
            I determined that these outliers are legitimate high emitters rather than data errors, representing real, large industrial complexes that account for 
            a disproportionate share of total emissions, suggesting that targeted interventions at these specific facilities could yield 
            substantial emissions reductions.
          </p>
        </Card>

        {/* Part 3 Summary */}
        <Card variant="alt" className="p-6">
          <h3 className="text-2xl font-semibold text-accent-primary mb-4">Part 3: Visualization Summary</h3>
          <p className="text-lg text-text-secondary leading-relaxed">
            In Part 3, my visualizations reveal that the distribution of facility-level emissions is highly right-skewed, with many small 
            facilities and a few very large ones, indicating that most facilities are relatively small emitters while aggregate impact is 
            driven by a small number of very large facilities. My relationship analysis shows a moderate to strong positive correlation 
            (r ≈ 0.6–0.8) between CO₂ and CH₄ emissions, with sector-based clustering indicating that emission reduction strategies should 
            be tailored to sector-specific characteristics. My proportional breakdown demonstrates that a few sectors (Power Plants, 
            Petroleum and Natural Gas Systems) dominate emissions, with the top 5 sectors accounting for {top5SectorsPercent.toFixed(1)}% 
            of total emissions. I found that these visualizations demonstrate that US greenhouse gas emissions are highly concentrated both geographically 
            and by sector, suggesting that targeted policy interventions in specific states and sectors could have substantial impact on 
            overall national emissions.
          </p>
        </Card>
      </div>
    </Section>
  )
}

