import { NextRequest, NextResponse } from 'next/server'
import { loadFacilityData } from '@/lib/csv-loader'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')
    
    const facilityData = await loadFacilityData()
    
    // Get random sample
    const shuffled = [...facilityData].sort(() => 0.5 - Math.random())
    const sample = shuffled.slice(0, limit).map((row: any) => ({
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
    
    return NextResponse.json({ sample })
  } catch (error: any) {
    console.error('Error fetching dataset sample:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

