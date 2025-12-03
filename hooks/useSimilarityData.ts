import { useState, useEffect } from 'react'

// Use empty string for Next.js API routes, or FastAPI backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface SimilarState {
  state: string
  score: number
}

export function useSimilarityData(state: string) {
  const [data, setData] = useState<SimilarState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state) return
    
    setLoading(true)
    fetch(`${API_BASE}/api/similarity/states?state=${state}&limit=3`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { most_similar?: Array<{ state: string; score: number }>, target?: string }) => {
        // Handle both response formats
        const similarStates = apiData.most_similar || []
        setData(similarStates)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching similarity data:', err)
        setData([])
        setLoading(false)
      })
  }, [state])

  return { data, loading }
}

