import Section from './Section'

const outputFiles = [
  {
    name: 'ghg_all_years_clean.csv',
    description: 'Facility-level dataset with all years, standardized columns and cleaned values',
  },
  {
    name: 'ghg_state_year.csv',
    description: 'State-year aggregates: total emissions, facility counts, and gas breakdowns by state and year',
  },
  {
    name: 'ghg_sector_year.csv',
    description: 'Sector-year aggregates: total emissions, facility counts, and gas breakdowns by sector and year',
  },
  {
    name: 'similarity_states.csv',
    description: 'Cosine similarity matrix for state emission profiles (features: totals, means, gas shares, sector mix)',
  },
  {
    name: 'similarity_sectors.csv',
    description: 'Cosine similarity matrix for sector emission profiles',
  },
]

export default function TransformationSection() {
  return (
    <Section id="transformation">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Data Transformation and Aggregation</h2>
        <div className="space-y-6">
          <p className="text-lg text-text-secondary leading-relaxed">
            To support different types of analysis, I created several derived datasets through aggregation 
            and feature engineering:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-bg-card rounded-lg p-5 border border-accent-primary/20 hover:border-accent-primary/50 transition-all"
              >
                <div className="text-accent-teal font-semibold mb-2 text-sm">{file.name}</div>
                <div className="text-sm text-text-secondary">{file.description}</div>
              </div>
            ))}
          </div>
          <div className="bg-bg-card rounded-lg p-6 border border-accent-teal/20">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Purpose of Derived Datasets</h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">State-year and sector-year aggregates</strong> enable 
                  time-series trend analysis and identification of top contributors
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Similarity matrices</strong> support advanced analysis 
                  to identify states and sectors with similar emission profiles using cosine similarity
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Feature engineering</strong> created normalized vectors 
                  (total emissions, mean per facility, gas shares, sector composition) for similarity computation
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}



