'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

const sections = [
  // Part 1
  { id: 'intro', label: 'Overview', part: 1 },
  { id: 'problem', label: 'Problem Statement', part: 1 },
  { id: 'dataset', label: 'Dataset Structure', part: 1 },
  { id: 'cleaning', label: 'Data Cleaning', part: 1 },
  { id: 'transformation', label: 'Transformation', part: 1 },
  { id: 'trends', label: 'National Trends', part: 1 },
  // Part 2
  { id: 'top-states', label: 'Top States', part: 2 },
  { id: 'top-sectors', label: 'Top Sectors', part: 2 },
  { id: 'outliers', label: 'Outliers', part: 2 },
  // Part 3
  { id: 'distribution', label: 'Distribution', part: 3 },
  { id: 'relationship', label: 'Relationships', part: 3 },
  { id: 'proportion', label: 'Proportions', part: 3 },
  // Summary
  { id: 'similarity', label: 'Similarity', part: 0 },
  { id: 'dashboard', label: 'Dashboard', part: 0 },
  { id: 'insights', label: 'Insights', part: 0 },
  { id: 'methods', label: 'Methods', part: 0 },
  { id: 'closing', label: 'Conclusion', part: 0 },
]

const partInfo = {
  1: { label: 'Part 1: Data Prep', short: 'Part 1', description: 'Data Preparation & Analysis' },
  2: { label: 'Part 2: EDA', short: 'Part 2', description: 'Exploratory Data Analysis' },
  3: { label: 'Part 3: Viz', short: 'Part 3', description: 'Visualizations' },
  0: { label: 'Summary', short: 'Summary', description: 'Summary & Methods' },
}

export default function SectionNavigation() {
  const [activeSection, setActiveSection] = useState('intro')
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set([1])) // Part 1 expanded by default

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id)
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
          // Auto-expand the part containing the active section
          const activePart = sections[i].part
          setExpandedParts(prev => {
            const newSet = new Set(prev)
            newSet.add(activePart)
            return newSet
          })
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const togglePart = (part: number) => {
    setExpandedParts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(part)) {
        newSet.delete(part)
      } else {
        newSet.add(part)
      }
      return newSet
    })
  }

  const partGroups = [
    { part: 1, sections: sections.filter(s => s.part === 1) },
    { part: 2, sections: sections.filter(s => s.part === 2) },
    { part: 3, sections: sections.filter(s => s.part === 3) },
    { part: 0, sections: sections.filter(s => s.part === 0) },
  ]

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block xl:right-6">
      <Card className="p-3 lg:p-3 xl:p-4 shadow-lg backdrop-blur-sm max-h-[80vh] lg:max-h-[80vh] xl:max-h-[85vh] overflow-y-auto">
        <div className="text-[10px] lg:text-[10px] xl:text-xs font-semibold text-text-primary tracking-wider mb-3 text-center uppercase">
          Navigation
        </div>
        <div className="space-y-2">
          {partGroups.map((group) => {
            const isExpanded = expandedParts.has(group.part)
            const hasActiveSection = group.sections.some(s => s.id === activeSection)
            const info = partInfo[group.part as keyof typeof partInfo]

            return (
              <div key={group.part} className="border-b border-accent-primary/10 last:border-0 pb-2 last:pb-0">
                <button
                  onClick={() => togglePart(group.part)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    hasActiveSection
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-text-secondary hover:text-accent-primary hover:bg-bg-hover/30'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span>{info.short}</span>
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {group.sections.length}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="mt-1.5 ml-4 space-y-1">
                    {group.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`block text-left w-full px-3 py-1.5 rounded text-xs transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-accent-primary text-bg-body font-semibold'
                            : 'text-text-secondary hover:text-accent-primary hover:bg-bg-hover/30'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </nav>
  )
}

