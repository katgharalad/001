import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'US GHG Emissions Dashboard',
  description: 'EPA GHGRP 2010-2023 Data Analysis & Visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



