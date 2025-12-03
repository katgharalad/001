import Section from './Section'

export default function ProblemStatementSection() {
  return (
    <Section id="problem">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Problem Statement and Objectives</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-lg text-text-secondary leading-relaxed">
              My analysis addresses several key research questions about US greenhouse gas emissions:
            </p>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Understand how US greenhouse gas emissions change over time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Identify which states and sectors contribute most to emissions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Detect outlier facilities and anomalies in the dataset</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Examine distributions and relationships between key variables</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>Build an interactive dashboard to support exploration</span>
              </li>
            </ul>
            <p className="text-sm text-text-muted mt-6">
              I structured my analysis to map directly to the instructor&apos;s grading criteria for the data analysis assignment.
            </p>
          </div>
          <div className="bg-bg-card rounded-lg p-6 border border-accent-teal/20">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Research Questions</h3>
            <ol className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-teal font-semibold">1.</span>
                <span>What is the structure of the dataset? Describe columns, data types, and missing values.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-teal font-semibold">2.</span>
                <span>What trends can be observed in emissions over the 2010–2023 period?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-teal font-semibold">3.</span>
                <span>Which states and sectors are the top contributors to total emissions?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-teal font-semibold">4.</span>
                <span>Are there outliers or anomalies in facility-level emissions data?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-teal font-semibold">5.</span>
                <span>What relationships exist between different emission types (CO₂, CH₄, N₂O)?</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Section>
  )
}



