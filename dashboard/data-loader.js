/**
 * Data Loader Utility
 * Handles loading and parsing CSV files from the data_processed directory
 */

class DataLoader {
    constructor() {
        this.data = {
            allYears: null,
            stateYear: null,
            sectorYear: null,
            facility: null
        };
        this.loaded = false;
    }

    async loadAll() {
        try {
            console.log('Loading data files...');
            
            const [allYears, stateYear, sectorYear, facility] = await Promise.all([
                this.loadCSV('../data_processed/ghg_all_years_clean.csv'),
                this.loadCSV('../data_processed/ghg_state_year.csv'),
                this.loadCSV('../data_processed/ghg_sector_year.csv'),
                this.loadCSV('../data_processed/ghg_facility_clean.csv')
            ]);

            this.data.allYears = allYears;
            this.data.stateYear = stateYear;
            this.data.sectorYear = sectorYear;
            this.data.facility = facility;
            
            this.loaded = true;
            console.log('All data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    async loadCSV(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            // Return empty array as fallback
            return [];
        }
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    const value = values[index].trim().replace(/^"|"$/g, '');
                    // Try to parse as number
                    const numValue = parseFloat(value);
                    row[header] = isNaN(numValue) ? value : numValue;
                });
                data.push(row);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values;
    }

    // Helper methods to get filtered data
    getDataByYear(year) {
        if (!this.data.allYears) return [];
        return this.data.allYears.filter(row => row.reporting_year === year);
    }

    getStateYearData(state = null, year = null) {
        if (!this.data.stateYear) return [];
        let filtered = this.data.stateYear;
        if (state) filtered = filtered.filter(row => row.state === state);
        if (year) filtered = filtered.filter(row => row.year === year);
        return filtered;
    }

    getSectorYearData(sector = null, year = null) {
        if (!this.data.sectorYear) return [];
        let filtered = this.data.sectorYear;
        if (sector) filtered = filtered.filter(row => row.sector === sector);
        if (year) filtered = filtered.filter(row => row.year === year);
        return filtered;
    }

    getYearlyTotals() {
        if (!this.data.allYears) return [];
        const totals = {};
        this.data.allYears.forEach(row => {
            const year = row.reporting_year;
            if (!totals[year]) {
                totals[year] = {
                    year: year,
                    total: 0,
                    facilities: new Set()
                };
            }
            totals[year].total += row.total_reported_direct_emissions || 0;
            if (row.facility_id) {
                totals[year].facilities.add(row.facility_id);
            }
        });

        return Object.values(totals).map(t => ({
            year: t.year,
            total: t.total,
            facilityCount: t.facilities.size
        })).sort((a, b) => a.year - b.year);
    }

    getTopStates(year = null, limit = 5) {
        if (!this.data.stateYear) return [];
        let filtered = this.data.stateYear;
        if (year) {
            filtered = filtered.filter(row => row.year === year);
        }
        
        // Aggregate by state if multiple years
        const stateTotals = {};
        filtered.forEach(row => {
            const state = row.state;
            if (!stateTotals[state]) {
                stateTotals[state] = {
                    state: state,
                    total: 0
                };
            }
            stateTotals[state].total += row.total_emissions || 0;
        });

        return Object.values(stateTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }

    getTopSectors(year = null, limit = 5) {
        if (!this.data.sectorYear) return [];
        let filtered = this.data.sectorYear;
        if (year) {
            filtered = filtered.filter(row => row.year === year);
        }

        const sectorTotals = {};
        filtered.forEach(row => {
            const sector = row.sector || 'Unknown';
            if (!sectorTotals[sector]) {
                sectorTotals[sector] = {
                    sector: sector,
                    total: 0
                };
            }
            sectorTotals[sector].total += row.total_emissions || 0;
        });

        return Object.values(sectorTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }

    getPowerSectorShare(year) {
        if (!this.data.sectorYear) return 0;
        const yearData = this.data.sectorYear.filter(row => row.year === year);
        const powerSector = yearData.find(row => 
            row.sector && row.sector.toLowerCase().includes('power')
        );
        
        if (!powerSector) return 0;
        
        const total = yearData.reduce((sum, row) => sum + (row.total_emissions || 0), 0);
        return total > 0 ? (powerSector.total_emissions / total) * 100 : 0;
    }

    getLowEmissionStates(year, percentile = 25) {
        if (!this.data.stateYear) return [];
        const yearData = this.data.stateYear.filter(row => row.year === year);
        const emissions = yearData.map(row => row.total_emissions || 0).sort((a, b) => a - b);
        const threshold = emissions[Math.floor(emissions.length * (percentile / 100))];
        
        return yearData.filter(row => (row.total_emissions || 0) <= threshold).length;
    }
}

// Export singleton instance
const dataLoader = new DataLoader();



