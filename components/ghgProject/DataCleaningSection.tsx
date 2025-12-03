import Section from './Section'
import { Card } from '@/components/ui/Card'

const pipelineSteps = [
  { stage: 'Raw Excel Files', description: '14 annual Excel files with varying headers and sheet structures' },
  { stage: 'Clean Columns', description: 'Standardized 38+ column name variations to consistent schema' },
  { stage: 'Standardized States', description: 'Normalized state names to 2-letter codes (e.g., "Texas" → "TX")' },
  { stage: 'Clean Emissions', description: 'Converted to numeric, handled missing/negative values, validated ranges' },
  { stage: 'Final Dataset', description: 'Consistent types, units, and complete facility identifiers' },
]

export default function DataCleaningSection() {
  return (
    <Section id="cleaning">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Data Cleaning and Preparation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-lg text-text-secondary leading-relaxed">
              I found that the raw EPA GHGRP files required extensive cleaning to create a unified, analysis-ready dataset. 
              I performed the following steps:
            </p>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Imported 14 Excel files and unified sheet/header detection across years</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Standardized column names (38+ variations mapped to a consistent schema)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Normalized state information (full names → 2-letter codes, handled variations)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Converted emissions fields to numeric, handled missing and negative values</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Removed rows with missing facility IDs and invalid coordinates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Ensured final dataset has consistent types and units across all years</span>
              </li>
            </ul>
          </div>
          <div className="bg-bg-card rounded-lg p-6 border border-accent-teal/20">
            <h3 className="text-xl font-semibold text-accent-teal mb-6">Cleaning Pipeline</h3>
            <div className="space-y-4">
              {pipelineSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-accent-primary mb-1">{step.stage}</div>
                    <div className="text-sm text-text-secondary">{step.description}</div>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className="absolute left-4 mt-8 w-0.5 h-4 bg-accent-teal/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-6 border border-accent-primary/10">
          <h3 className="text-lg font-semibold text-accent-primary mb-3">Column Name Standardization Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted mb-2">Before (variations found):</p>
              <ul className="space-y-1 text-text-secondary">
                <li>• &quot;Total Reported Direct Emissions&quot;</li>
                <li>• &quot;Total Direct Emissions&quot;</li>
                <li>• &quot;Total Emissions (CO2e)&quot;</li>
                <li>• &quot;Total GHG Emissions&quot;</li>
              </ul>
            </div>
            <div>
              <p className="text-accent-teal mb-2">After (standardized):</p>
              <ul className="space-y-1 text-accent-primary">
                <li>• <code>total_emissions</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Missing Value Handling Strategy */}
        <Card variant="teal" className="p-6 mt-8">
          <h3 className="text-2xl font-semibold text-accent-teal mb-4">Missing Value Handling Strategy</h3>
          <div className="space-y-4">
            <p className="text-text-secondary leading-relaxed">
              During data cleaning, I identified missing values in several columns. My handling strategy was 
              tailored to the importance and meaning of each column:
            </p>
            
            <div className="space-y-3">
              <div className="bg-bg-card rounded-lg p-4 border border-accent-teal/20">
                <h4 className="font-semibold text-accent-primary mb-2">1. Critical Identifiers</h4>
                <p className="text-sm text-text-secondary">
                  <strong className="text-accent-teal">facility_id:</strong> Rows with missing facility_id were 
                  dropped using <code className="text-accent-primary">df.dropna(subset=['facility_id'])</code> because 
                  the facility identifier is required for all analyses and cannot be inferred or filled.
                </p>
              </div>

              <div className="bg-bg-card rounded-lg p-4 border border-accent-teal/20">
                <h4 className="font-semibold text-accent-primary mb-2">2. Emissions Columns</h4>
                <p className="text-sm text-text-secondary mb-2">
                  For all emissions columns (<code className="text-accent-teal">total_reported_direct_emissions</code>, 
                  <code className="text-accent-teal">co2_emissions_non_biogenic</code>, 
                  <code className="text-accent-teal">ch4_emissions</code>, 
                  <code className="text-accent-teal">n2o_emissions</code>), missing values were filled with 0 using:
                </p>
                <div className="bg-bg-body rounded p-2 mt-2">
                  <code className="text-xs text-text-secondary">
                    series = pd.to_numeric(series, errors='coerce')<br />
                    series = series.fillna(0)
                  </code>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  <strong className="text-accent-primary">Rationale:</strong> If a facility does not report emissions 
                  for a specific gas type, it is reasonable to assume zero emissions rather than imputing a value. 
                  This is consistent with EPA reporting practices where facilities only report gases they emit.
                </p>
              </div>

              <div className="bg-bg-card rounded-lg p-4 border border-accent-teal/20">
                <h4 className="font-semibold text-accent-primary mb-2">3. Non-Critical Columns</h4>
                <p className="text-sm text-text-secondary">
                  Missing values in <code className="text-accent-teal">city</code>, <code className="text-accent-teal">latitude</code>, 
                  and <code className="text-accent-teal">longitude</code> were left as NaN because these columns are not 
                  used in the core emissions analysis. They are available for future geographic analysis but do not affect 
                  the current statistical and visualization work.
                </p>
              </div>
            </div>

            <Card variant="alt" className="p-4 mt-4">
              <p className="text-sm text-text-secondary">
                <strong className="text-accent-primary">Summary:</strong> My missing value handling approach prioritizes 
                data integrity for critical analysis columns (facility_id, emissions) while preserving information in 
                non-critical fields. This strategy ensures that all facility-year records used in my analysis have complete 
                identifier and emissions data, while maintaining transparency about data completeness.
              </p>
            </Card>
          </div>
        </Card>
      </div>
    </Section>
  )
}



