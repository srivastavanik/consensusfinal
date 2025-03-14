#!/usr/bin/env python3
import asyncio
import os
import json
import re
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

from flare_ai_consensus.router import AsyncOpenRouterProvider
from flare_ai_consensus.settings import Settings, Message
from flare_ai_consensus.consensus import process_prediction_market
from flare_ai_consensus.prediction_markets.query_processor import QueryProcessor
from flare_ai_consensus.prediction_markets.data_fetcher import FTSODataFetcher
from flare_ai_consensus.prediction_markets.verification import VerificationModule

from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

load_dotenv()

# Load settings for consensus
settings = Settings(
    openrouter_api_key=os.getenv("OPENROUTER_API_KEY"),
    model_configs=[
        # Anthropic models
        {"model_id": "anthropic/claude-3-opus-20240229", "provider": "openrouter", "temperature": 0.1},
        {"model_id": "anthropic/claude-3-sonnet-20240229", "provider": "openrouter", "temperature": 0.2},
        # OpenAI models
        {"model_id": "openai/gpt-4-turbo", "provider": "openrouter", "temperature": 0.2},
        # Additional models can be added here
    ],
    aggregator_config={
        "model_id": "anthropic/claude-3-opus-20240229", 
        "provider": "openrouter",
        "temperature": 0.1
    }
)


async def initialize_provider():
    """Initialize the AsyncOpenRouterProvider with settings"""
    return AsyncOpenRouterProvider(
        api_key=settings.openrouter_api_key,
        http_client=None  # Will be created internally
    )


async def process_prediction_market_query(question, iterations=2):
    """Process a prediction market question through consensus"""
    try:
        # Initialize provider
        provider = await initialize_provider()
        
        # Create consensus config from settings
        consensus_config = settings.create_consensus_config()
        
        # Add self reference to process_prediction_market for proper method call
        process_prediction_market.self = provider
        process_prediction_market.consensus_config = consensus_config
        
        # Process the prediction market question
        result = await process_prediction_market(process_prediction_market, question, iterations)
        
        # Close the provider
        await provider.close()
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "question": question,
            "status": "failed",
            "final_decision": "UNDETERMINED",
            "confidence": 0,
            "reasoning": f"Error during consensus process: {str(e)}"
        }


# API endpoint for prediction market verification
@app.route('/verify_prediction', methods=['POST'])
def verify_prediction_api():
    """API endpoint to verify a prediction market question"""
    try:
        # Get JSON data from the request
        data = request.get_json()
        
        # Extract the prediction market question
        question = data.get('question')
        iterations = data.get('iterations', 2)  # Default to 2 iterations
        
        if not question:
            return jsonify({
                "error": "Missing question parameter",
                "status": "failed",
                "final_decision": "UNDETERMINED",
                "confidence": 0,
                "reasoning": "Error: Missing required question parameter"
            }), 400
        
        # Run the async processing in a new event loop
        result = asyncio.run(process_prediction_market_query(question, iterations))
        
        # Return the result
        return jsonify(result)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "status": "failed",
            "final_decision": "UNDETERMINED",
            "confidence": 0,
            "reasoning": f"Error during consensus process: {str(e)}"
        }), 500


# API endpoint for querying data feeds
@app.route('/query_data_feeds', methods=['GET'])
def query_data_feeds_api():
    """API endpoint to query available data feeds"""
    try:
        # Get parameters from the request
        network = request.args.get('network', 'coston2')
        
        # Initialize data fetcher
        data_fetcher = FTSODataFetcher(network=network)
        
        # Get feed IDs mapping for reference
        query_processor = QueryProcessor()
        feed_mapping = query_processor.feed_id_mapping
        
        # Return the available feeds
        return jsonify({
            "available_feeds": feed_mapping,
            "network": network,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500


# API endpoint for processing prediction market questions
@app.route('/process_query', methods=['POST'])
def process_query_api():
    """API endpoint to process and analyze a prediction market question"""
    try:
        # Get JSON data from the request
        data = request.get_json()
        
        # Extract the prediction market question
        question = data.get('question')
        
        if not question:
            return jsonify({
                "error": "Missing question parameter",
                "status": "failed"
            }), 400
        
        # Process the query
        query_processor = QueryProcessor()
        processed_query = query_processor.process_query(question)
        
        # Generate data requirements
        data_requirements = query_processor.generate_data_requirements(processed_query)
        
        # Return the processed query and requirements
        return jsonify({
            "processed_query": processed_query,
            "data_requirements": data_requirements,
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500


# API endpoint for fetching specific feed data
@app.route('/fetch_feed_data', methods=['GET'])
def fetch_feed_data_api():
    """API endpoint to fetch detailed data for a specific FTSO feed"""
    try:
        # Get parameters from the request
        feed_id = request.args.get('feed_id')
        network = request.args.get('network', 'flare')
        
        if not feed_id:
            return jsonify({
                "error": "Missing feed_id parameter",
                "status": "failed"
            }), 400
        
        # Initialize data fetcher
        data_fetcher = FTSODataFetcher(network=network)
        
        # Fetch real data asynchronously
        result = asyncio.run(data_fetcher.fetch_price_feed(feed_id))
        
        # Process and enhance the data
        enhanced_data = enhance_feed_data(result, feed_id)
        
        return jsonify({
            "feed_data": enhanced_data,
            "network": network,
            "status": "success"
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500


def enhance_feed_data(feed_data, feed_id):
    """Enhance feed data with additional metrics for analysis"""
    try:
        # Calculate technical indicators based on historical data
        # For now, we'll return some basic calculated metrics
        # In a production environment, this would use real historical data
        
        value = feed_data.get('value', 0)
        decimals = feed_data.get('decimals', 0)
        
        # Convert to actual value based on decimals
        actual_value = value / (10 ** abs(decimals)) if decimals < 0 else value * (10 ** decimals)
        
        # Generate reasonable estimates for metrics based on feed ID
        is_major_asset = any(asset in feed_id.lower() for asset in ['btc', 'eth', 'xrp', 'flr', 'usd'])
        
        # Determine market cap and volume based on asset type
        market_cap = None
        volume_24h = None
        
        if 'btc' in feed_id.lower():
            market_cap = actual_value * 19000000 * 0.95  # ~19M Bitcoin supply * 95% of price to account for market discount
            volume_24h = market_cap * 0.03  # ~3% daily volume
        elif 'eth' in feed_id.lower():
            market_cap = actual_value * 120000000 * 0.95  # ~120M Ethereum supply
            volume_24h = market_cap * 0.04  # ~4% daily volume
        elif 'flr' in feed_id.lower():
            market_cap = actual_value * 10000000000 * 0.95  # ~10B Flare supply
            volume_24h = market_cap * 0.02  # ~2% daily volume
        elif 'xrp' in feed_id.lower():
            market_cap = actual_value * 45000000000 * 0.95  # ~45B XRP supply
            volume_24h = market_cap * 0.025  # ~2.5% daily volume
        else:
            # Generic calculation for other assets
            market_cap = actual_value * 1000000000 * 0.95  # Assume 1B supply
            volume_24h = market_cap * 0.015  # ~1.5% daily volume
        
        # Calculate simulated technical indicators
        rsi = 50 + (market_cap % 17)  # Pseudo-random RSI between 50-67
        if rsi > 70:
            macd = "bullish"
        elif rsi < 30:
            macd = "bearish"
        else:
            macd = "neutral"
            
        # Simulate price changes over different time frames
        # In production, these would be calculated from real historical data
        from random import uniform, seed
        seed(hash(feed_id))  # Use feed_id as seed for consistent randomness
        
        # Generate consistent simulated changes
        day_change = uniform(-5, 5) if not is_major_asset else uniform(-3, 3)
        week_change = day_change * uniform(1.5, 2.5)
        month_change = week_change * uniform(1.5, 2.5)
        
        # Format percentages
        day_change_str = f"{day_change:.2f}%"
        week_change_str = f"{week_change:.2f}%"
        month_change_str = f"{month_change:.2f}%"
        
        # Enhanced data structure with both raw data and calculated metrics
        enhanced_data = {
            **feed_data,  # Include original data
            "market_cap": market_cap,
            "volume_24h": volume_24h,
            "rsi": rsi,
            "macd": macd,
            "ma50": actual_value * (1 + (uniform(-0.05, 0.05))),
            "ma200": actual_value * (1 + (uniform(-0.1, 0.1))),
            "bollingerUpper": actual_value * (1 + (uniform(0.03, 0.07))),
            "bollingerLower": actual_value * (1 - (uniform(0.03, 0.07))),
            "day_change": day_change_str,
            "week_change": week_change_str,
            "month_change": month_change_str,
            "liquidity_score": 8.5 if is_major_asset else uniform(3.5, 7.5),
            "volatility": f"{uniform(1, 3):.2f}%" if is_major_asset else f"{uniform(3, 8):.2f}%",
            "all_time_high": actual_value * (1 + uniform(0.5, 2.0)),
            "all_time_low": actual_value * uniform(0.1, 0.5),
        }
        
        return enhanced_data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return feed_data  # Return original data on error


# Command-line interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        question = sys.argv[1]
        print(f"Processing prediction market question: {question}")
        result = asyncio.run(process_prediction_market_query(question))
        print(json.dumps(result, indent=2))
    else:
        # Start the Flask app
        app.run(host='0.0.0.0', port=5001, debug=True)
