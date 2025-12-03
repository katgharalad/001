import { useState, useEffect } from 'react'

// Use relative API routes when deployed, fallback to localhost for development
const API_BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001')

export interface TrendData {
  year: number
  emissions: number
  facilities: number
}

export interface TopState {
  state: string
  emissions: number
  rank: number
  percent: number
}

export interface TopSector {
  sector: string
  emissions: number
  rank: number
  percent: number
}

export function useNationalTrend() {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/chart/us_trend`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: Array<{ year: number; emissions: number; facilities: number }>) => {
        // Convert emissions from metric tons to millions (matching notebook)
        const formattedData: TrendData[] = apiData.map(item => ({
          year: item.year,
          emissions: item.emissions / 1e6, // Convert to millions
          facilities: item.facilities,
        }))
        setData(formattedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching national trend:', err)
        setError(err.message)
        setLoading(false)
        setData([])
      })
  }, [])

  return { data, loading, error }
}

export function useTopStates(year: number = 2023) {
  const [data, setData] = useState<TopState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/states/top?year=${year}&limit=5`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { states?: TopState[], year?: number, limit?: number }) => {
        // Handle both response formats
        const states = apiData.states || []
        // Convert emissions from metric tons to millions
        const formattedData: TopState[] = states.map(state => ({
          ...state,
          emissions: state.emissions / 1e6, // Convert to millions
        }))
        setData(formattedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching top states:', err)
        setError(err.message)
        setLoading(false)
        setData([])
      })
  }, [year])

  return { data, loading, error }
}

export function useTopSectors(year: number = 2023) {
  const [data, setData] = useState<TopSector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/sectors/top?year=${year}&limit=5`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { sectors?: TopSector[], year?: number, limit?: number }) => {
        // Handle both response formats
        const sectors = apiData.sectors || []
        // Convert emissions from metric tons to millions
        const formattedData: TopSector[] = sectors.map(sector => ({
          ...sector,
          emissions: sector.emissions / 1e6, // Convert to millions
        }))
        setData(formattedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching top sectors:', err)
        setError(err.message)
        setLoading(false)
        setData([])
      })
  }, [year])

  return { data, loading, error }
}

