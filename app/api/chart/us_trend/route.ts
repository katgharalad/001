import { NextResponse } from 'next/server'
import { loadStateYearData } from '@/lib/csv-loader'

export async function GET() {
  try {
    const stateYearData = await loadStateYearData()
    
    // Group by year and sum emissions
    const yearTotals: { [year: number]: { emissions: number; facilities: number } } = {}
    
    stateYearData.forEach((row: any) => {
      const year = Number(row.year)
      if (!yearTotals[year]) {
        yearTotals[year] = { emissions: 0, facilities: 0 }
      }
      yearTotals[year].emissions += Number(row.total_emissions || 0)
      yearTotals[year].facilities += Number(row.facility_count || 0)
    })
    
    const trend = Object.keys(yearTotals)
      .map(year => Number(year))
      .sort()
      .map(year => ({
        year,
        emissions: yearTotals[year].emissions / 1e6, // Convert to millions
        facilities: yearTotals[year].facilities
      }))
    
    return NextResponse.json(trend)
  } catch (error: any) {
    console.error('Error fetching US trend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

