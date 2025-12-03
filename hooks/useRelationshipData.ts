import { useState, useEffect } from 'react'

// Use empty string for Next.js API routes, or FastAPI backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface ScatterPoint {
  co2: number
  ch4: number
  sector: string
}

export function useRelationshipData(year: number = 2023) {
  const [data, setData] = useState<ScatterPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Fetch facility data for scatter plot - filter by year
    fetch(`${API_BASE}/api/facility/list?year=${year}&limit=1000`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { facilities: Array<{ co2: number; ch4: number; industry_type_sectors?: string }> }) => {
        const scatterData: ScatterPoint[] = apiData.facilities
          .filter(f => {
            const co2 = (f.co2 || 0) / 1e6
            const ch4 = (f.ch4 || 0) / 1e6
            // Include points with at least some CO2 emissions (CH4 can be 0)
            // Use a small threshold to avoid log scale issues
            return co2 > 0.0001 && ch4 >= 0
          })
          .map(f => ({
            co2: Math.max((f.co2 || 0) / 1e6, 0.0001), // Convert to millions, ensure positive for log scale
            ch4: Math.max((f.ch4 || 0) / 1e6, 0.0001), // Ensure positive for log scale
            sector: f.industry_type_sectors || 'Other',
          }))
          .slice(0, 1000) // Increase limit for better visualization across all years
        
        setData(scatterData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching relationship data:', err)
        setData([])
        setLoading(false)
      })
  }, [year])

  return { data, loading }
}

