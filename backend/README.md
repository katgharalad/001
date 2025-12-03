# GHG Dashboard Backend API

FastAPI backend for the GHG Emissions Dashboard.

## Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Ensure data files exist:**
   - Run `python run_pipeline.py` from project root to generate CSV files in `/data_processed/`

3. **Start the server:**
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

### Summary Endpoints
- `GET /api/summary/us?year=2023` - US-wide summary
- `GET /api/summary/state?state=TX&year=2023` - State summary
- `GET /api/summary/sector?sector=Power Plants&year=2023` - Sector summary

### Chart Endpoints
- `GET /api/chart/us_trend` - US emissions trend 2010-2023
- `GET /api/chart/state_trend?state=TX` - State trend
- `GET /api/chart/sector_trend?sector=Power Plants` - Sector trend

### Ranking Endpoints
- `GET /api/states/top?year=2023&limit=5` - Top states
- `GET /api/sectors/top?year=2023&limit=5` - Top sectors

### Similarity Endpoints
- `GET /api/similarity/states?state=CA&limit=5` - Similar states
- `GET /api/similarity/sectors?sector=Power Plants&limit=5` - Similar sectors

### Facility Endpoints
- `GET /api/facility/list?state=TX&year=2023&limit=10` - Facility list

### Analytics Endpoints
- `GET /api/states/low_emission?year=2023&percentile=25` - Low emission states
- `GET /api/states/reduction?threshold=20&baseline_year=2010` - States with reduction
- `GET /api/states/high_methane?year=2023&threshold=5` - High methane states

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## CORS

The API is configured to allow CORS from all origins. In production, update `main.py` to restrict origins.

## Data Loading

All CSV files are loaded into memory on startup for fast response times. The server will print loading status on startup.



