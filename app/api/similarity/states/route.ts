import { NextRequest, NextResponse } from 'next/server'
import { loadSimilarityStatesData } from '@/lib/csv-loader'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '3')
    
    if (!state) {
      return NextResponse.json({ error: 'State parameter is required' }, { status: 400 })
    }
    
    const similarityData = await loadSimilarityStatesData()
    
    // Find the state row
    const stateRow = similarityData.find((row: any) => {
      const firstCol = Object.keys(row)[0]
      return String(row[firstCol] || row.state).toUpperCase() === state.toUpperCase()
    })
    
    if (!stateRow) {
      return NextResponse.json({ error: `No similarity data found for state ${state}` }, { status: 404 })
    }
    
    // Get similarity scores (excluding the state itself)
    const similarities: Array<{ state: string; score: number }> = []
    Object.keys(stateRow).forEach((key) => {
      if (key !== 'state' && key !== Object.keys(stateRow)[0]) {
        const otherState = key
        const score = Number(stateRow[key] || 0)
        if (otherState.toUpperCase() !== state.toUpperCase() && !isNaN(score)) {
          similarities.push({ state: otherState, score })
        }
      }
    })
    
    // Sort by score descending and get top N
    const topSimilar = similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        state: item.state,
        score: item.score
      }))
    
    return NextResponse.json(topSimilar)
  } catch (error: any) {
    console.error('Error fetching state similarity:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

