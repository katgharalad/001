import Section from './Section'
import { Card } from '@/components/ui/Card'

const tools = [
  { category: 'Language', items: ['Python 3.x'] },
  { category: 'Data Processing', items: ['Pandas', 'NumPy'] },
  { category: 'Visualization', items: ['Matplotlib', 'Chart.js', 'Recharts'] },
  { category: 'Machine Learning', items: ['Scikit-learn (cosine similarity)'] },
  { category: 'Web Framework', items: ['Next.js', 'React', 'TypeScript'] },
  { category: 'Styling', items: ['Tailwind CSS', 'Framer Motion'] },
]

const pipelineComponents = [
  'Ingestion: Loading and parsing 14 Excel files',
  'Cleaning: Standardizing columns, normalizing states, handling missing values',
  'Transformation: Aggregating by state/year and sector/year',
  'Feature Engineering: Creating similarity feature vectors',
  'Visualization: Generating static charts and interactive dashboard',
]

export default function MethodsToolsSection() {
  return (
    <Section id="methods">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Methods and Tools</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-accent-teal mb-4">Data Source</h3>
              <p className="text-text-secondary">
                <strong className="text-accent-primary">EPA GHGRP Direct Emitters:</strong> Facility-level 
                greenhouse gas emissions data from the US Environmental Protection Agency Greenhouse Gas 
                Reporting Program, covering reporting years 2010 through 2023.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-accent-teal mb-4">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-4">
                {tools.map((tool, idx) => (
                  <div key={idx} className="bg-bg-card rounded-md p-4 border border-accent-teal/20">
                    <div className="font-semibold text-accent-primary mb-2">{tool.category}</div>
                    <div className="text-sm text-text-secondary space-y-1">
                      {tool.items.map((item, i) => (
                        <div key={i}>• {item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-accent-primary mb-4">Analysis Pipeline</h3>
              <div className="bg-bg-card rounded-lg p-6 border border-accent-primary/20">
                <ol className="space-y-3">
                  {pipelineComponents.map((component, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-accent-primary font-bold">{idx + 1}.</span>
                      <span className="text-text-secondary">{component}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="bg-bg-card-alt rounded-lg p-6 border border-accent-teal/20">
              <h3 className="text-xl font-semibold text-accent-teal mb-3">Statistical Methods</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Descriptive statistics (mean, median, percentiles)</li>
                <li>• Z-score and IQR methods for outlier detection</li>
                <li>• Cosine similarity for profile comparison</li>
                <li>• Time-series trend analysis</li>
                <li>• Distribution analysis (histograms, boxplots)</li>
                <li>• Correlation analysis (scatter plots)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Reproducibility Note */}
        <Card variant="teal" className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-accent-teal mb-4">Reproducibility</h3>
          <p className="text-text-secondary leading-relaxed">
            All analysis is reproducible in the accompanying Jupyter notebook (<code className="text-accent-primary">notebooks/ghg_analysis.ipynb</code>), 
            which contains the exact code used for data loading, cleaning, transformation, and visualization. The notebook includes 
            all statistical calculations, outlier detection methods, and visualization code, ensuring that all results presented 
            in this report can be independently verified and reproduced.
          </p>
        </Card>
      </div>
    </Section>
  )
}



