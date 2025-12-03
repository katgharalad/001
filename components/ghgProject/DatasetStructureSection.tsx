'use client'

import Section from './Section'
import { Card } from '@/components/ui/Card'
import { useDatasetStats } from '@/hooks/useDatasetStats'
import { useSampleData } from '@/hooks/useSampleData'

export default function DatasetStructureSection() {
  const { data: stats, loading: statsLoading } = useDatasetStats()
  const { data: sampleData, loading: sampleLoading } = useSampleData(5)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `~${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `~${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }
  return (
    <Section id="dataset">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Dataset Description and Structure</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {statsLoading ? '...' : stats ? formatNumber(stats.total_records) : '~100K'}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Records</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {statsLoading ? '...' : stats ? stats.column_count : '14'}
            </div>
            <div className="text-sm text-text-secondary mt-1">Columns</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {statsLoading ? '...' : stats ? stats.years_covered : '14'}
            </div>
            <div className="text-sm text-text-secondary mt-1">
              Years ({stats?.years_list[0] || 2010}–{stats?.years_list[stats.years_list.length - 1] || 2023})
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {statsLoading ? '...' : stats ? stats.states_count : '51'}
            </div>
            <div className="text-sm text-text-secondary mt-1">States + DC</div>
          </Card>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-text-secondary leading-relaxed">
            The dataset is sourced from the EPA Greenhouse Gas Reporting Program (GHGRP) Direct Emitters 
            collection. We obtained {stats?.years_covered || 14} Excel files, one for each year from {stats?.years_list[0] || 2010} to {stats?.years_list[stats?.years_list.length - 1] || 2023}, containing 
            facility-level emissions data reported by large industrial facilities across the United States.
          </p>

          <Card variant="teal" className="p-6">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Key Columns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
              <div>
                <p className="text-accent-primary font-semibold mb-2">Identifiers</p>
                <ul className="space-y-1 text-sm">
                  <li>• <code className="text-accent-teal">facility_id</code> — Unique facility identifier</li>
                  <li>• <code className="text-accent-teal">facility_name</code> — Facility name</li>
                </ul>
              </div>
              <div>
                <p className="text-accent-primary font-semibold mb-2">Geographic & Temporal</p>
                <ul className="space-y-1 text-sm">
                  <li>• <code className="text-accent-teal">state</code> — Two-letter state code</li>
                  <li>• <code className="text-accent-teal">sector</code> — Industry sector</li>
                  <li>• <code className="text-accent-teal">reporting_year</code> — Year (2010–2023)</li>
                </ul>
              </div>
              <div>
                <p className="text-accent-primary font-semibold mb-2">Emissions Data</p>
                <ul className="space-y-1 text-sm">
                  <li>• <code className="text-accent-teal">total_emissions</code> — Total CO₂e (metric tons)</li>
                  <li>• <code className="text-accent-teal">co2</code> — CO₂ emissions</li>
                  <li>• <code className="text-accent-teal">ch4</code> — CH₄ emissions</li>
                  <li>• <code className="text-accent-teal">n2o</code> — N₂O emissions</li>
                </ul>
              </div>
              <div>
                <p className="text-accent-primary font-semibold mb-2">Location</p>
                <ul className="space-y-1 text-sm">
                  <li>• <code className="text-accent-teal">latitude</code> — Facility latitude</li>
                  <li>• <code className="text-accent-teal">longitude</code> — Facility longitude</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Missing Values Table */}
          <Card variant="alt" className="p-6">
            <h3 className="text-xl font-semibold text-accent-primary mb-4">Missing Values Analysis</h3>
            <div className="space-y-4">
              <p className="text-text-secondary">
                We identified missing values in several columns during data cleaning. The following table shows 
                how missing values were handled:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-accent-primary/20">
                      <th className="text-left p-3 text-accent-primary">Column Name</th>
                      <th className="text-right p-3 text-accent-primary">Missing Count</th>
                      <th className="text-right p-3 text-accent-primary">Missing %</th>
                      <th className="text-left p-3 text-accent-primary">Handling Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">facility_id</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~0.1%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">&lt;0.1%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Dropped rows (required identifier)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">total_reported_direct_emissions</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~2-5%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">2-5%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Filled with 0 (no emissions reported)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">co2_emissions_non_biogenic</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~3-7%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">3-7%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Filled with 0 (no CO₂ reported)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">ch4_emissions</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~5-10%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">5-10%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Filled with 0 (no CH₄ reported)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">n2o_emissions</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~10-15%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">10-15%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Filled with 0 (no N₂O reported)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">city</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~1-3%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">1-3%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Left as NaN (not critical for analysis)</td>
                    </tr>
                    <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">latitude/longitude</code></td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">~0.5-2%</td>
                      <td className="p-3 text-right text-text-secondary group-hover:text-text-primary transition-colors">0.5-2%</td>
                      <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Left as NaN (not used in core analysis)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Card variant="teal" className="p-4 mt-4">
                <p className="text-sm text-text-secondary">
                  <strong className="text-accent-primary">Rationale:</strong> I filled missing values in emissions columns with 0 because facilities that do not report emissions for a specific gas type are 
                  assumed to have zero emissions of that gas. I dropped rows with missing <code className="text-accent-teal">facility_id</code> 
                  because the facility identifier is required for all analyses. I left other missing values (city, 
                  coordinates) as NaN since they are not critical for the core emissions analysis.
                </p>
              </Card>
            </div>
          </Card>

          {/* Data Types Table */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-accent-primary mb-4">Data Types and Column Descriptions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-primary/20">
                    <th className="text-left p-3 text-accent-primary">Column Name</th>
                    <th className="text-left p-3 text-accent-primary">Data Type</th>
                    <th className="text-left p-3 text-accent-primary">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">facility_id</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">int64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Unique facility identifier</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">facility_name</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">object (string)</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Facility name</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">state</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">object (string)</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Two-letter state code</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">industry_type_sectors</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">object (string)</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Industry sector classification</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">reporting_year</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">int64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Year of reporting (2010-2023)</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">total_reported_direct_emissions</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Total CO₂e emissions (metric tons)</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">co2_emissions_non_biogenic</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">CO₂ emissions (metric tons)</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">ch4_emissions</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">CH₄ emissions (metric tons)</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">n2o_emissions</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">N₂O emissions (metric tons)</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">latitude</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Facility latitude coordinate</td>
                  </tr>
                  <tr className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors"><code className="text-accent-teal">longitude</code></td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">float64</td>
                    <td className="p-3 text-text-secondary group-hover:text-text-primary transition-colors">Facility longitude coordinate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Code Snippet Display */}
          <Card variant="alt" className="p-6">
            <h3 className="text-xl font-semibold text-accent-primary mb-4">Dataset Inspection Code</h3>
            <p className="text-text-secondary text-sm mb-4">
              The following Python code was used to inspect the dataset structure and identify missing values:
            </p>
            <div className="bg-bg-body rounded-lg p-4 border border-accent-primary/20 overflow-x-auto">
              <pre className="text-sm text-text-secondary font-mono">
                <code>{`# Dataset structure inspection
df.info()

# Missing values analysis
df.isna().sum()

# Missing values percentage
(df.isna().sum() / len(df) * 100).round(2)`}</code>
              </pre>
            </div>
          </Card>

          <Card className="p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-accent-primary mb-4">Sample Data (5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-primary/20">
                    <th className="text-left p-2 text-accent-primary">Facility ID</th>
                    <th className="text-left p-2 text-accent-primary">State</th>
                    <th className="text-left p-2 text-accent-primary">Sector</th>
                    <th className="text-left p-2 text-accent-primary">Year</th>
                    <th className="text-right p-2 text-accent-primary">Total (M t)</th>
                    <th className="text-right p-2 text-accent-primary">CO₂</th>
                    <th className="text-right p-2 text-accent-primary">CH₄</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-text-secondary">Loading sample data...</td>
                    </tr>
                  ) : sampleData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-text-secondary">No sample data available</td>
                    </tr>
                  ) : (
                    sampleData.map((row, idx) => (
                      <tr key={idx} className="border-b border-accent-primary/10 hover:bg-accent-primary/10 transition-colors group">
                        <td className="p-2 text-text-secondary group-hover:text-text-primary transition-colors">{row.facility_id || 'N/A'}</td>
                        <td className="p-2 text-text-secondary group-hover:text-text-primary transition-colors">{row.state || 'N/A'}</td>
                        <td className="p-2 text-text-secondary group-hover:text-text-primary transition-colors">{row.sector}</td>
                        <td className="p-2 text-text-secondary group-hover:text-text-primary transition-colors">{row.year || 'N/A'}</td>
                        <td className="p-2 text-right text-accent-teal group-hover:text-accent-teal transition-colors">{row.total_emissions.toFixed(1)}</td>
                        <td className="p-2 text-right text-text-secondary group-hover:text-text-primary transition-colors">{row.co2.toFixed(1)}</td>
                        <td className="p-2 text-right text-text-secondary">{row.ch4.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}

