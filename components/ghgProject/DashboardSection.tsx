import Link from 'next/link'
import Section from './Section'
import { Card } from '@/components/ui/Card'

export default function DashboardSection() {
  return (
    <Section id="dashboard">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-accent-primary">Interactive Emissions Dashboard</h2>
        
        {/* Dashboard Preview - Full Width */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-accent-primary">Dashboard Preview</h3>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-accent-primary text-bg-body rounded-md font-semibold hover:bg-accent-primary/80 transition-colors text-sm"
            >
              Open Full Dashboard →
            </Link>
          </div>
          <Card variant="alt" className="w-full overflow-hidden p-0">
            <iframe
              src="/dashboard/index.html"
              className="w-full border-0"
              title="Dashboard Preview"
              style={{ 
                width: '100%',
                height: '700px',
                display: 'block'
              }}
            />
          </Card>
        </Card>

        {/* Description and Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-lg text-text-secondary leading-relaxed">
              We built an interactive dashboard UI to enable real-time exploration of the emissions data 
              beyond static visualizations. The dashboard provides dynamic filtering and visualization 
              capabilities that support hypothesis testing and discovery.
            </p>
            <Card variant="alt" className="p-6">
              <p className="text-text-secondary">
                <strong className="text-accent-primary">Value of Interactive Visualization:</strong> The 
                dashboard supports exploration beyond the static analyses presented in this report, allowing 
                users to test hypotheses, compare specific states or sectors, and discover patterns that may 
                not be evident in aggregate visualizations. This interactive capability is essential for 
                understanding complex, multi-dimensional data.
              </p>
            </Card>
          </div>
          <Card variant="teal" className="p-6">
            <h3 className="text-xl font-semibold text-accent-teal mb-4">Available Features</h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Year Navigation:</strong> Filter and view 
                  data for any year from 2010 to 2023
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">State Filtering:</strong> Focus on specific 
                  states or compare across states
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Sector Analysis:</strong> Explore emissions 
                  by industry sector with interactive charts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Real-time Metrics:</strong> View total emissions, 
                  facility counts, and gas breakdowns that update with filter changes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-primary mt-1">↘</span>
                <span>
                  <strong className="text-accent-primary">Advanced Filters:</strong> Power-only emissions, 
                  top states, fast reducers, and high-methane states
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Section>
  )
}

