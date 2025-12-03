import { NextRequest, NextResponse } from 'next/server'
import { loadStateYearData } from '@/lib/csv-loader'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2023')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    const stateYearData = await loadStateYearData()
    
    // Filter by year
    const yearData = stateYearData.filter((row: any) => Number(row.year) === year)
    
    if (yearData.length === 0) {
      return NextResponse.json({ error: `No data found for year ${year}` }, { status: 404 })
    }
    
    // Calculate total for percentage
    const totalEmissions = yearData.reduce((sum: number, row: any) => sum + Number(row.total_emissions || 0), 0)
    
    // Sort and get top N
    const topStates = yearData
      .map((row: any) => ({
        state: row.state,
        emissions: Number(row.total_emissions || 0) / 1e6, // Convert to millions
        facility_count: Number(row.facility_count || 0),
        co2: Number(row.co2 || 0) / 1e6,
        ch4: Number(row.ch4 || 0) / 1e6,
        n2o: Number(row.n2o || 0) / 1e6,
      }))
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, limit)
      .map((state, index) => ({
        ...state,
        rank: index + 1,
        percent: (state.emissions * 1e6 / totalEmissions * 100)
      }))
    
    return NextResponse.json({
      year,
      limit,
      states: topStates
    })
  } catch (error: any) {
    console.error('Error fetching top states:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

