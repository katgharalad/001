# Vercel Deployment Guide

## Overview

This application uses **Next.js API Routes** instead of a separate backend server, making it fully deployable on Vercel without any external services.

## How It Works

1. **API Routes**: All backend functionality has been converted to Next.js API routes in `/app/api/`
2. **CSV Data**: The processed CSV files in `/data_processed/` are read by the API routes
3. **No External Backend**: Everything runs as serverless functions on Vercel

## API Endpoints

All endpoints are available at `/api/*`:

- `/api/chart/us_trend` - US emissions trend 2010-2023
- `/api/states/top?year=2023&limit=5` - Top states by emissions
- `/api/sectors/top?year=2023&limit=5` - Top sectors by emissions
- `/api/facility/list?year=2023&limit=10` - Facility list with filters
- `/api/dataset/stats` - Dataset statistics
- `/api/dataset/sample?limit=5` - Sample facility data
- `/api/similarity/states?state=TX&limit=3` - Similar states

## Deployment Steps

1. **Push to GitHub**: The repository is already connected to Vercel
2. **Vercel will automatically**:
   - Build the Next.js application
   - Deploy all API routes as serverless functions
   - Serve static files from `/public`
   - Make CSV files accessible to API routes

## Environment Variables

No environment variables are required! The app automatically uses:
- `/api` for API calls in production (relative URLs)
- `http://localhost:8001` for local development (if backend is running)

To use a custom API URL, set:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## Data Files

The CSV files in `/data_processed/` are:
- Included in the git repository
- Available to API routes at build/runtime
- Read using Node.js `fs` module in serverless functions

## Local Development

For local development, you can either:

1. **Use Next.js API routes** (recommended):
   ```bash
   npm run dev
   ```
   The app will use `/api` routes automatically.

2. **Use the FastAPI backend** (optional):
   ```bash
   cd backend
   python main.py
   ```
   Then set `NEXT_PUBLIC_API_URL=http://localhost:8001` in `.env.local`

## Troubleshooting

### API routes return 500 errors
- Check that CSV files exist in `/data_processed/`
- Verify CSV files are committed to git
- Check Vercel build logs for file read errors

### Data not loading
- Verify API routes are accessible at `/api/*`
- Check browser console for fetch errors
- Ensure CSV files are properly formatted

## File Structure

```
/app/api/          # Next.js API routes (serverless functions)
/data_processed/   # CSV data files (read by API routes)
/public/           # Static assets
/hooks/            # React hooks (use /api routes)
```

