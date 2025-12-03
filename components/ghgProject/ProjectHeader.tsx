'use client'

import { Card } from '@/components/ui/Card'

export default function ProjectHeader() {
  return (
    <header className="w-full py-4 px-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:pl-72 xl:pr-72">
      <div className="max-w-7xl mx-auto lg:pl-64 lg:pr-64">
        <Card className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 max-w-4xl mx-auto shadow-lg backdrop-blur-sm">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-primary text-center">
            US GHG Emissions Analysis Report
          </h1>
          <p className="text-center text-text-secondary mt-2 text-xs sm:text-sm">
            EPA GHGRP 2010–2023 · Comprehensive Data Analysis & Visualization
          </p>
        </Card>
      </div>
    </header>
  )
}

