#!/usr/bin/env python3

import os
import sys
import subprocess

# Set the current directory to the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

def start_forecaster_api():
    """
    Starts the Forecaster Market Data API
    """
    try:
        print("Starting Forecaster Market Data API...")
        os.environ["FORECASTER_API_DEBUG"] = "True"
        os.environ["FORECASTER_API_PORT"] = "8080"
        
        # Run the API
        subprocess.run([sys.executable, "api/market_data_api.py"], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"Error starting Forecaster API: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nForecaster API stopped by user.")

if __name__ == "__main__":
    start_forecaster_api()
