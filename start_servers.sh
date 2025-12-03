#!/bin/bash
# Start both backend API and frontend dashboard servers

echo "=========================================="
echo "Starting GHG Dashboard Servers"
echo "=========================================="
echo ""

# Check if data files exist
if [ ! -d "data_processed" ] || [ ! -f "data_processed/ghg_state_year.csv" ]; then
    echo "⚠ Warning: Data files not found. Run 'python run_pipeline.py' first."
    echo ""
fi

# Start backend API server
echo "Starting Backend API (port 8001)..."
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend dashboard server
echo "Starting Frontend Dashboard (port 8000)..."
cd dashboard
python3 server.py &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "Servers Started!"
echo "=========================================="
echo ""
echo "Backend API:  http://localhost:8001"
echo "API Docs:     http://localhost:8001/docs"
echo "Frontend:     http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait



