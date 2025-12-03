import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface OutlierFacility {
  name: string
  state: string
  sector: string
  emissions: number
  zScore: number
}

export function useOutlierData(year: number = 2023) {
  const [data, setData] = useState<OutlierFacility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Fetch facility data and calculate outliers - filter by year
    fetch(`${API_BASE}/api/facility/list?year=${year}&limit=5000`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { facilities: Array<{ facility_name: string; state: string; industry_type_sectors?: string; total_emissions: number }> }) => {
        const validFacilities = apiData.facilities.filter(f => (f.total_emissions || 0) > 0)
        
        if (validFacilities.length === 0) {
          setData([])
          setLoading(false)
          return
        }
        
        const emissions = validFacilities.map(f => f.total_emissions || 0)
        
        // Calculate mean and std
        const mean = emissions.reduce((a, b) => a + b, 0) / emissions.length
        const variance = emissions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / emissions.length
        const std = Math.sqrt(variance)
        
        if (std === 0) {
          setData([])
          setLoading(false)
          return
        }
        
        // Find outliers (z-score >= 2.5) - only positive outliers (high emitters)
        // Using 2.5 instead of 3 to catch more outliers in the dataset
        const outliers = validFacilities
          .map(f => {
            const emission = f.total_emissions || 0
            const zScore = (emission - mean) / std
            return {
              name: f.facility_name || 'Unknown',
              state: f.state || 'Unknown',
              sector: f.industry_type_sectors || 'Other',
              emissions: emission / 1e6, // Convert to millions
              zScore: zScore,
            }
          })
          .filter(f => f.zScore >= 2.5) // Only high outliers (lowered threshold)
          .sort((a, b) => b.zScore - a.zScore)
          .slice(0, 5) // Top 5
        
        setData(outliers)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching outlier data:', err)
        setData([])
        setLoading(false)
      })
  }, [year])

  return { data, loading }
}

