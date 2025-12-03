#!/bin/bash
# Start the backend API server

echo "=========================================="
echo "Starting GHG Dashboard Backend API"
echo "=========================================="
echo ""

# Check if data files exist
if [ ! -d "data_processed" ] || [ ! -f "data_processed/ghg_state_year.csv" ]; then
    echo "⚠ Warning: Data files not found!"
    echo "Run 'python run_pipeline.py' first to generate data."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    cd backend
    pip3 install -r requirements.txt
    cd ..
fi

# Start backend
echo "Starting backend on http://localhost:8001"
echo "API Docs will be at: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd backend
python3 main.py



