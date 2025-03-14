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
        network = request.args.get('network', 'default')
        
        # Available market feeds for analysis
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
            'USDT/USD': 'Tether',
            'EUR/USD': 'Euro',
            'JPY/USD': 'Japanese Yen',
            'GBP/USD': 'British Pound',
            'GOLD/USD': 'Gold',
            'SILVER/USD': 'Silver',
            'OIL/USD': 'Crude Oil'
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
        network = request.args.get('network', 'default')
        
        if not feed_id:
            return jsonify({
                "error": "Missing required parameter: feed_id",
                "status": "failed"
            }), 400
        
        # Generate sample data for the requested feed
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

@app.route('/market_analysis', methods=['GET'])
def market_analysis_api():
    """API endpoint to provide comprehensive market analysis"""
    try:
        # Get parameters from the request
        feed_id = request.args.get('feed_id')
        timeframe = request.args.get('timeframe', '1d')
        
        if not feed_id:
            return jsonify({
                "error": "Missing required parameter: feed_id",
                "status": "failed"
            }), 400
        
        # Generate market analysis data
        feed_data = generate_sample_feed_data(feed_id)
        
        # Add AI-generated analysis
        market_analysis = {
            "trend": random.choice(["bullish", "bearish", "neutral"]),
            "confidence": round(random.uniform(0.6, 0.95), 2),
            "key_levels": {
                "support": [round(feed_data["current_price"] * 0.92, 2), round(feed_data["current_price"] * 0.85, 2)],
                "resistance": [round(feed_data["current_price"] * 1.08, 2), round(feed_data["current_price"] * 1.15, 2)]
            },
            "prediction": {
                "short_term": {
                    "direction": random.choice(["up", "down", "sideways"]),
                    "target": round(feed_data["current_price"] * random.uniform(0.9, 1.1), 2),
                    "timeframe": "24h",
                    "confidence": round(random.uniform(0.7, 0.9), 2)
                },
                "medium_term": {
                    "direction": random.choice(["up", "down", "sideways"]),
                    "target": round(feed_data["current_price"] * random.uniform(0.8, 1.2), 2),
                    "timeframe": "7d",
                    "confidence": round(random.uniform(0.6, 0.85), 2)
                },
                "long_term": {
                    "direction": random.choice(["up", "down", "sideways"]),
                    "target": round(feed_data["current_price"] * random.uniform(0.7, 1.3), 2),
                    "timeframe": "30d",
                    "confidence": round(random.uniform(0.5, 0.8), 2)
                }
            },
            "risk_assessment": round(random.uniform(1, 10), 1),
            "volatility_index": round(random.uniform(1, 10), 1),
            "market_sentiment": random.choice(["fear", "greed", "neutral", "extreme fear", "extreme greed"]),
            "ai_models_consensus": {
                "qwen": {
                    "prediction": round(feed_data["current_price"] * random.uniform(0.95, 1.05), 2),
                    "confidence": round(random.uniform(0.7, 0.9), 2)
                },
                "llama": {
                    "prediction": round(feed_data["current_price"] * random.uniform(0.94, 1.06), 2),
                    "confidence": round(random.uniform(0.7, 0.9), 2)
                },
                "gemini": {
                    "prediction": round(feed_data["current_price"] * random.uniform(0.93, 1.07), 2),
                    "confidence": round(random.uniform(0.7, 0.9), 2)
                },
                "claude": {
                    "prediction": round(feed_data["current_price"] * random.uniform(0.92, 1.08), 2),
                    "confidence": round(random.uniform(0.7, 0.9), 2)
                }
            }
        }
        
        # Add technical indicators
        technical_indicators = {
            "rsi": round(random.uniform(1, 100), 2),
            "macd": {
                "value": round(random.uniform(-10, 10), 2),
                "signal": round(random.uniform(-10, 10), 2),
                "histogram": round(random.uniform(-5, 5), 2)
            },
            "ma_50": round(feed_data["current_price"] * random.uniform(0.9, 1.1), 2),
            "ma_200": round(feed_data["current_price"] * random.uniform(0.85, 1.15), 2),
            "bollinger_bands": {
                "upper": round(feed_data["current_price"] * 1.05, 2),
                "middle": feed_data["current_price"],
                "lower": round(feed_data["current_price"] * 0.95, 2)
            },
            "fibonacci_retracement": {
                "0.236": round(feed_data["current_price"] * 0.98, 2),
                "0.382": round(feed_data["current_price"] * 0.96, 2),
                "0.5": round(feed_data["current_price"] * 0.94, 2),
                "0.618": round(feed_data["current_price"] * 0.92, 2),
                "0.786": round(feed_data["current_price"] * 0.9, 2)
            }
        }
        
        response = {
            "feed_data": feed_data,
            "market_analysis": market_analysis,
            "technical_indicators": technical_indicators,
            "timeframe": timeframe,
            "status": "success"
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

def generate_sample_feed_data(feed_id):
    """Generate sample feed data with realistic values"""
    # Use feed_id as a seed for random generation to ensure consistent values
    # for the same feed_id between calls
    random.seed(feed_id)
    
    # Set base price and volatility based on the feed_id
    base_prices = {
        'BTC/USD': 65000.0,
        'ETH/USD': 3500.0,
        'XRP/USD': 0.59,
        'FLR/USD': 0.024,
        'DOGE/USD': 0.15,
        'SOL/USD': 125.0,
        'AVAX/USD': 35.0,
        'BNB/USD': 580.0,
        'USDC/USD': 1.0,
        'USDT/USD': 1.0,
        'EUR/USD': 1.09,
        'JPY/USD': 0.0067,
        'GBP/USD': 1.28,
        'GOLD/USD': 2200.0,
        'SILVER/USD': 25.0,
        'OIL/USD': 75.0
    }
    
    volatility = {
        'BTC/USD': 0.05,
        'ETH/USD': 0.07,
        'XRP/USD': 0.08,
        'FLR/USD': 0.1,
        'DOGE/USD': 0.12,
        'SOL/USD': 0.09,
        'AVAX/USD': 0.08,
        'BNB/USD': 0.06,
        'USDC/USD': 0.001,
        'USDT/USD': 0.001,
        'EUR/USD': 0.01,
        'JPY/USD': 0.01,
        'GBP/USD': 0.015,
        'GOLD/USD': 0.02,
        'SILVER/USD': 0.03,
        'OIL/USD': 0.04
    }
    
    # Default values for unknown feeds
    if feed_id not in base_prices:
        base_prices[feed_id] = 100.0
        volatility[feed_id] = 0.05
    
    # Calculate current price with some random variation
    current_price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id], volatility[feed_id]))
    previous_price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id], volatility[feed_id]))
    
    # Calculate change percentage
    change_24h = ((current_price - previous_price) / previous_price) * 100
    
    # Generate historical data points
    now = datetime.now()
    historical_data = []
    for i in range(24):
        timestamp = (now - timedelta(hours=i)).isoformat()
        # Add some trend with noise
        trend_factor = 1 + ((24-i) / 24) * (change_24h/100) 
        noise = random.uniform(-volatility[feed_id], volatility[feed_id]) * 0.5
        price = previous_price * trend_factor * (1 + noise)
        historical_data.append({
            "timestamp": timestamp,
            "price": round(price, 4 if price < 10 else 2)
        })
    
    # Generate more detailed timeframe data
    timeframes = {
        "1h": [],
        "1d": [],
        "1w": [],
        "1m": []
    }
    
    # Generate hourly data for the last 24 hours
    for i in range(24):
        timestamp = (now - timedelta(hours=i)).isoformat()
        price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id], volatility[feed_id]))
        timeframes["1h"].append({
            "timestamp": timestamp,
            "price": round(price, 4 if price < 10 else 2),
            "volume": round(base_prices[feed_id] * random.uniform(100, 1000) * volatility[feed_id], 2)
        })
    
    # Generate daily data for the last 30 days
    for i in range(30):
        timestamp = (now - timedelta(days=i)).isoformat()
        price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id] * 2, volatility[feed_id] * 2))
        timeframes["1d"].append({
            "timestamp": timestamp,
            "price": round(price, 4 if price < 10 else 2),
            "volume": round(base_prices[feed_id] * random.uniform(1000, 10000) * volatility[feed_id], 2)
        })
    
    # Generate weekly data for the last 12 weeks
    for i in range(12):
        timestamp = (now - timedelta(weeks=i)).isoformat()
        price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id] * 3, volatility[feed_id] * 3))
        timeframes["1w"].append({
            "timestamp": timestamp,
            "price": round(price, 4 if price < 10 else 2),
            "volume": round(base_prices[feed_id] * random.uniform(5000, 50000) * volatility[feed_id], 2)
        })
    
    # Generate monthly data for the last 12 months
    for i in range(12):
        timestamp = (now - timedelta(days=i*30)).isoformat()
        price = base_prices[feed_id] * (1 + random.uniform(-volatility[feed_id] * 4, volatility[feed_id] * 4))
        timeframes["1m"].append({
            "timestamp": timestamp,
            "price": round(price, 4 if price < 10 else 2),
            "volume": round(base_prices[feed_id] * random.uniform(20000, 200000) * volatility[feed_id], 2)
        })
    
    # Reset random seed after generating data
    random.seed()
    
    # Return the generated data
    return {
        "id": feed_id,
        "name": feed_id,
        "current_price": round(current_price, 4 if current_price < 10 else 2),
        "previous_price": round(previous_price, 4 if previous_price < 10 else 2),
        "change_24h": round(change_24h, 2),
        "updated_at": now.isoformat(),
        "historical_data": historical_data,
        "timeframes": timeframes
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Forecaster Market Data API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/model_stats', methods=['GET'])
def model_stats_api():
    """API endpoint to provide statistics about AI models used in predictions"""
    try:
        # Return information about available AI models
        models = {
            "qwen": {
                "name": "Qwen",
                "version": "1.5",
                "accuracy": 0.89,
                "specialization": "Long-term market trends and tokenomics",
                "last_updated": (datetime.now() - timedelta(days=3)).isoformat()
            },
            "llama": {
                "name": "Llama",
                "version": "3",
                "accuracy": 0.87,
                "specialization": "Technical analysis and on-chain metrics",
                "last_updated": (datetime.now() - timedelta(days=5)).isoformat()
            },
            "gemini": {
                "name": "Gemini",
                "version": "1.5",
                "accuracy": 0.91,
                "specialization": "Multimodal analysis and market psychology",
                "last_updated": (datetime.now() - timedelta(days=2)).isoformat()
            },
            "claude": {
                "name": "Claude",
                "version": "3",
                "accuracy": 0.86,
                "specialization": "Social sentiment and creator reputation",
                "last_updated": (datetime.now() - timedelta(days=4)).isoformat()
            }
        }
        
        return jsonify({
            "models": models,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

# Command-line interface
if __name__ == "__main__":
    # Set host and port
    HOST = os.getenv("FORECASTER_API_HOST", "0.0.0.0")
    PORT = int(os.getenv("FORECASTER_API_PORT", 8080))
    DEBUG = os.getenv("FORECASTER_API_DEBUG", "True").lower() == "true"
    
    # Start the Flask API server
    print(f"Starting Forecaster Market Data API on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
