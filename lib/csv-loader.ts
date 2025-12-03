/**
 * CSV Data Loader for Next.js API Routes
 * Reads CSV files from public/data_processed directory
 */

import Papa from 'papaparse'
import fs from 'fs'
import path from 'path'

// Try multiple paths for CSV files (works in both dev and production)
// In Vercel, files need to be in public/ or accessible at build time
const DATA_DIR = path.join(process.cwd(), 'data_processed')

interface CSVRow {
  [key: string]: string | number
}

let cachedData: {
  stateYear?: CSVRow[]
  sectorYear?: CSVRow[]
  facility?: CSVRow[]
  similarityStates?: CSVRow[]
  similaritySectors?: CSVRow[]
} = {}

function parseCSV(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        // Try to parse as number
        if (field.includes('emissions') || field.includes('count') || field === 'year' || field === 'facility_id' || field === 'reporting_year') {
          const num = parseFloat(value)
          return isNaN(num) ? value : num
        }
        return value
      },
      complete: (results) => {
        resolve(results.data as CSVRow[])
      },
      error: (error: Error) => {
        reject(error)
      }
    })
  })
}

export async function loadStateYearData(): Promise<CSVRow[]> {
  if (cachedData.stateYear) {
    return cachedData.stateYear
  }
  const filePath = path.join(DATA_DIR, 'ghg_state_year.csv')
  cachedData.stateYear = await parseCSV(filePath)
  return cachedData.stateYear
}

export async function loadSectorYearData(): Promise<CSVRow[]> {
  if (cachedData.sectorYear) {
    return cachedData.sectorYear
  }
  const filePath = path.join(DATA_DIR, 'ghg_sector_year.csv')
  cachedData.sectorYear = await parseCSV(filePath)
  return cachedData.sectorYear
}

export async function loadFacilityData(): Promise<CSVRow[]> {
  if (cachedData.facility) {
    return cachedData.facility
  }
  const filePath = path.join(DATA_DIR, 'ghg_facility_clean.csv')
  cachedData.facility = await parseCSV(filePath)
  return cachedData.facility
}

export async function loadSimilarityStatesData(): Promise<CSVRow[]> {
  if (cachedData.similarityStates) {
    return cachedData.similarityStates
  }
  const filePath = path.join(DATA_DIR, 'similarity_states.csv')
  cachedData.similarityStates = await parseCSV(filePath)
  return cachedData.similarityStates
}

export async function loadSimilaritySectorsData(): Promise<CSVRow[]> {
  if (cachedData.similaritySectors) {
    return cachedData.similaritySectors
  }
  const filePath = path.join(DATA_DIR, 'similarity_sectors.csv')
  cachedData.similaritySectors = await parseCSV(filePath)
  return cachedData.similaritySectors
}

export function clearCache() {
  cachedData = {}
}

