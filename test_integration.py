#!/usr/bin/env python3
"""
Quick test to verify frontend-backend integration
"""

import requests
import time
import sys

def test_backend():
    """Test if backend is running and responding."""
    print("Testing Backend API...")
    try:
        # Test root endpoint
        response = requests.get("http://localhost:8001/", timeout=2)
        if response.status_code == 200:
            print("✓ Backend is running on port 8001")
            return True
        else:
            print(f"✗ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Backend is NOT running on port 8001")
        print("  Start it with: cd backend && python main.py")
        return False
    except Exception as e:
        print(f"✗ Error testing backend: {e}")
        return False

def test_endpoints():
    """Test key API endpoints."""
    print("\nTesting API Endpoints...")
    
    endpoints = [
        ("/api/summary/us?year=2023", "US Summary"),
        ("/api/chart/us_trend", "US Trend"),
        ("/api/states/top?year=2023&limit=5", "Top States"),
    ]
    
    all_passed = True
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"http://localhost:8001{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✓ {name}: {len(str(data))} bytes")
            else:
                print(f"✗ {name}: Status {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"✗ {name}: {e}")
            all_passed = False
    
    return all_passed

def test_frontend():
    """Test if frontend is accessible."""
    print("\nTesting Frontend...")
    try:
        response = requests.get("http://localhost:8000/", timeout=2)
        if response.status_code == 200:
            print("✓ Frontend is running on port 8000")
            # Check if dashboard.js references the API
            if 'apiBaseUrl' in response.text or 'localhost:8001' in response.text:
                print("✓ Frontend is configured to use backend API")
            return True
        else:
            print(f"✗ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Frontend is NOT running on port 8000")
        print("  Start it with: cd dashboard && python3 server.py")
        return False
    except Exception as e:
        print(f"✗ Error testing frontend: {e}")
        return False

def main():
    print("=" * 60)
    print("GHG Dashboard Integration Test")
    print("=" * 60)
    print()
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    if backend_ok:
        endpoints_ok = test_endpoints()
    else:
        endpoints_ok = False
    
    print("\n" + "=" * 60)
    print("Integration Status")
    print("=" * 60)
    print(f"Backend Running:    {'✓' if backend_ok else '✗'}")
    print(f"Frontend Running:   {'✓' if frontend_ok else '✗'}")
    print(f"API Endpoints:       {'✓' if endpoints_ok else '✗'}")
    print()
    
    if backend_ok and frontend_ok and endpoints_ok:
        print("✅ FULLY INTEGRATED - Everything is connected!")
        print("\nAccess:")
        print("  Frontend: http://localhost:8000")
        print("  Backend:  http://localhost:8001")
        print("  API Docs: http://localhost:8001/docs")
        return 0
    else:
        print("⚠️  NOT FULLY INTEGRATED")
        print("\nTo start both servers:")
        print("  ./start_servers.sh")
        print("\nOr manually:")
        print("  Terminal 1: cd backend && python main.py")
        print("  Terminal 2: cd dashboard && python3 server.py")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted")
        sys.exit(1)



