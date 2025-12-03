#!/usr/bin/env python3
"""
Simple HTTP server for running the dashboard locally.
Serves files from the dashboard directory and allows CORS for CSV loading.
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Change to dashboard directory
dashboard_dir = Path(__file__).parent
os.chdir(dashboard_dir)

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress default logging
        pass

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
            print("=" * 60)
            print("US GHG Emissions Dashboard Server")
            print("=" * 60)
            print(f"\nServer running at: http://localhost:{PORT}")
            print(f"Serving from: {dashboard_dir}")
            print("\nPress Ctrl+C to stop the server")
            print("=" * 60)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print("Try a different port or stop the existing server.")
        else:
            print(f"\nError: {e}")
        sys.exit(1)



