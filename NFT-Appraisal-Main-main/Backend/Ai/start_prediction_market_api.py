#!/usr/bin/env python3
import os
from prediction_market_api import app

if __name__ == "__main__":
    # Set host and port for the Prediction Market API
    HOST = os.getenv("PREDICTION_MARKET_API_HOST", "0.0.0.0")
    PORT = int(os.getenv("PREDICTION_MARKET_API_PORT", 5001))
    DEBUG = os.getenv("PREDICTION_MARKET_API_DEBUG", "False").lower() == "true"
    
    # Start the Flask API server
    print(f"Starting Prediction Market API on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
