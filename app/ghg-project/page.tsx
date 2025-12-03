'use client'

import { YearProvider } from '@/contexts/YearContext'
import IntroSection from '@/components/ghgProject/IntroSection'
import ProblemStatementSection from '@/components/ghgProject/ProblemStatementSection'
import DatasetStructureSection from '@/components/ghgProject/DatasetStructureSection'
import DataCleaningSection from '@/components/ghgProject/DataCleaningSection'
import TransformationSection from '@/components/ghgProject/TransformationSection'
import NationalTrendSection from '@/components/ghgProject/NationalTrendSection'
import TopStatesSection from '@/components/ghgProject/TopStatesSection'
import TopSectorsSection from '@/components/ghgProject/TopSectorsSection'
import OutliersSection from '@/components/ghgProject/OutliersSection'
import DistributionSection from '@/components/ghgProject/DistributionSection'
import RelationshipSection from '@/components/ghgProject/RelationshipSection'
import ProportionSection from '@/components/ghgProject/ProportionSection'
import SimilaritySection from '@/components/ghgProject/SimilaritySection'
import DashboardSection from '@/components/ghgProject/DashboardSection'
import InsightsSection from '@/components/ghgProject/InsightsSection'
import MethodsToolsSection from '@/components/ghgProject/MethodsToolsSection'
import ClosingSection from '@/components/ghgProject/ClosingSection'
import SectionNavigation from '@/components/ghgProject/SectionNavigation'
import LeftSidebar from '@/components/ghgProject/LeftSidebar'
import ProjectHeader from '@/components/ghgProject/ProjectHeader'
import MobileMenu from '@/components/ghgProject/MobileMenu'
import { Card } from '@/components/ui/Card'

function PartHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="w-full py-4 sm:py-6 lg:py-8">
      <Card className="p-4 sm:p-6 lg:p-8 shadow-lg backdrop-blur-sm border-2 border-accent-primary/40">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-accent-primary mb-2">{title}</h2>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">{description}</p>
      </Card>
    </div>
  )
}

export default function GHGProjectPage() {
  return (
    <YearProvider>
      <div className="min-h-screen bg-bg-body">
        {/* Name - Absolute top left */}
        <div className="fixed top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 z-40 text-sm sm:text-base md:text-lg lg:text-xl font-bold text-accent-primary">
          Aarav Singh
        </div>
        
        {/* Top Header */}
        <ProjectHeader />
        
        {/* Mobile Menu - Hamburger menu for mobile/tablet */}
        <MobileMenu />
        
        {/* Left Sidebar - Year Selector & Clock (Desktop only) */}
        <LeftSidebar />
        
        {/* Right Sidebar - Navigation (Desktop only) */}
        <SectionNavigation />
        
        {/* Main Content Area */}
        <main className="max-w-full sm:max-w-3xl sm:mx-auto lg:max-w-7xl mx-auto px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10 lg:px-8 lg:pt-8 lg:pb-12 lg:pl-64 lg:pr-64 xl:pl-72 xl:pr-72 space-y-16 sm:space-y-20 lg:space-y-24">
          {/* Part 1: Data Preparation and Analysis */}
          <PartHeader
            title="Part 1: Data Preparation and Analysis"
            description="Dataset structure and missing value handling, data cleaning and transformation, and national emissions trends over time."
          />
          <IntroSection />
          <ProblemStatementSection />
          <DatasetStructureSection />
          <DataCleaningSection />
          <TransformationSection />
          <NationalTrendSection />
          
          {/* Part 2: Exploratory Data Analysis */}
          <PartHeader
            title="Part 2: Exploratory Data Analysis"
            description="Identification and ranking of top 5 contributors (states and sectors), and statistical outlier detection with justification and insights."
          />
          <TopStatesSection />
          <TopSectorsSection />
          <OutliersSection />
          
          {/* Part 3: Visualization */}
          <PartHeader
            title="Part 3: Visualization"
            description="Five required visualizations: trend over time, top 5 comparison, distribution, relationship between variables, and proportion of categories."
          />
          <DistributionSection />
          <RelationshipSection />
          <ProportionSection />
          
          {/* Summary & Methods */}
          <PartHeader
            title="Summary & Methods"
            description="Key insights synthesis, methods and tools used, and conclusion with future work."
          />
          <SimilaritySection />
          <DashboardSection />
          <InsightsSection />
          <MethodsToolsSection />
          <ClosingSection />
        </main>
      </div>
    </YearProvider>
  )
}

