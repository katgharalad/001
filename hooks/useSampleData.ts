import { useState, useEffect } from 'react'

// Use empty string for Next.js API routes, or FastAPI backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface SampleFacility {
  facility_id: number | null
  facility_name: string
  state: string | null
  sector: string
  year: number | null
  total_emissions: number
  co2: number
  ch4: number
  n2o: number
}

export function useSampleData(limit: number = 5) {
  const [data, setData] = useState<SampleFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Try dataset/sample endpoint first, fallback to facility/list
    fetch(`${API_BASE}/api/dataset/sample?limit=${limit}`)
      .then(res => {
        if (!res.ok) {
          // Fallback to facility/list if dataset/sample doesn't exist
          return fetch(`${API_BASE}/api/facility/list?limit=${limit}`)
            .then(res2 => {
              if (!res2.ok) throw new Error(`HTTP ${res2.status}`)
              return res2.json()
            })
            .then((apiData: { facilities: Array<{ facility_id: number | null; facility_name: string; state: string | null; industry_type_sectors?: string; total_emissions: number; co2: number; ch4: number; n2o: number }> }) => {
              const sampleData: SampleFacility[] = apiData.facilities.slice(0, limit).map(f => ({
                facility_id: f.facility_id,
                facility_name: f.facility_name || 'Unknown',
                state: f.state,
                sector: f.industry_type_sectors || 'Other',
                year: 2023, // Default year since API doesn't return it
                total_emissions: (f.total_emissions || 0) / 1e6, // Convert to millions
                co2: (f.co2 || 0) / 1e6,
                ch4: (f.ch4 || 0) / 1e6,
                n2o: (f.n2o || 0) / 1e6,
              }))
              return { sample: sampleData }
            })
        }
        return res.json()
      })
      .then((apiData: { sample: SampleFacility[] }) => {
        setData(apiData.sample)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching sample data:', err)
        setError(err.message)
        setLoading(false)
        setData([])
      })
  }, [limit])

  return { data, loading, error }
}

