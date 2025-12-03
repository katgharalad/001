import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-body flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-8">
        <h1 className="text-5xl lg:text-6xl font-bold text-accent-primary mb-4">
          US GHG Emissions Control Panel
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          EPA GHGRP 2010–2023 · Data Analysis & Visualization
        </p>
        <nav className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/ghg-project" 
            className="px-8 py-4 bg-accent-primary text-bg-body rounded-md hover:bg-accent-primary/80 transition-colors font-semibold text-lg"
          >
            View Project →
          </Link>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-bg-card border border-accent-primary/30 rounded-md hover:bg-bg-hover transition-colors text-accent-primary font-semibold text-lg"
          >
            Interactive Dashboard →
          </Link>
        </nav>
      </div>
    </main>
  )
}

