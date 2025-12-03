"""
FastAPI Backend for GHG Emissions Dashboard
Provides REST API endpoints for the neon dashboard UI
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from pathlib import Path
from typing import Optional, List
import sys

# Add parent directory to path for utils
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.utils import DataManager

app = FastAPI(
    title="GHG Emissions Dashboard API",
    description="API for US Greenhouse Gas Reporting Program data (2010-2023)",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data manager
data_manager = DataManager()

@app.on_event("startup")
async def startup_event():
    """Load all CSV files into memory on startup."""
    print("Loading data files...")
    data_manager.load_all_data()
    print("✓ Data loaded successfully")

@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "GHG Emissions Dashboard API",
        "version": "1.0.0",
        "endpoints": {
            "summary": "/api/summary/us, /api/summary/state, /api/summary/sector",
            "charts": "/api/chart/us_trend, /api/chart/state_trend, /api/chart/sector_trend",
            "rankings": "/api/states/top, /api/sectors/top",
            "similarity": "/api/similarity/states, /api/similarity/sectors",
            "facilities": "/api/facility/list",
            "analytics": "/api/states/low_emission, /api/states/reduction, /api/states/high_methane"
        }
    }

# ============================================================================
# SUMMARY ENDPOINTS
# ============================================================================

@app.get("/api/summary/us")
async def get_us_summary(year: int = Query(2023, ge=2010, le=2023)):
    """Get US-wide summary for a given year."""
    try:
        year_data = data_manager.state_year_df[data_manager.state_year_df['year'] == year]
        
        if year_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for year {year}")
        
        total = float(year_data['total_emissions'].sum())
        co2 = float(year_data['co2'].sum())
        ch4 = float(year_data['ch4'].sum())
        n2o = float(year_data['n2o'].sum())
        facilities = int(year_data['facility_count'].sum())
        
        # Calculate change from 2010
        baseline_data = data_manager.state_year_df[data_manager.state_year_df['year'] == 2010]
        baseline_total = float(baseline_data['total_emissions'].sum())
        pct_change = ((total - baseline_total) / baseline_total) * 100 if baseline_total > 0 else 0
        
        # Calculate shares
        co2_share = (co2 / total) if total > 0 else 0
        ch4_share = (ch4 / total) if total > 0 else 0
        n2o_share = (n2o / total) if total > 0 else 0
        
        return {
            "year": year,
            "total_emissions": total,
            "co2": co2,
            "ch4": ch4,
            "n2o": n2o,
            "facilities_reporting": facilities,
            "percent_change_from_2010": round(pct_change, 2),
            "co2_share": round(co2_share, 3),
            "ch4_share": round(ch4_share, 3),
            "n2o_share": round(n2o_share, 3)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/summary/state")
async def get_state_summary(
    state: str = Query(..., description="State abbreviation (e.g., TX, CA)"),
    year: int = Query(2023, ge=2010, le=2023)
):
    """Get state summary for a given year."""
    try:
        state_data = data_manager.state_year_df[
            (data_manager.state_year_df['state'] == state.upper()) &
            (data_manager.state_year_df['year'] == year)
        ]
        
        if state_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for state {state} in year {year}")
        
        row = state_data.iloc[0]
        
        # Calculate trend since 2010
        baseline = data_manager.state_year_df[
            (data_manager.state_year_df['state'] == state.upper()) &
            (data_manager.state_year_df['year'] == 2010)
        ]
        baseline_emissions = float(baseline['total_emissions'].sum()) if not baseline.empty else 0
        current_emissions = float(row['total_emissions'])
        trend = ((current_emissions - baseline_emissions) / baseline_emissions * 100) if baseline_emissions > 0 else 0
        
        # Calculate ranking for this year
        year_rankings = data_manager.state_year_df[data_manager.state_year_df['year'] == year].copy()
        year_rankings = year_rankings.sort_values('total_emissions', ascending=False).reset_index()
        ranking = int(year_rankings[year_rankings['state'] == state.upper()].index[0]) + 1 if not year_rankings[year_rankings['state'] == state.upper()].empty else None
        
        # Calculate percent of US total
        us_total = float(data_manager.state_year_df[data_manager.state_year_df['year'] == year]['total_emissions'].sum())
        percent_of_us = (current_emissions / us_total * 100) if us_total > 0 else 0
        
        return {
            "state": state.upper(),
            "year": year,
            "total_emissions": current_emissions,
            "co2": float(row['co2']),
            "ch4": float(row['ch4']),
            "n2o": float(row['n2o']),
            "facility_count": int(row['facility_count']),
            "trend_since_2010": round(trend, 2),
            "ranking": ranking,
            "percent_of_us_total": round(percent_of_us, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/summary/sector")
async def get_sector_summary(
    sector: str = Query(..., description="Sector name (e.g., 'Power Plants')"),
    year: int = Query(2023, ge=2010, le=2023)
):
    """Get sector summary for a given year."""
    try:
        sector_data = data_manager.sector_year_df[
            (data_manager.sector_year_df['sector'] == sector) &
            (data_manager.sector_year_df['year'] == year)
        ]
        
        if sector_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for sector '{sector}' in year {year}")
        
        row = sector_data.iloc[0]
        
        # Calculate trend since 2010
        baseline = data_manager.sector_year_df[
            (data_manager.sector_year_df['sector'] == sector) &
            (data_manager.sector_year_df['year'] == 2010)
        ]
        baseline_emissions = float(baseline['total_emissions'].sum()) if not baseline.empty else 0
        current_emissions = float(row['total_emissions'])
        trend = ((current_emissions - baseline_emissions) / baseline_emissions * 100) if baseline_emissions > 0 else 0
        
        # Calculate percent of total
        us_total = float(data_manager.sector_year_df[data_manager.sector_year_df['year'] == year]['total_emissions'].sum())
        percent_of_total = (current_emissions / us_total * 100) if us_total > 0 else 0
        
        return {
            "sector": sector,
            "year": year,
            "total_emissions": current_emissions,
            "co2": float(row['co2']),
            "ch4": float(row['ch4']),
            "n2o": float(row['n2o']),
            "facility_count": int(row['facility_count']),
            "percent_of_total": round(percent_of_total, 2),
            "trend_since_2010": round(trend, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CHART ENDPOINTS
# ============================================================================

@app.get("/api/chart/us_trend")
async def get_us_trend():
    """Get US emissions trend 2010-2023."""
    try:
        trend = data_manager.state_year_df.groupby('year').agg({
            'total_emissions': 'sum',
            'facility_count': 'sum'
        }).reset_index()
        
        trend['emissions'] = trend['total_emissions']
        trend['facilities'] = trend['facility_count']
        
        return trend[['year', 'emissions', 'facilities']].to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chart/state_trend")
async def get_state_trend(state: str = Query(..., description="State abbreviation")):
    """Get state emissions trend 2010-2023."""
    try:
        state_data = data_manager.state_year_df[
            data_manager.state_year_df['state'] == state.upper()
        ].sort_values('year')
        
        if state_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for state {state}")
        
        result = state_data[['year', 'total_emissions', 'facility_count']].copy()
        result.columns = ['year', 'emissions', 'facilities']
        
        return result.to_dict('records')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chart/sector_trend")
async def get_sector_trend(sector: str = Query(..., description="Sector name")):
    """Get sector emissions trend 2010-2023."""
    try:
        sector_data = data_manager.sector_year_df[
            data_manager.sector_year_df['sector'] == sector
        ].sort_values('year')
        
        if sector_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for sector '{sector}'")
        
        result = sector_data[['year', 'total_emissions', 'facility_count']].copy()
        result.columns = ['year', 'emissions', 'facilities']
        
        return result.to_dict('records')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# RANKING ENDPOINTS
# ============================================================================

@app.get("/api/states/top")
async def get_top_states(
    year: int = Query(2023, ge=2010, le=2023),
    limit: int = Query(5, ge=1, le=50)
):
    """Get top N states by emissions for a given year."""
    try:
        year_data = data_manager.state_year_df[data_manager.state_year_df['year'] == year].copy()
        
        if year_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for year {year}")
        
        # Calculate total for percentage
        total_emissions = float(year_data['total_emissions'].sum())
        
        # Sort and get top N
        top_states = year_data.nlargest(limit, 'total_emissions').copy()
        top_states['rank'] = range(1, len(top_states) + 1)
        top_states['percent'] = (top_states['total_emissions'] / total_emissions * 100).round(2)
        
        result = []
        for _, row in top_states.iterrows():
            result.append({
                "state": row['state'],
                "emissions": float(row['total_emissions']),
                "rank": int(row['rank']),
                "percent": float(row['percent']),
                "facility_count": int(row['facility_count'])
            })
        
        return {
            "year": year,
            "limit": limit,
            "states": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sectors/top")
async def get_top_sectors(
    year: int = Query(2023, ge=2010, le=2023),
    limit: int = Query(5, ge=1, le=50)
):
    """Get top N sectors by emissions for a given year."""
    try:
        year_data = data_manager.sector_year_df[data_manager.sector_year_df['year'] == year].copy()
        
        if year_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for year {year}")
        
        # Calculate total for percentage
        total_emissions = float(year_data['total_emissions'].sum())
        
        # Sort and get top N
        top_sectors = year_data.nlargest(limit, 'total_emissions').copy()
        top_sectors['rank'] = range(1, len(top_sectors) + 1)
        top_sectors['percent'] = (top_sectors['total_emissions'] / total_emissions * 100).round(2)
        
        result = []
        for _, row in top_sectors.iterrows():
            result.append({
                "sector": row['sector'],
                "emissions": float(row['total_emissions']),
                "rank": int(row['rank']),
                "percent": float(row['percent']),
                "facility_count": int(row['facility_count'])
            })
        
        return {
            "year": year,
            "limit": limit,
            "sectors": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SIMILARITY ENDPOINTS
# ============================================================================

@app.get("/api/similarity/states")
async def get_state_similarity(
    state: str = Query(..., description="State abbreviation"),
    limit: int = Query(5, ge=1, le=50)
):
    """Get states most similar to the target state."""
    try:
        if state.upper() not in data_manager.similarity_states_df.columns:
            raise HTTPException(status_code=404, detail=f"State {state} not found in similarity matrix")
        
        # Get similarity scores for this state
        similarities = data_manager.similarity_states_df[state.upper()].copy()
        similarities = similarities[similarities.index != state.upper()]  # Remove self
        similarities = similarities.sort_values(ascending=False)
        
        # Get top similar
        top_similar = similarities.head(limit)
        
        result = []
        for target_state, score in top_similar.items():
            similarity_level = "High" if score > 0.8 else "Medium" if score > 0.6 else "Low"
            result.append({
                "state": target_state,
                "score": round(float(score), 3),
                "similarity": similarity_level
            })
        
        # Get least similar
        least_similar = similarities.tail(3)
        least_result = []
        for target_state, score in least_similar.items():
            least_result.append({
                "state": target_state,
                "score": round(float(score), 3),
                "similarity": "Low"
            })
        
        return {
            "target": state.upper(),
            "most_similar": result,
            "least_similar": least_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/similarity/sectors")
async def get_sector_similarity(
    sector: str = Query(..., description="Sector name"),
    limit: int = Query(5, ge=1, le=50)
):
    """Get sectors most similar to the target sector."""
    try:
        if sector not in data_manager.similarity_sectors_df.columns:
            raise HTTPException(status_code=404, detail=f"Sector '{sector}' not found in similarity matrix")
        
        # Get similarity scores
        similarities = data_manager.similarity_sectors_df[sector].copy()
        similarities = similarities[similarities.index != sector]  # Remove self
        similarities = similarities.sort_values(ascending=False)
        
        # Get top similar
        top_similar = similarities.head(limit)
        
        result = []
        for target_sector, score in top_similar.items():
            result.append({
                "sector": target_sector,
                "score": round(float(score), 3)
            })
        
        return {
            "target": sector,
            "most_similar": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FACILITY ENDPOINTS
# ============================================================================

@app.get("/api/facility/list")
async def get_facility_list(
    state: Optional[str] = Query(None, description="Filter by state"),
    year: Optional[int] = Query(None, ge=2010, le=2023, description="Filter by year"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    limit: int = Query(10, ge=1, le=10000)
):
    """Get facility-level details with optional filters."""
    try:
        df = data_manager.facility_df.copy()
        
        # Apply filters
        if state:
            df = df[df['state'] == state.upper()]
        if year:
            df = df[df['reporting_year'] == year]
        if sector:
            df = df[df['industry_type_sectors'] == sector]
        
        if df.empty:
            return {
                "facilities": [],
                "total_count": 0,
                "filters": {
                    "state": state,
                    "year": year,
                    "sector": sector
                }
            }
        
        # Sort by emissions and get top N
        df = df.nlargest(limit, 'total_reported_direct_emissions')
        
        facilities = []
        for _, row in df.iterrows():
            facilities.append({
                "facility_id": int(row['facility_id']) if pd.notna(row['facility_id']) else None,
                "facility_name": str(row['facility_name']) if pd.notna(row['facility_name']) else "Unknown",
                "city": str(row['city']) if pd.notna(row['city']) else None,
                "state": str(row['state']) if pd.notna(row['state']) else None,
                "total_emissions": float(row['total_reported_direct_emissions']) if pd.notna(row['total_reported_direct_emissions']) else 0,
                "co2": float(row['co2_emissions_non_biogenic']) if pd.notna(row['co2_emissions_non_biogenic']) else 0,
                "ch4": float(row['ch4_emissions']) if pd.notna(row['ch4_emissions']) else 0,
                "n2o": float(row['n2o_emissions']) if pd.notna(row['n2o_emissions']) else 0,
                "industry_type_sectors": str(row['industry_type_sectors']) if pd.notna(row['industry_type_sectors']) else None
            })
        
        return {
            "facilities": facilities,
            "total_count": len(df),
            "filters": {
                "state": state,
                "year": year,
                "sector": sector
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.get("/api/states/low_emission")
async def get_low_emission_states(
    year: int = Query(2023, ge=2010, le=2023),
    percentile: int = Query(25, ge=1, le=50)
):
    """Get states with emissions below a given percentile."""
    try:
        year_data = data_manager.state_year_df[data_manager.state_year_df['year'] == year].copy()
        
        if year_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for year {year}")
        
        # Calculate threshold
        threshold = float(year_data['total_emissions'].quantile(percentile / 100))
        
        # Get low emission states
        low_emission = year_data[year_data['total_emissions'] <= threshold].copy()
        low_emission = low_emission.sort_values('total_emissions').reset_index()
        low_emission['rank'] = range(1, len(low_emission) + 1)
        
        result = []
        for _, row in low_emission.iterrows():
            result.append({
                "state": row['state'],
                "emissions": float(row['total_emissions']),
                "rank": int(row['rank'])
            })
        
        return {
            "year": year,
            "percentile": percentile,
            "threshold": threshold,
            "states": result,
            "count": len(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/states/reduction")
async def get_states_reduction(
    threshold: float = Query(20.0, ge=0, description="Minimum reduction percentage"),
    baseline_year: int = Query(2010, ge=2010, le=2022)
):
    """Get states with emissions reduction above threshold since baseline year."""
    try:
        baseline_data = data_manager.state_year_df[data_manager.state_year_df['year'] == baseline_year].copy()
        latest_year = int(data_manager.state_year_df['year'].max())
        latest_data = data_manager.state_year_df[data_manager.state_year_df['year'] == latest_year].copy()
        
        # Merge to compare
        comparison = baseline_data[['state', 'total_emissions']].merge(
            latest_data[['state', 'total_emissions']],
            on='state',
            suffixes=('_baseline', '_current')
        )
        
        # Calculate reduction
        comparison['reduction_percent'] = (
            (comparison['total_emissions_current'] - comparison['total_emissions_baseline']) /
            comparison['total_emissions_baseline'] * 100
        )
        comparison['reduction_absolute'] = (
            comparison['total_emissions_current'] - comparison['total_emissions_baseline']
        )
        
        # Filter by threshold (negative = reduction)
        reduced_states = comparison[comparison['reduction_percent'] <= -threshold].copy()
        reduced_states = reduced_states.sort_values('reduction_percent')
        
        result = []
        for _, row in reduced_states.iterrows():
            result.append({
                "state": row['state'],
                "emissions_baseline": float(row['total_emissions_baseline']),
                "emissions_current": float(row['total_emissions_current']),
                "reduction_percent": round(float(row['reduction_percent']), 2),
                "reduction_absolute": float(row['reduction_absolute'])
            })
        
        return {
            "baseline_year": baseline_year,
            "current_year": latest_year,
            "threshold_percent": threshold,
            "states": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/states/high_methane")
async def get_high_methane_states(
    year: int = Query(2023, ge=2010, le=2023),
    threshold: float = Query(5.0, ge=0, description="Minimum CH4 percentage")
):
    """Get states where CH4 emissions exceed threshold percentage of total."""
    try:
        year_data = data_manager.state_year_df[data_manager.state_year_df['year'] == year].copy()
        
        if year_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for year {year}")
        
        # Calculate CH4 percentage
        year_data['ch4_percent'] = (year_data['ch4'] / year_data['total_emissions'] * 100).fillna(0)
        
        # Filter by threshold
        high_methane = year_data[year_data['ch4_percent'] >= threshold].copy()
        high_methane = high_methane.sort_values('ch4_percent', ascending=False)
        
        result = []
        for _, row in high_methane.iterrows():
            result.append({
                "state": row['state'],
                "total_emissions": float(row['total_emissions']),
                "ch4_emissions": float(row['ch4']),
                "ch4_percent": round(float(row['ch4_percent']), 2)
            })
        
        return {
            "year": year,
            "threshold_percent": threshold,
            "states": result,
            "count": len(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DATASET STATISTICS ENDPOINTS
# ============================================================================

@app.get("/api/dataset/stats")
async def get_dataset_stats():
    """Get overall dataset statistics."""
    try:
        # Count total records (facility-year combinations)
        total_records = len(data_manager.facility_df) if data_manager.facility_df is not None and not data_manager.facility_df.empty else 0
        
        # Count unique years
        if data_manager.facility_df is not None and not data_manager.facility_df.empty and 'reporting_year' in data_manager.facility_df.columns:
            unique_years = data_manager.facility_df['reporting_year'].nunique()
            years_list = sorted(data_manager.facility_df['reporting_year'].unique().tolist())
        else:
            unique_years = 14  # Default
            years_list = list(range(2010, 2024))
        
        # Count unique states (including DC)
        if data_manager.facility_df is not None and not data_manager.facility_df.empty and 'state' in data_manager.facility_df.columns:
            unique_states = data_manager.facility_df['state'].nunique()
        elif data_manager.state_year_df is not None and not data_manager.state_year_df.empty:
            unique_states = data_manager.state_year_df['state'].nunique()
        else:
            unique_states = 51  # Default (50 states + DC)
        
        # Count columns
        if data_manager.facility_df is not None and not data_manager.facility_df.empty:
            column_count = len(data_manager.facility_df.columns)
        else:
            column_count = 14  # Default
        
        return {
            "total_records": total_records,
            "years_covered": unique_years,
            "years_list": years_list,
            "states_count": unique_states,
            "column_count": column_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/sample")
async def get_dataset_sample(
    limit: int = Query(5, ge=1, le=10)
):
    """Get sample facility data for display."""
    try:
        if data_manager.facility_df is None or data_manager.facility_df.empty:
            raise HTTPException(status_code=404, detail="Facility data not available")
        
        # Get sample rows (first N with valid data)
        sample_df = data_manager.facility_df[
            (data_manager.facility_df['total_reported_direct_emissions'].notna()) &
            (data_manager.facility_df['total_reported_direct_emissions'] > 0)
        ].head(limit).copy()
        
        if sample_df.empty:
            raise HTTPException(status_code=404, detail="No sample data available")
        
        result = []
        for _, row in sample_df.iterrows():
            result.append({
                "facility_id": int(row['facility_id']) if pd.notna(row['facility_id']) else None,
                "facility_name": str(row['facility_name']) if pd.notna(row['facility_name']) else "Unknown",
                "state": str(row['state']) if pd.notna(row['state']) else None,
                "sector": str(row['industry_type_sectors']) if pd.notna(row['industry_type_sectors']) else "Other",
                "year": int(row['reporting_year']) if pd.notna(row['reporting_year']) else None,
                "total_emissions": float(row['total_reported_direct_emissions']) / 1e6 if pd.notna(row['total_reported_direct_emissions']) else 0,  # Convert to millions
                "co2": float(row['co2_emissions_non_biogenic']) / 1e6 if pd.notna(row['co2_emissions_non_biogenic']) else 0,
                "ch4": float(row['ch4_emissions']) / 1e6 if pd.notna(row['ch4_emissions']) else 0,
                "n2o": float(row['n2o_emissions']) / 1e6 if pd.notna(row['n2o_emissions']) else 0,
            })
        
        return {
            "sample": result,
            "count": len(result)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

