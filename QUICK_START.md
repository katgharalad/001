# 🚀 Quick Start Guide

## The Problem: KPIs Showing Zero / Buttons Not Working

**This happens when the backend API is not running!**

The frontend is trying to connect to `http://localhost:8001` but can't reach it.

## Solution: Start Both Servers

### Option 1: Use the Startup Script (Easiest)

```bash
./start_servers.sh
```

This starts both backend and frontend automatically.

### Option 2: Manual Start (2 Terminals)

**Terminal 1 - Start Backend:**
```bash
cd backend
pip install -r requirements.txt  # First time only
python main.py
```

You should see:
```
Loading data files...
✓ Loaded state-year data: 756 rows
✓ Loaded sector-year data: 849 rows
...
INFO:     Uvicorn running on http://0.0.0.0:8001
```

**Terminal 2 - Start Frontend:**
```bash
cd dashboard
python3 server.py
```

You should see:
```
Server running at: http://localhost:8000
```

## Verify It's Working

1. **Check Backend:**
   - Open: http://localhost:8001/docs
   - You should see Swagger API documentation

2. **Check Frontend:**
   - Open: http://localhost:8000
   - KPIs should show real numbers (not zeros)
   - Charts should display data
   - Buttons should work

3. **Test API Directly:**
```bash
curl http://localhost:8001/api/summary/us?year=2023
```

Should return JSON with emissions data.

## Troubleshooting

### "Connection Refused" Error
- **Backend not running** → Start it in Terminal 1
- **Wrong port** → Check backend is on port 8001

### KPIs Still Zero
- Check browser console (F12) for errors
- Verify backend is running: http://localhost:8001/docs
- Check CORS is enabled in backend

### Buttons Don't Work
- Check browser console for JavaScript errors
- Verify `dashboard.js` is loaded (check Network tab)
- Make sure backend is responding

### Data Files Missing
```bash
# Run the pipeline first to generate CSVs
python run_pipeline.py
```

## Expected Behavior

✅ **When Working:**
- KPIs show real numbers (billions/millions)
- Hero chart displays trend line
- Mini bar chart shows top 5 states
- Year navigation (‹ ›) updates data
- Timeline filters work
- No error messages in console

❌ **When Not Working:**
- KPIs show "0" or empty
- Charts are blank
- Buttons don't respond
- Red error banner appears
- Console shows connection errors

## Quick Test

Run the integration test:
```bash
python3 test_integration.py
```

This will tell you exactly what's wrong!



