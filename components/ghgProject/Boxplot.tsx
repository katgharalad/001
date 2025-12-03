'use client'

import { useEffect, useMemo } from 'react'

export interface BoxplotStats {
  q1: number
  median: number
  q3: number
  outlierCount: number
  lowerWhisker: number
  upperWhisker: number
}

interface BoxplotProps {
  data: number[]
  height?: number
  width?: number
  onStatsCalculated?: (stats: BoxplotStats) => void
}

export default function Boxplot({ data, height = 300, width = 100, onStatsCalculated }: BoxplotProps) {
  // Calculate quartiles and statistics using useMemo to avoid recalculating
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return null
    }

    const sorted = [...data].sort((a, b) => a - b)
    const q1Index = Math.floor(sorted.length * 0.25)
    const medianIndex = Math.floor(sorted.length * 0.5)
    const q3Index = Math.floor(sorted.length * 0.75)
    
    const q1 = sorted[q1Index] || 0
    const median = sorted[medianIndex] || 0
    const q3 = sorted[q3Index] || 0
    const iqr = Math.max(q3 - q1, 0.001) // Prevent division by zero
    
    // Whiskers: 1.5 * IQR from Q1 and Q3
    const lowerWhisker = Math.max(sorted[0], q1 - 1.5 * iqr)
    const upperWhisker = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr)
    
    // Outliers
    const outliers = sorted.filter(x => x < lowerWhisker || x > upperWhisker)
    const outlierCount = outliers.length
    
    return { q1, median, q3, outlierCount, lowerWhisker, upperWhisker, sorted, outliers }
  }, [data])

  // Notify parent component of stats only when stats change
  useEffect(() => {
    if (onStatsCalculated && stats) {
      onStatsCalculated({ 
        q1: stats.q1, 
        median: stats.median, 
        q3: stats.q3, 
        outlierCount: stats.outlierCount, 
        lowerWhisker: stats.lowerWhisker, 
        upperWhisker: stats.upperWhisker 
      })
    }
  }, [onStatsCalculated, stats])

  if (!data || data.length === 0 || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        No data available
      </div>
    )
  }

  const { q1, median, q3, lowerWhisker, upperWhisker, sorted, outliers } = stats
  
  // Scale to fit the SVG
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const range = max - min || 1
  
  const scale = (value: number) => ((value - min) / range) * (width - 40) + 20
  
  const boxHeight = 60
  const boxY = (height - boxHeight) / 2
  const centerY = height / 2
  
  const q1X = scale(q1)
  const medianX = scale(median)
  const q3X = scale(q3)
  const lowerWhiskerX = scale(lowerWhisker)
  const upperWhiskerX = scale(upperWhisker)
  
  return (
    <div className="w-full h-full flex justify-center items-center">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'hidden' }}>
        {/* Y-axis line */}
        <line
          x1={20}
          y1={20}
          x2={20}
          y2={height - 20}
          stroke="#9BA0B5"
          strokeWidth="1"
        />
        
        {/* Lower whisker */}
        <line
          x1={lowerWhiskerX}
          y1={centerY - boxHeight / 2}
          x2={lowerWhiskerX}
          y2={centerY + boxHeight / 2}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={lowerWhiskerX}
          y1={centerY}
          x2={q1X}
          y2={centerY}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={lowerWhiskerX}
          y1={centerY - boxHeight / 2}
          x2={lowerWhiskerX}
          y2={centerY - boxHeight / 2 - 10}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={lowerWhiskerX}
          y1={centerY + boxHeight / 2}
          x2={lowerWhiskerX}
          y2={centerY + boxHeight / 2 + 10}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        
        {/* Box */}
        <rect
          x={q1X}
          y={boxY}
          width={q3X - q1X}
          height={boxHeight}
          fill="none"
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        
        {/* Median line */}
        <line
          x1={medianX}
          y1={boxY}
          x2={medianX}
          y2={boxY + boxHeight}
          stroke="#C6FF3F"
          strokeWidth="3"
        />
        
        {/* Upper whisker */}
        <line
          x1={upperWhiskerX}
          y1={centerY - boxHeight / 2}
          x2={upperWhiskerX}
          y2={centerY + boxHeight / 2}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={q3X}
          y1={centerY}
          x2={upperWhiskerX}
          y2={centerY}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={upperWhiskerX}
          y1={centerY - boxHeight / 2}
          x2={upperWhiskerX}
          y2={centerY - boxHeight / 2 - 10}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        <line
          x1={upperWhiskerX}
          y1={centerY + boxHeight / 2}
          x2={upperWhiskerX}
          y2={centerY + boxHeight / 2 + 10}
          stroke="#C6FF3F"
          strokeWidth="2"
        />
        
        {/* Outliers */}
        {outliers.map((outlier, idx) => {
          const outlierX = scale(outlier)
          return (
            <circle
              key={idx}
              cx={outlierX}
              cy={centerY}
              r="3"
              fill="#FF4D73"
              stroke="#C6FF3F"
              strokeWidth="1"
            />
          )
        })}
        
        {/* Labels */}
        <text
          x={10}
          y={centerY}
          fill="#F5F7FB"
          fontSize="12"
          fontWeight="bold"
          textAnchor="end"
          dominantBaseline="middle"
        >
          Log(Emissions)
        </text>
        
        {/* X-axis scale labels */}
        <text
          x={lowerWhiskerX}
          y={height - 5}
          fill="#9BA0B5"
          fontSize="10"
          textAnchor="middle"
        >
          {lowerWhisker.toFixed(2)}
        </text>
        <text
          x={q1X}
          y={height - 5}
          fill="#9BA0B5"
          fontSize="10"
          textAnchor="middle"
        >
          Q1
        </text>
        <text
          x={medianX}
          y={height - 5}
          fill="#C6FF3F"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Median
        </text>
        <text
          x={q3X}
          y={height - 5}
          fill="#9BA0B5"
          fontSize="10"
          textAnchor="middle"
        >
          Q3
        </text>
        <text
          x={upperWhiskerX}
          y={height - 5}
          fill="#9BA0B5"
          fontSize="10"
          textAnchor="middle"
        >
          {upperWhisker.toFixed(2)}
        </text>
      </svg>
    </div>
  )
}

