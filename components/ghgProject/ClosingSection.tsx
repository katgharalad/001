import Link from 'next/link'
import Section from './Section'

export default function ClosingSection() {
  return (
    <Section id="closing">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Conclusion and Future Work</h2>
        <div className="space-y-6">
          <div className="bg-bg-card rounded-lg p-6 border border-accent-primary/20">
            <h3 className="text-xl font-semibold text-accent-primary mb-4">Summary</h3>
            <p className="text-lg text-text-secondary leading-relaxed">
              My analysis of US greenhouse gas emissions from large industrial facilities (2010–2023) 
              demonstrates a comprehensive approach to data collection, cleaning, analysis, and visualization. 
              My key findings include a decline in emissions over the period, high concentration in specific 
              states and sectors, and distinct patterns in methane-heavy versus CO₂-driven emissions. I built 
              an interactive dashboard that extends analytical capabilities beyond static visualizations, enabling 
              ongoing exploration and hypothesis testing.
            </p>
          </div>
          
          <div className="bg-bg-card rounded-lg p-6 border border-accent-teal/20">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Analysis Implications</h3>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              My analysis suggests that US greenhouse gas emissions from large industrial facilities have 
              shown a declining trend over the 2010–2023 period, but remain highly concentrated in specific 
              states (particularly Texas, Louisiana, and other energy-intensive states) and sectors (Power Plants, 
              Petroleum and Natural Gas Systems). I found that the identification of outlier facilities and sector-specific 
              patterns provides actionable insights for targeted policy interventions. I believe the high concentration 
              of emissions in a small number of facilities and sectors suggests that targeted regulatory and 
              technological interventions could yield substantial emissions reductions.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              I observed that the right-skewed distribution of facility emissions indicates that while most facilities are 
              relatively small emitters, a small number of very large facilities drive the aggregate impact. 
              I believe this pattern supports facility-level policy targeting as an effective strategy for emissions 
              reduction. Additionally, I found that the sector-based clustering in the relationship between CO₂ and CH₄ 
              emissions suggests that emission reduction strategies should be tailored to sector-specific 
              characteristics, particularly for methane mitigation in the petroleum and natural gas sector.
            </p>
          </div>
          <div className="bg-bg-card rounded-lg p-6 border border-accent-teal/20">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Potential Next Steps</h3>
            <p className="text-text-secondary mb-4 leading-relaxed">
              My analysis provides a foundation for several potential extensions and deeper investigations:
            </p>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Forecasting:</strong> Time-series models to 
                  project future emissions trends under different scenarios
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Clustering:</strong> Unsupervised learning to 
                  identify groups of facilities or states with similar emission profiles
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Policy Analysis:</strong> Evaluate the impact 
                  of specific regulations or policy changes on emissions patterns
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Geographic Analysis:</strong> Spatial analysis 
                  using latitude/longitude data to identify regional clusters and patterns
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Comparative Analysis:</strong> Compare US 
                  emissions patterns with international data or benchmark against climate targets
                </span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center pt-8">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-accent-primary text-bg-body rounded-md font-semibold hover:bg-accent-primary/80 transition-colors text-lg"
            >
              Open Interactive Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}



