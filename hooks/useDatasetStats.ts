import { useState, useEffect } from 'react'

// Use empty string for Next.js API routes, or FastAPI backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface DatasetStats {
  total_records: number
  years_covered: number
  years_list: number[]
  states_count: number
  column_count: number
}

export function useDatasetStats() {
  const [data, setData] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/dataset/stats`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: DatasetStats) => {
        setData(apiData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching dataset stats:', err)
        setError(err.message)
        setLoading(false)
        setData(null)
      })
  }, [])

  return { data, loading, error }
}



