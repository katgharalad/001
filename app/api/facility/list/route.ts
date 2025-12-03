import { NextRequest, NextResponse } from 'next/server'
import { loadFacilityData } from '@/lib/csv-loader'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    const sector = searchParams.get('sector')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let facilityData = await loadFacilityData()
    
    // Apply filters
    if (state) {
      facilityData = facilityData.filter((row: any) => String(row.state).toUpperCase() === state.toUpperCase())
    }
    if (year) {
      facilityData = facilityData.filter((row: any) => Number(row.reporting_year) === year)
    }
    if (sector) {
      facilityData = facilityData.filter((row: any) => String(row.industry_type_sectors) === sector)
    }
    
    if (facilityData.length === 0) {
      return NextResponse.json({
        facilities: [],
        total_count: 0,
        filters: { state, year, sector }
      })
    }
    
    // Sort by emissions and get top N
    const facilities = facilityData
      .map((row: any) => ({
        facility_id: row.facility_id ? Number(row.facility_id) : null,
        facility_name: row.facility_name || 'Unknown',
        city: row.city || null,
        state: row.state || null,
        total_emissions: Number(row.total_reported_direct_emissions || 0),
        co2: Number(row.co2_emissions_non_biogenic || 0),
        ch4: Number(row.ch4_emissions || 0),
        n2o: Number(row.n2o_emissions || 0),
        industry_type_sectors: row.industry_type_sectors || null,
        reporting_year: row.reporting_year ? Number(row.reporting_year) : null,
      }))
      .sort((a, b) => b.total_emissions - a.total_emissions)
      .slice(0, limit)
    
    return NextResponse.json({
      facilities,
      total_count: facilities.length,
      filters: { state, year, sector }
    })
  } catch (error: any) {
    console.error('Error fetching facility list:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

