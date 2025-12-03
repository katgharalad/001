import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface SectorProportion {
  name: string
  value: number
  color: string
}

// Set3 colormap colors (matching notebook matplotlib Set3)
const set3Colors = [
  '#8dd3c7', // Light teal
  '#ffffb3', // Light yellow
  '#bebada', // Light purple
  '#fb8072', // Light red
  '#80b1d3', // Light blue
  '#fdb462', // Light orange
  '#b3de69', // Light green
  '#fccde5', // Light pink
  '#d9d9d9', // Light gray (for "Other")
]

const sectorColors: Record<string, string> = {
  'Power Plants': '#8dd3c7',
  'Petroleum & Natural Gas': '#ffffb3',
  'Petroleum and Natural Gas Systems': '#ffffb3',
  'Refineries': '#bebada',
  'Chemicals': '#fb8072',
}

export function useProportionData(year: number = 2023) {
  const [data, setData] = useState<SectorProportion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/sectors/top?year=${year}&limit=50`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { sectors: Array<{ sector: string; emissions: number; percent: number }> }) => {
        // Get top 8 sectors and group the rest as "Other" (matching notebook)
        // Use absolute emissions values from backend, not percentages
        const top8 = apiData.sectors.slice(0, 8)
        const otherEmissions = apiData.sectors.slice(8).reduce((sum, s) => sum + (s.emissions || 0), 0)
        
        // Convert emissions from metric tons to millions for display
        const formattedData: SectorProportion[] = [
          ...top8.map((s, idx) => ({
            name: s.sector,
            value: (s.emissions || 0) / 1e6, // Convert to millions
            color: sectorColors[s.sector] || set3Colors[idx % set3Colors.length],
          })),
          ...(otherEmissions > 0 ? [{
            name: 'Other',
            value: otherEmissions / 1e6, // Convert to millions
            color: set3Colors[8], // Light gray for "Other"
          }] : []),
        ]
        
        setData(formattedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching proportion data:', err)
        setData([])
        setLoading(false)
      })
  }, [year])

  return { data, loading }
}
