import { useState, useEffect } from 'react'

// Use empty string for Next.js API routes, or FastAPI backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface HistogramBin {
  bin: string
  count: number
}

export function useDistributionData(year: number = 2023) {
  const [linearData, setLinearData] = useState<HistogramBin[]>([])
  const [logData, setLogData] = useState<HistogramBin[]>([])
  const [boxplotData, setBoxplotData] = useState<number[]>([])
  const [stats, setStats] = useState<{ mean: number; median: number; std: number; skew: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Fetch facility data and create histogram - filter by year
    fetch(`${API_BASE}/api/facility/list?year=${year}&limit=5000`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((apiData: { facilities: Array<{ total_emissions: number }> }) => {
        if (!apiData.facilities || apiData.facilities.length === 0) {
          setLinearData([])
          setLogData([])
          setBoxplotData([])
          setStats(null)
          setLoading(false)
          return
        }
        
        // Get emissions in millions
        const emissions = apiData.facilities
          .map(f => (f.total_emissions || 0) / 1e6) // Convert to millions
          .filter(e => e > 0)
        
        if (emissions.length === 0) {
          setLinearData([])
          setLogData([])
          setBoxplotData([])
          setStats(null)
          setLoading(false)
          return
        }
        
        // Calculate statistics
        const mean = emissions.reduce((a, b) => a + b, 0) / emissions.length
        const sorted = [...emissions].sort((a, b) => a - b)
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        const variance = emissions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / emissions.length
        const std = Math.sqrt(variance)
        // Calculate skewness
        const skew = emissions.reduce((sum, val) => {
          const z = (val - mean) / std
          return sum + Math.pow(z, 3)
        }, 0) / emissions.length
        
        setStats({ mean, median, std, skew })
        
        // Log transform for boxplot
        const logEmissions = emissions.map(e => Math.log10(e + 0.001))
        setBoxplotData(logEmissions)
        
        // Create linear scale histogram (50 bins)
        const linearMin = 0
        const linearMax = Math.max(...emissions)
        const linearBinCount = 50
        const linearBinWidth = (linearMax - linearMin) / linearBinCount
        
        const linearBins: HistogramBin[] = Array.from({ length: linearBinCount }, (_, i) => {
          const binStart = linearMin + i * linearBinWidth
          const binEnd = binStart + linearBinWidth
          const count = emissions.filter(e => e >= binStart && e < binEnd).length
          return {
            bin: binEnd.toFixed(1),
            count,
          }
        })
        setLinearData(linearBins)
        
        // Create log scale histogram (50 bins) - bins spaced logarithmically
        const logMin = Math.min(...logEmissions)
        const logMax = Math.max(...logEmissions)
        const logBinCount = 50
        const logBinWidth = (logMax - logMin) / logBinCount
        
        const logBins: HistogramBin[] = Array.from({ length: logBinCount }, (_, i) => {
          const binStart = logMin + i * logBinWidth
          const binEnd = binStart + logBinWidth
          const count = logEmissions.filter(e => e >= binStart && e < binEnd).length
          // Convert log values back to original scale for display
          const binStartOriginal = Math.pow(10, binStart)
          const binEndOriginal = Math.pow(10, binEnd)
          return {
            bin: binEndOriginal.toFixed(2), // Show the end of the bin in original scale
            count,
          }
        })
        setLogData(logBins)
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching distribution data:', err)
        setLinearData([])
        setLogData([])
        setBoxplotData([])
        setStats(null)
        setLoading(false)
      })
  }, [year])

  return { linearData, logData, boxplotData, stats, loading }
}

