import { useState, useEffect } from 'react'

// Use relative API routes when deployed, fallback to localhost for development
const API_BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001')

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



