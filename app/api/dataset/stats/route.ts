import { NextResponse } from 'next/server'
import { loadFacilityData, loadStateYearData } from '@/lib/csv-loader'

export async function GET() {
  try {
    const facilityData = await loadFacilityData()
    const stateYearData = await loadStateYearData()
    
    // Count total records
    const total_records = facilityData.length
    
    // Count unique years
    const years = new Set<number>()
    facilityData.forEach((row: any) => {
      if (row.reporting_year) {
        years.add(Number(row.reporting_year))
      }
    })
    const years_list = Array.from(years).sort()
    const years_covered = years_list.length || 14
    
    // Count unique states
    const states = new Set<string>()
    if (facilityData.length > 0) {
      facilityData.forEach((row: any) => {
        if (row.state) {
          states.add(String(row.state))
        }
      })
    } else if (stateYearData.length > 0) {
      stateYearData.forEach((row: any) => {
        if (row.state) {
          states.add(String(row.state))
        }
      })
    }
    const states_count = states.size || 51
    
    // Count columns (from first row if available)
    const column_count = facilityData.length > 0 ? Object.keys(facilityData[0]).length : 14
    
    return NextResponse.json({
      total_records,
      years_covered,
      years_list: years_list.length > 0 ? years_list : Array.from({ length: 14 }, (_, i) => 2010 + i),
      states_count,
      column_count
    })
  } catch (error: any) {
    console.error('Error fetching dataset stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

