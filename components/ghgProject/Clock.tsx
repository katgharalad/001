'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

export default function Clock() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <Card className="p-4 lg:p-5 xl:p-6 shadow-lg backdrop-blur-sm">
        <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="95" fill="none" stroke="#C6FF3F" strokeWidth="2" opacity="0.3" />
          </svg>
        </div>
      </Card>
    )
  }

  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Calculate angles (0 degrees = 12 o'clock, clockwise)
  const hourAngle = (hours * 30 + minutes * 0.5 - 90) * (Math.PI / 180)
  const minuteAngle = (minutes * 6 + seconds * 0.1 - 90) * (Math.PI / 180)
  const secondAngle = (seconds * 6 - 90) * (Math.PI / 180)

  // Hand lengths (as percentage of radius)
  const hourLength = 50
  const minuteLength = 70
  const secondLength = 80
  const centerX = 100
  const centerY = 100

  // Calculate hand endpoints
  const hourX = centerX + hourLength * Math.cos(hourAngle)
  const hourY = centerY + hourLength * Math.sin(hourAngle)
  const minuteX = centerX + minuteLength * Math.cos(minuteAngle)
  const minuteY = centerY + minuteLength * Math.sin(minuteAngle)
  const secondX = centerX + secondLength * Math.cos(secondAngle)
  const secondY = centerY + secondLength * Math.sin(secondAngle)

  return (
    <Card className="p-4 lg:p-5 xl:p-6 shadow-lg backdrop-blur-sm">
      <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mx-auto relative">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Clock face circle with glow */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer ring with glow */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="#C6FF3F" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#C6FF3F" strokeWidth="1" opacity="0.2" />
          
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180)
            const x1 = 100 + 85 * Math.cos(angle)
            const y1 = 100 + 85 * Math.sin(angle)
            const x2 = 100 + 95 * Math.cos(angle)
            const y2 = 100 + 95 * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#C6FF3F"
                strokeWidth="2"
                opacity="0.6"
              />
            )
          })}
          
          {/* Minute markers */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 === 0) return null // Skip hour markers
            const angle = (i * 6 - 90) * (Math.PI / 180)
            const x1 = 100 + 88 * Math.cos(angle)
            const y1 = 100 + 88 * Math.sin(angle)
            const x2 = 100 + 92 * Math.cos(angle)
            const y2 = 100 + 92 * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#C6FF3F"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}
          
          {/* Hour hand */}
          <line
            x1={centerX}
            y1={centerY}
            x2={hourX}
            y2={hourY}
            stroke="#C6FF3F"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Minute hand */}
          <line
            x1={centerX}
            y1={centerY}
            x2={minuteX}
            y2={minuteY}
            stroke="#C6FF3F"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Second hand */}
          <line
            x1={centerX}
            y1={centerY}
            x2={secondX}
            y2={secondY}
            stroke="#C6FF3F"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
            filter="url(#glow)"
          />
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="4" fill="#C6FF3F" filter="url(#glow)" />
        </svg>
      </div>
    </Card>
  )
}

