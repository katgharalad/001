'use client'

import { useState, useEffect } from 'react'
import { useYear } from '@/contexts/YearContext'
import Clock from './Clock'
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

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('intro')
  const [expandedParts, setExpandedParts] = useState<Set<number>>(new Set([1]))
  const { selectedYear, setSelectedYear } = useYear()

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id)
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
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
      setIsOpen(false) // Close menu after navigation
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
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 flex lg:hidden items-center justify-center w-12 h-12 bg-bg-card border border-accent-primary/30 rounded-lg text-accent-primary hover:bg-bg-hover hover:border-accent-primary/50 transition-all duration-200"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-bg-card border-l border-accent-primary/20 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Header with close button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-accent-primary">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-accent-primary hover:bg-bg-hover transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Year Selector */}
          <Card className="p-4 shadow-lg backdrop-blur-sm">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-text-primary tracking-wide text-center mb-2">
                Year Selection
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {Array.from({ length: 14 }, (_, i) => 2010 + i).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium min-h-[44px] ${
                      selectedYear === year
                        ? 'bg-accent-primary text-bg-body font-semibold shadow-md scale-105'
                        : 'bg-bg-card-alt text-text-secondary hover:text-accent-primary hover:bg-bg-hover border border-accent-primary/20 hover:border-accent-primary/40'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <Card className="p-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-text-primary tracking-wider mb-3 text-center uppercase">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[44px] ${
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
                            className={`block text-left w-full px-3 py-2 rounded text-xs transition-all duration-200 min-h-[44px] ${
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

          {/* Clock */}
          <div className="flex justify-center">
            <div className="w-32 h-32">
              <Clock />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

