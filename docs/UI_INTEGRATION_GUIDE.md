# **GHG Dashboard Integration Guide (Python Pipeline → UI)**

### *How to wire the backend analysis into the neon dashboard UI*

**Version 1 — December 2024**

---

# **1. High-Level Architecture**

```
[Python Pipeline] → [Processed CSVs] → [FastAPI Backend Endpoints] → [Dashboard Frontend] → UI Components
```

## The Flow:

1. **Python pipeline** (`run_pipeline.py` / `run_analysis.py`)
   - Generates **6 processed CSVs** and **PNG visualizations**
   - Located in `/data_processed/`

2. **Backend** (FastAPI or Flask)
   - Exposes REST endpoints that read these processed CSVs on demand
   - Filters/aggregates data using pandas
   - Returns JSON responses

3. **Frontend** (Current: Vanilla JS + Chart.js)
   - Uses API endpoints to populate each UI widget:
     * charts
     * summary cards
     * filters
     * similarity widgets
     * state/sector explorers

---

# **2. Files the UI Uses (Directly)**

Your pipeline produces:

## **Core Analytics CSVs**

| File                      | Purpose                                       | Location                    |
| ------------------------- | --------------------------------------------- | --------------------------- |
| `ghg_state_year.csv`      | Line charts, US-wide trend, state comparisons | `/data_processed/`          |
| `ghg_sector_year.csv`     | Sector trends, sector emissions shares        | `/data_processed/`          |
| `similarity_states.csv`   | State similarity widget + recommendations    | `/data_processed/`          |
| `similarity_sectors.csv`  | Sector similarity widget                      | `/data_processed/`          |
| `ghg_all_years_clean.csv` | Facility-level detail queries                 | `/data_processed/`          |
| `ghg_facility_clean.csv`  | Facility explorer list/table                  | `/data_processed/`          |

## **Visualizations**

| File                              | Purpose                                   | Location                    |
| --------------------------------- | ----------------------------------------- | --------------------------- |
| `trend_emissions_over_time.png`   | Background reference for "Activity Chart" | `/data_processed/`          |
| `top5_states.png`                 | Sidebar or mini-widget                    | `/data_processed/`          |
| `top5_sectors.png`                 | Sector overview                           | `/data_processed/`          |
| `emissions_distribution.png`      | Distribution analysis                     | `/data_processed/`          |
| `co2_vs_ch4.png`                  | Relationship visualization                | `/data_processed/`          |
| `emissions_by_sector_pie.png`     | Sector breakdown                          | `/data_processed/`          |

---

# **3. API Endpoints You Must Implement**

The UI expects real-time, filterable data. These **backend endpoints** sit between the UI and CSV output.

---

## **3.1 Filters**

The frontend requires:

### Pickers:

* **Year Selector** (2010 – 2023)
* **Level Selector**:
  * US Overview
  * By State
  * By Sector

### Query Format to Backend:

```
GET /api/summary/us?year=2023
GET /api/summary/state?state=CA&year=2021
GET /api/summary/sector?sector=Power Plants&year=2020
```

---

## **3.2 Required Routes**

### 1. **US Summary**

```
GET /api/summary/us?year=2023
```

**Returns:**

```json
{
  "year": 2023,
  "total_emissions": 2382840418.28,
  "co2": 1850000000,
  "ch4": 350000000,
  "n2o": 180000000,
  "facilities_reporting": 6470,
  "percent_change_from_2010": -25.46,
  "co2_share": 0.78,
  "ch4_share": 0.15,
  "n2o_share": 0.07
}
```

**Data Source:** `ghg_state_year.csv` aggregated by year

---

### 2. **State Summary**

```
GET /api/summary/state?state=TX&year=2023
```

**Returns:**

```json
{
  "state": "TX",
  "year": 2023,
  "total_emissions": 710000000,
  "co2": 550000000,
  "ch4": 120000000,
  "n2o": 40000000,
  "facility_count": 435,
  "trend_since_2010": -18.3,
  "ranking": 1,
  "percent_of_us_total": 29.8
}
```

**Data Source:** `ghg_state_year.csv` filtered by state and year

---

### 3. **Sector Summary**

```
GET /api/summary/sector?sector=Power Plants&year=2023
```

**Returns:**

```json
{
  "sector": "Power Plants",
  "year": 2023,
  "total_emissions": 1850000000,
  "co2": 1800000000,
  "ch4": 40000000,
  "n2o": 10000000,
  "facility_count": 1200,
  "percent_of_total": 77.6,
  "trend_since_2010": -22.1
}
```

**Data Source:** `ghg_sector_year.csv` filtered by sector and year

---

### 4. **US Trend Line**

```
GET /api/chart/us_trend
```

**Returns:**

```json
[
  {"year": 2010, "emissions": 3196571655.32, "facilities": 6297},
  {"year": 2011, "emissions": 3207582994.00, "facilities": 6907},
  {"year": 2012, "emissions": 3058075792.60, "facilities": 7102},
  ...
  {"year": 2023, "emissions": 2382840418.28, "facilities": 6470}
]
```

**Data Source:** `ghg_state_year.csv` aggregated by year

---

### 5. **State Trend**

```
GET /api/chart/state_trend?state=TX
```

**Returns:**

```json
[
  {"year": 2010, "emissions": 850000000, "facilities": 420},
  {"year": 2011, "emissions": 830000000, "facilities": 425},
  ...
  {"year": 2023, "emissions": 710000000, "facilities": 435}
]
```

**Data Source:** `ghg_state_year.csv` filtered by state

---

### 6. **Sector Trend**

```
GET /api/chart/sector_trend?sector=Power Plants
```

**Returns:**

```json
[
  {"year": 2010, "emissions": 2500000000, "facilities": 1100},
  {"year": 2011, "emissions": 2450000000, "facilities": 1150},
  ...
  {"year": 2023, "emissions": 1850000000, "facilities": 1200}
]
```

**Data Source:** `ghg_sector_year.csv` filtered by sector

---

### 7. **Top States**

```
GET /api/states/top?year=2023&limit=5
```

**Returns:**

```json
{
  "year": 2023,
  "states": [
    {"state": "TX", "emissions": 710000000, "rank": 1, "percent": 29.8},
    {"state": "LA", "emissions": 280000000, "rank": 2, "percent": 11.7},
    {"state": "IN", "emissions": 260000000, "rank": 3, "percent": 10.9},
    {"state": "FL", "emissions": 240000000, "rank": 4, "percent": 10.1},
    {"state": "PA", "emissions": 230000000, "rank": 5, "percent": 9.7}
  ]
}
```

**Data Source:** `ghg_state_year.csv` filtered by year, sorted by emissions

---

### 8. **Top Sectors**

```
GET /api/sectors/top?year=2023&limit=5
```

**Returns:**

```json
{
  "year": 2023,
  "sectors": [
    {"sector": "Power Plants", "emissions": 1850000000, "rank": 1, "percent": 77.6},
    {"sector": "Minerals", "emissions": 120000000, "rank": 2, "percent": 5.0},
    {"sector": "Other", "emissions": 110000000, "rank": 3, "percent": 4.6},
    {"sector": "Waste", "emissions": 105000000, "rank": 4, "percent": 4.4},
    {"sector": "Chemicals", "emissions": 100000000, "rank": 5, "percent": 4.2}
  ]
}
```

**Data Source:** `ghg_sector_year.csv` filtered by year, sorted by emissions

---

### 9. **Similarity: States**

```
GET /api/similarity/states?state=CA
```

**Backend loads `similarity_states.csv` and returns:**

```json
{
  "target": "CA",
  "most_similar": [
    {"state": "NY", "score": 0.91, "similarity": "High"},
    {"state": "TX", "score": 0.88, "similarity": "High"},
    {"state": "FL", "score": 0.84, "similarity": "High"},
    {"state": "IL", "score": 0.79, "similarity": "Medium"},
    {"state": "PA", "score": 0.76, "similarity": "Medium"}
  ],
  "least_similar": [
    {"state": "WY", "score": 0.12, "similarity": "Low"},
    {"state": "VT", "score": 0.15, "similarity": "Low"}
  ]
}
```

**Data Source:** `similarity_states.csv` - cosine similarity matrix

**This powers the "similar state profiles" widget.**

---

### 10. **Similarity: Sectors**

```
GET /api/similarity/sectors?sector=Power Plants
```

**Returns:**

```json
{
  "target": "Power Plants",
  "most_similar": [
    {"sector": "Manufacturing", "score": 0.85},
    {"sector": "Chemicals", "score": 0.82},
    ...
  ]
}
```

**Data Source:** `similarity_sectors.csv`

---

### 11. **Facility-Level Detail**

```
GET /api/facility/list?state=TX&year=2023&limit=10
```

**Returns:**

```json
{
  "state": "TX",
  "year": 2023,
  "facilities": [
    {
      "facility_id": 1013701,
      "facility_name": "Scherer",
      "city": "Juliette",
      "total_emissions": 22985002.66,
      "co2": 22800874.90,
      "ch4": 120000,
      "n2o": 50000,
      "industry_type_sectors": "Power Plants"
    },
    ...
  ],
  "total_count": 435
}
```

**Data Source:** `ghg_facility_clean.csv` or `ghg_all_years_clean.csv` filtered by state and year

**This powers:**
* tables,
* detailed views,
* "state leaders" panel.

---

### 12. **Low-Emission States**

```
GET /api/states/low_emission?year=2023&percentile=25
```

**Returns:**

```json
{
  "year": 2023,
  "percentile": 25,
  "threshold": 15000000,
  "states": [
    {"state": "VT", "emissions": 8000000, "rank": 1},
    {"state": "RI", "emissions": 12000000, "rank": 2},
    {"state": "NH", "emissions": 14000000, "rank": 3},
    ...
  ],
  "count": 13
}
```

**Data Source:** `ghg_state_year.csv` - states below 25th percentile

---

### 13. **States with Reduction**

```
GET /api/states/reduction?threshold=20&baseline_year=2010
```

**Returns:**

```json
{
  "baseline_year": 2010,
  "threshold_percent": 20,
  "states": [
    {
      "state": "CA",
      "emissions_2010": 180000000,
      "emissions_2023": 135000000,
      "reduction_percent": -25.0,
      "reduction_absolute": -45000000
    },
    ...
  ]
}
```

**Data Source:** `ghg_state_year.csv` - compare 2010 vs latest year

---

### 14. **High Methane States**

```
GET /api/states/high_methane?year=2023&threshold=5
```

**Returns states where CH4 > 5% of total emissions:**

```json
{
  "year": 2023,
  "threshold_percent": 5,
  "states": [
    {
      "state": "TX",
      "total_emissions": 710000000,
      "ch4_emissions": 120000000,
      "ch4_percent": 16.9
    },
    ...
  ]
}
```

**Data Source:** `ghg_state_year.csv` - calculate CH4 share per state

---

# **4. Mapping UI Components → Backend Data**

Below is a **direct mapping** between the dashboard UI and what data you feed into it.

---

## **Home Dashboard**

### Component 1: **Total Emissions Activity (big neon bubble)**

**Uses:**
* `/api/summary/us?year=2023`
* `/api/chart/us_trend`

**Displayed:**
* Total emissions number (formatted: "$2.4B CO₂e")
* Year (2023)
* Difference vs baseline (2010 or previous year)
* Percentage change indicator (green/red)

**Current Implementation:** `dashboard.js` → `updateKPIs()` → `updateHeroChart()`

---

### Component 2: **US Trend Line Chart (Hero Chart)**

**Uses:**
* `/api/chart/us_trend`

**Displayed:**
* Line chart showing emissions from 2010-2023
* X-axis: Years
* Y-axis: Emissions (in millions/billions)
* Tooltips with year, emissions, % change

**Current Implementation:** `dashboard.js` → `updateHeroChart()` → Chart.js

---

### Component 3: **State Leaders (Mini Bar Chart - Right Panel)**

**Uses:**
* `/api/states/top?year=2023&limit=5`

**Displayed:**
* Vertical bars for top 5 states
* State abbreviations on Y-axis
* Emissions values on X-axis
* Min/Max labels below chart

**Current Implementation:** `dashboard.js` → `updateMiniBarChart()`

---

### Component 4: **Summary Cards at Bottom**

**Cards you already have:**

| Card                     | Backend Source                                    | Current Element ID    |
| ------------------------ | ------------------------------------------------- | --------------------- |
| **Total US Emissions**   | `/api/summary/us?year=2023`                      | `kpi1-value`          |
| **Power Sector Share**   | `/api/summary/sector?sector=Power Plants&year=2023` | `kpi2-value`          |
| **Facilities Reporting** | `/api/summary/us?year=2023` → `facilities_reporting` | `kpi3-value`          |
| **Low-Emission States**  | `/api/states/low_emission?year=2023&percentile=25` | `kpi4-value`          |

**Current Implementation:** `dashboard.js` → `updateKPIs()`

---

### Component 5: **Filter Buttons (US Overview / By State / By Sector)**

**Backend Behavior:**

* When user selects **US Overview**, frontend calls:
  * `/api/summary/us?year=2023`
  * `/api/chart/us_trend`

* When user selects **By State**, frontend calls:
  * `/api/summary/state?state=XX&year=2023`
  * `/api/chart/state_trend?state=XX`

* For **By Sector**, frontend calls:
  * `/api/summary/sector?sector=Power Plants&year=2023`
  * `/api/chart/sector_trend?sector=Power Plants`

**Current Implementation:** `dashboard.js` → View pills event listeners

---

### Component 6: **Timeline Widgets (Right Sidebar)**

**Widgets in your UI:**

| Widget                      | Backend Endpoint                                  | Current Filter ID      |
| --------------------------- | ------------------------------------------------- | ---------------------- |
| **Power Sector Only**       | `/api/summary/sector?sector=Power Plants&year=2023` | `power-sector`         |
| **Top 5 States by Emissions** | `/api/states/top?year=2023&limit=5`              | `top5-states`          |
| **States with >20% Reduction** | `/api/states/reduction?threshold=20&baseline_year=2010` | `reduction-states`     |
| **High Methane States**     | `/api/states/high_methane?year=2023&threshold=5` | `high-methane`         |
| **Show All Data**           | `/api/summary/us?year=2023`                      | `all-data`             |

**Current Implementation:** `dashboard.js` → Timeline item click handlers

---

### Component 7: **Decarbonization Progress Sparkline**

**Data:**
* `/api/chart/us_trend` (inverted for "progress" - down = good)

**Displayed:**
* Small line chart showing normalized emission trend
* Status pill: "On Track" / "Off Track"
* Green line indicating progress (emissions decreasing)

**Current Implementation:** `dashboard.js` → `updateProgressChart()`

---

### Component 8: **Stat Pills (States Covered, Facilities, etc.)**

**Data:**
* `/api/summary/us` → metadata
* Or computed from CSV metadata

**Displayed:**
* States Covered: 50
* Facilities: 8000+
* Sectors: 30
* Years: 2010–2023
* Data Points: 100K+

**Current Implementation:** `dashboard.js` → `updateStats()`

---

# **5. Frontend Structure (Current)**

Your current frontend structure:

```
/dashboard
   index.html          # Main dashboard HTML
   styles.css          # Dark/neon styling
   dashboard.js        # Main controller & Chart.js integration
   data-loader.js      # CSV loading utility (needs API replacement)
   server.py           # Local dev server
```

## **Current Data Flow (Needs Backend Integration):**

1. **Current:** `data-loader.js` loads CSVs directly via `fetch()`
2. **Target:** Replace with API calls to backend endpoints
3. **Migration:** Update `dashboard.js` to use `fetch('/api/...')` instead of CSV loading

---

# **6. Data Refresh Strategy**

You do **NOT** need to rerun the pipeline each request.

## **Recommended Model:**

### **Pipeline:**
* Run once → produces stable CSVs in `/data_processed/`
* Optional: schedule a weekly/monthly refresh
* Command: `python run_pipeline.py`

### **Backend:**
* Loads CSVs into memory on startup (`pandas.read_csv`)
* Serves data fast (no re-computation)
* Recalculates small aggregates on the fly (filtering, sorting)
* Caches frequently accessed endpoints

**This makes charts load instantly.**

---

# **7. Example Response Formats (for Implementation)**

## **Example: US Summary**

```
GET /api/summary/us?year=2023
```

```json
{
  "year": 2023,
  "total_emissions": 2382840418.28,
  "co2": 1850000000,
  "ch4": 350000000,
  "n2o": 180000000,
  "facilities_reporting": 6470,
  "percent_change_from_2010": -25.46,
  "co2_share": 0.776,
  "ch4_share": 0.147,
  "n2o_share": 0.076
}
```

## **Example: State Trend Chart**

```
GET /api/chart/state_trend?state=TX
```

```json
[
  {"year": 2010, "emissions": 850000000, "facilities": 420},
  {"year": 2011, "emissions": 830000000, "facilities": 425},
  {"year": 2012, "emissions": 810000000, "facilities": 428},
  ...
  {"year": 2023, "emissions": 710000000, "facilities": 435}
]
```

## **Example: Top States**

```
GET /api/states/top?year=2023&limit=5
```

```json
{
  "year": 2023,
  "limit": 5,
  "states": [
    {
      "state": "TX",
      "emissions": 710000000,
      "rank": 1,
      "percent_of_total": 29.8,
      "facility_count": 435
    },
    {
      "state": "LA",
      "emissions": 280000000,
      "rank": 2,
      "percent_of_total": 11.7,
      "facility_count": 180
    },
    ...
  ]
}
```

---

# **8. Implementation Instructions (for Cursor/Developers)**

## **Backend Implementation (FastAPI Example)**

```python
# backend/main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSVs on startup
DATA_DIR = Path("../data_processed")
state_year_df = pd.read_csv(DATA_DIR / "ghg_state_year.csv")
sector_year_df = pd.read_csv(DATA_DIR / "ghg_sector_year.csv")
similarity_states_df = pd.read_csv(DATA_DIR / "similarity_states.csv")
facility_df = pd.read_csv(DATA_DIR / "ghg_facility_clean.csv")

@app.get("/api/summary/us")
async def get_us_summary(year: int = Query(2023)):
    """Get US-wide summary for a given year."""
    year_data = state_year_df[state_year_df['year'] == year]
    
    total = year_data['total_emissions'].sum()
    baseline = state_year_df[state_year_df['year'] == 2010]['total_emissions'].sum()
    pct_change = ((total - baseline) / baseline) * 100
    
    return {
        "year": year,
        "total_emissions": float(total),
        "facilities_reporting": int(year_data['facility_count'].sum()),
        "percent_change_from_2010": round(pct_change, 2)
    }

@app.get("/api/chart/us_trend")
async def get_us_trend():
    """Get US emissions trend 2010-2023."""
    trend = state_year_df.groupby('year').agg({
        'total_emissions': 'sum',
        'facility_count': 'sum'
    }).reset_index()
    
    return trend.to_dict('records')

# ... more endpoints
```

## **Frontend Integration (Update dashboard.js)**

```javascript
// Replace data-loader.js CSV loading with API calls

class Dashboard {
    async fetchUSSummary(year) {
        const response = await fetch(`/api/summary/us?year=${year}`);
        return await response.json();
    }
    
    async fetchUSTrend() {
        const response = await fetch('/api/chart/us_trend');
        return await response.json();
    }
    
    async fetchTopStates(year, limit = 5) {
        const response = await fetch(`/api/states/top?year=${year}&limit=${limit}`);
        return await response.json();
    }
    
    // Update existing methods to use API
    async updateKPIs() {
        const summary = await this.fetchUSSummary(this.currentYear);
        document.getElementById('kpi1-value').textContent = this.formatLargeNumber(summary.total_emissions);
        // ... rest of updates
    }
}
```

---

# **9. File Structure for Complete Integration**

```
dataproj2/
├── data_processed/          # CSV outputs from pipeline
│   ├── ghg_all_years_clean.csv
│   ├── ghg_state_year.csv
│   ├── ghg_sector_year.csv
│   ├── similarity_states.csv
│   └── ...
│
├── dashboard/               # Frontend (current)
│   ├── index.html
│   ├── styles.css
│   ├── dashboard.js         # Needs API integration
│   └── data-loader.js      # Replace with API calls
│
├── backend/                 # NEW: FastAPI backend
│   ├── main.py             # API endpoints
│   ├── models.py           # Data models
│   ├── utils.py            # CSV loading helpers
│   └── requirements.txt
│
└── docs/
    └── UI_INTEGRATION_GUIDE.md  # This file
```

---

# **10. Migration Checklist**

## **Phase 1: Backend Setup**
- [ ] Create FastAPI backend structure
- [ ] Implement all 14 API endpoints
- [ ] Load CSVs into memory on startup
- [ ] Add CORS middleware
- [ ] Test endpoints with Postman/curl

## **Phase 2: Frontend Integration**
- [ ] Update `dashboard.js` to use API endpoints
- [ ] Replace `data-loader.js` CSV loading with `fetch()` calls
- [ ] Update error handling for API failures
- [ ] Add loading states for async data

## **Phase 3: Testing**
- [ ] Test all filters (year, state, sector)
- [ ] Verify chart data updates correctly
- [ ] Test similarity widgets
- [ ] Verify facility list queries
- [ ] Performance test (response times)

## **Phase 4: Deployment**
- [ ] Deploy backend (FastAPI on port 8000)
- [ ] Update frontend API base URL
- [ ] Test end-to-end
- [ ] Monitor API performance

---

# **11. Final Result: What the Dashboard Will Achieve**

When this integration is complete, your UI will:

✅ Show US climate trends from 2010–2023  
✅ Show state-by-state comparisons  
✅ Allow users to pick any year (2010-2023)  
✅ Display similarity between states (cosine similarity from your analysis)  
✅ Highlight top emitters and top reducers  
✅ Visualize sector-by-sector decarbonization  
✅ Display facility-level details  
✅ Filter by state, sector, year in real-time  
✅ Behave like a **mini EPA FLIGHT tool but cooler**  
✅ Feel like a **2025 neon cyber dashboard**  

---

# **12. Next Steps**

## **Option 1: Generate Backend**
Say: **"generate backend"** - I'll create:
- Complete FastAPI backend with all endpoints
- CSV loading utilities
- Error handling
- CORS setup
- Requirements.txt

## **Option 2: Generate Frontend Updates**
Say: **"generate frontend integration"** - I'll create:
- Updated `dashboard.js` with API calls
- New API service layer
- Error handling
- Loading states

## **Option 3: Generate Both**
Say: **"generate full integration"** - I'll create:
- Complete backend
- Updated frontend
- Integration tests
- Deployment guide

---

**This document is your complete blueprint for integrating the Python pipeline with the dashboard UI.**



