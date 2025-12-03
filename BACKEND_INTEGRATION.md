# Backend Integration Status

## ✅ Backend Server

**Status:** Running on `http://localhost:8001`

**Start Command:**
```bash
cd backend
python3 main.py
```

Or use the startup script:
```bash
./start_backend.sh
```

## ✅ Data Integration Complete

All sections of the `/ghg-project` page now fetch real data from the backend API:

### Integrated Sections

1. **National Trends** (`NationalTrendSection`)
   - ✅ Uses `/api/chart/us_trend`
   - Converts metric tons to billions for display
   - Shows real 2010-2023 trend data

2. **Top Emitting States** (`TopStatesSection`)
   - ✅ Uses `/api/states/top?year={year}&limit=5`
   - Updates when global year selector changes
   - Converts metric tons to millions for display

3. **Top Emitting Sectors** (`TopSectorsSection`)
   - ✅ Uses `/api/sectors/top?year={year}&limit=5`
   - Updates when global year selector changes
   - Converts metric tons to millions for display

4. **Sectoral Composition** (`ProportionSection`)
   - ✅ Uses `/api/sectors/top?year={year}&limit=10`
   - Groups top 4 sectors + "Other"
   - Updates when global year selector changes

5. **Distribution of Emissions** (`DistributionSection`)
   - ✅ Uses `/api/facility/list?limit=5000`
   - Creates histogram bins from real facility data
   - Log-scale transformation for better visualization

6. **CO₂ vs CH₄ Relationship** (`RelationshipSection`)
   - ✅ Uses `/api/facility/list?limit=500`
   - Real scatter plot data with sector color coding
   - Shows actual facility-level relationships

7. **Outliers & Anomalies** (`OutliersSection`)
   - ✅ Uses `/api/facility/list?limit=100`
   - Calculates z-scores from real data
   - Shows top 5 outlier facilities with real names

8. **State Similarity** (`SimilaritySection`)
   - ✅ Uses `/api/similarity/states?state={state}&limit=3`
   - Real cosine similarity scores from processed data
   - Dynamic state selector

### Data Hooks

All hooks are in `/hooks/`:
- `useGhgData.ts` - National trends, top states, top sectors
- `useProportionData.ts` - Sector proportions (pie chart)
- `useDistributionData.ts` - Facility emissions distribution
- `useRelationshipData.ts` - CO₂ vs CH₄ scatter plot
- `useOutlierData.ts` - Outlier facility detection
- `useSimilarityData.ts` - State similarity scores

### Error Handling

All hooks include:
- Loading states
- Error handling with fallback to mock data
- Proper data type conversions (metric tons → millions/billions)

### Global Year Selector

- Fixed position at top center of page
- Updates all year-dependent sections simultaneously
- Available years: 2010, 2015, 2020, 2023

## API Endpoints Used

- `GET /api/chart/us_trend` - National emissions trend
- `GET /api/states/top?year={year}&limit=5` - Top states by year
- `GET /api/sectors/top?year={year}&limit=10` - Top sectors by year
- `GET /api/facility/list?limit={n}` - Facility-level data
- `GET /api/similarity/states?state={state}&limit=3` - State similarity

## Data Conversions

- **National trends**: Metric tons → Billions (÷ 1e9)
- **State/Sector emissions**: Metric tons → Millions (÷ 1e6)
- **Facility emissions**: Metric tons → Millions (÷ 1e6)

## Testing

To verify backend is running:
```bash
curl http://localhost:8001/
```

To test an endpoint:
```bash
curl "http://localhost:8001/api/states/top?year=2023&limit=5"
```

## Notes

- Backend must be running for data to load
- If backend is unavailable, hooks fall back to mock data
- All data is fetched client-side (no SSR)
- Charts update automatically when year selector changes



