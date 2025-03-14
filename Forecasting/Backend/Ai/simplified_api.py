#!/usr/bin/env python3

import os
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/query_data_feeds', methods=['GET'])
def query_data_feeds_api():
    """API endpoint to query available data feeds"""
    try:
        # Get network parameter from request
        network = request.args.get('network', 'flare')
        
        # Simulate available feeds for different networks
        available_feeds = {
            'BTC/USD': 'Bitcoin',
            'ETH/USD': 'Ethereum',
            'XRP/USD': 'XRP',
            'FLR/USD': 'Flare',
            'DOGE/USD': 'Dogecoin',
            'SOL/USD': 'Solana',
            'AVAX/USD': 'Avalanche',
            'BNB/USD': 'Binance Coin',
            'USDC/USD': 'USD Coin',
            'USDT/USD': 'Tether'
        }
        
        return jsonify({
            "available_feeds": available_feeds,
            "network": network,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

@app.route('/fetch_feed_data', methods=['GET'])
def fetch_feed_data_api():
    """API endpoint to fetch detailed data for a specific feed"""
    try:
        # Get parameters from the request
        feed_id = request.args.get('feed_id')
        network = request.args.get('network', 'flare')
        
        if not feed_id:
            return jsonify({
                "error": "Missing feed_id parameter",
                "status": "failed"
            }), 400
        
        # Generate a seed from the feed_id for consistent random values
        random.seed(hash(feed_id))
        
        # Generate sample data based on the feed ID
        feed_data = generate_sample_feed_data(feed_id)
        
        return jsonify({
            "feed_data": feed_data,
            "network": network,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

def generate_sample_feed_data(feed_id):
    """Generate sample feed data with realistic values"""
    # Determine if it's a major asset
    is_major_asset = any(asset in feed_id.lower() for asset in ['btc', 'eth', 'xrp', 'flr', 'usd'])
    
    # Set base value depending on the asset
    base_value = 0
    if 'btc' in feed_id.lower():
        base_value = 60000 + random.uniform(-2000, 2000)
    elif 'eth' in feed_id.lower():
        base_value = 3000 + random.uniform(-100, 100)
    elif 'xrp' in feed_id.lower():
        base_value = 0.5 + random.uniform(-0.05, 0.05)
    elif 'flr' in feed_id.lower():
        base_value = 0.03 + random.uniform(-0.005, 0.005)
    elif 'doge' in feed_id.lower():
        base_value = 0.1 + random.uniform(-0.01, 0.01)
    elif 'sol' in feed_id.lower():
        base_value = 150 + random.uniform(-10, 10)
    elif 'avax' in feed_id.lower():
        base_value = 30 + random.uniform(-2, 2)
    elif 'bnb' in feed_id.lower():
        base_value = 300 + random.uniform(-10, 10)
    else:
        base_value = 1.0 + random.uniform(-0.1, 0.1)
    
    # Calculate market cap based on asset type
    market_cap = 0
    if 'btc' in feed_id.lower():
        market_cap = base_value * 19000000  # ~19M Bitcoin supply
    elif 'eth' in feed_id.lower():
        market_cap = base_value * 120000000  # ~120M Ethereum supply
    elif 'flr' in feed_id.lower():
        market_cap = base_value * 10000000000  # ~10B Flare supply
    elif 'xrp' in feed_id.lower():
        market_cap = base_value * 45000000000  # ~45B XRP supply
    else:
        market_cap = base_value * 1000000000  # Assume 1B supply
    
    # Calculate daily volume (typically 2-5% of market cap)
    volume_24h = market_cap * random.uniform(0.02, 0.05)
    
    # Technical indicators
    rsi = random.uniform(30, 70)
    if is_major_asset:  # Major assets tend to be less volatile
        rsi = random.uniform(40, 60)
    
    # Determine MACD status based on RSI
    macd = "neutral"
    if rsi > 60:
        macd = "bullish"
    elif rsi < 40:
        macd = "bearish"
    
    # Moving averages
    ma50 = base_value * (1 + random.uniform(-0.05, 0.05))
    ma200 = base_value * (1 + random.uniform(-0.1, 0.1))
    
    # Bollinger Bands
    bollinger_width = 0.05 if is_major_asset else 0.1
    bollinger_upper = base_value * (1 + random.uniform(0.03, bollinger_width))
    bollinger_lower = base_value * (1 - random.uniform(0.03, bollinger_width))
    
    # Price changes
    day_change = random.uniform(-5, 5) if not is_major_asset else random.uniform(-3, 3)
    week_change = day_change * random.uniform(1.5, 2.5)
    month_change = week_change * random.uniform(1.5, 2.5)
    
    # Format price changes as percentage strings
    day_change_str = f"{day_change:.2f}%"
    week_change_str = f"{week_change:.2f}%"
    month_change_str = f"{month_change:.2f}%"
    
    # All-time high and low
    ath = base_value * (1 + random.uniform(0.5, 2.0))
    atl = base_value * random.uniform(0.1, 0.5)
    
    # Create a realistic feed data structure
    return {
        "feed_id": feed_id,
        "value": base_value,
        "decimals": 18,  # Standard for most blockchains
        "timestamp": int(datetime.now().timestamp()),
        "market_cap": market_cap,
        "volume_24h": volume_24h,
        "rsi": rsi,
        "macd": macd,
        "ma50": ma50,
        "ma200": ma200,
        "bollingerUpper": bollinger_upper,
        "bollingerLower": bollinger_lower,
        "day_change": day_change_str,
        "week_change": week_change_str,
        "month_change": month_change_str,
        "liquidity_score": 8.5 if is_major_asset else random.uniform(3.5, 7.5),
        "volatility": f"{random.uniform(1, 3):.2f}%" if is_major_asset else f"{random.uniform(3, 8):.2f}%",
        "all_time_high": ath,
        "all_time_low": atl,
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

# Command-line interface
if __name__ == "__main__":
    # Set host and port
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", 8080))  # Changed from 8000 to 8080
    DEBUG = os.getenv("API_DEBUG", "True").lower() == "true"
    
    # Start the Flask API server
    print(f"Starting Simplified API on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
