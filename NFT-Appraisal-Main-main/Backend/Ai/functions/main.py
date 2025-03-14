#!/usr/bin/env python3
import asyncio
import os
import json
import re
import random
import statistics
from pathlib import Path
import textwrap
import aiohttp
# import functions_framework


from flare_ai_consensus.router import AsyncOpenRouterProvider
from flare_ai_consensus.consensus import send_round
from flare_ai_consensus.consensus.aggregator import async_centralized_llm_aggregator
from flare_ai_consensus.settings import Settings, Message
from flare_ai_consensus.utils import load_json, parse_chat_response

from dotenv import load_dotenv

# Add Firebase Functions import and decorator
from firebase_functions import https_fn
from firebase_admin import initialize_app, db

initialize_app(options={
    'databaseURL': 'https://nft-appraisal-default-rtdb.firebaseio.com'  # Replace with your Firebase project database URL
})

load_dotenv()


def print_colored(text, color=None):
    """Print text with ANSI color codes"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "magenta": "\033[95m",
        "cyan": "\033[96m",
        "reset": "\033[0m"
    }
    
    if color and color in colors:
        print(f"{colors[color]}{text}{colors['reset']}")
    else:
        print(text)

def format_and_print_responses(responses, title="Model Responses"):
    """Format and print model responses nicely in the terminal"""
    terminal_width = 80
    separator = "=" * terminal_width
    
    print_colored(f"\n{separator}", "cyan")
    print_colored(f"{title.center(terminal_width)}", "cyan")
    print_colored(f"{separator}\n", "cyan")
    
    for model_id, response in responses.items():
        print_colored(f"Model: {model_id}", "yellow")
        
        # Format and wrap the response text
        wrapped_text = textwrap.fill(str(response), width=terminal_width-4)
        indented_text = textwrap.indent(wrapped_text, "  ")
        print(indented_text)
        print_colored(f"{'-' * terminal_width}", "blue")

def extract_price_from_text(text):
    """Extract the price from a response text or JSON string"""
    if not isinstance(text, str):
        if isinstance(text, dict) and "price" in text:
            return float(text["price"])
        elif isinstance(text, dict) and "predicted_price" in text:
            return float(text["predicted_price"])
        text = str(text)
        
    # First try to parse as JSON
    try:
        # Remove JSON code block markers if present
        if text.strip().startswith("```json"):
            text = re.sub(r'```json\s*|\s*```', '', text)
        
        # Try parsing the text as JSON
        data = json.loads(text)
        if isinstance(data, dict):
            if "price" in data:
                return float(data["price"])
            elif "predicted_price" in data:
                return float(data["predicted_price"])
            elif "predicted_price_USD" in data:
                return float(data["predicted_price_USD"])
    except (json.JSONDecodeError, ValueError, TypeError):
        pass
    
    # If JSON parsing fails, try regular expression pattern matching
    try:
        # Look for "price": 1234.56 or "predicted_price": 1234.56
        price_match = re.search(r'"(?:price|predicted_price|predicted_price_USD)"\s*:\s*([0-9,]+\.?[0-9]*)', text)
        if price_match:
            return float(price_match.group(1).replace(',', ''))
        
        # Also try looking for dollar amounts
        dollar_match = re.search(r'\$([0-9,]+\.?[0-9]*)', text)
        if dollar_match:
            return float(dollar_match.group(1).replace(',', ''))
    except (ValueError, AttributeError):
        pass
    
    # Return None if no price was found
    return None

def calculate_confidence(std_dev, prices):
    """Calculate a confidence score based on standard deviation relative to mean"""
    if not prices or len(prices) < 2:
        return 0.5  # Default confidence with insufficient data
    
    mean_price = statistics.mean(prices)
    if mean_price == 0:
        return 0.5  # Avoid division by zero
    
    # Calculate coefficient of variation (normalized standard deviation)
    cv = std_dev / mean_price
    
    # Convert to confidence score (1 - normalized CV, bounded between 0.1 and 0.9)
    # Lower CV means higher confidence
    confidence = 1.0 - min(cv, 1.0)
    return max(0.1, min(0.9, confidence))

async def patch_provider_for_logging(provider):
    """Patch the provider's _post method to log request/response details"""
    original_post = provider._post
    
    async def logged_post(endpoint, json_payload):
        print_colored(f"Request to {endpoint}: max_tokens={json_payload.get('max_tokens')}", "blue")
        response = await original_post(endpoint, json_payload)
        return response
    
    provider._post = logged_post
    return provider

async def update_consensus_progress(contract_address, token_id, stage, data=None):
    """Update the consensus progress in Firebase Realtime Database"""
    try:
        # Create a reference to the progress node for this specific NFT
        progress_ref = db.reference(f'consensus_progress/{contract_address}_{token_id}')
        
        # Update with current stage and timestamp
        update_data = {
            'stage': stage,
            'timestamp': {'.sv': 'timestamp'},  # Server timestamp
            'contract_address': contract_address,
            'token_id': token_id
        }
        
        # Add any additional data if provided
        if data:
            update_data['data'] = data
            
        # Update the database
        progress_ref.update(update_data)
        print_colored(f"Updated progress: {stage}", "cyan")
    except Exception as e:
        print_colored(f"Error updating progress in database: {e}", "red")

async def run_consensus_with_data(
    provider, 
    consensus_config, 
    initial_conversation,
    contract_address=None,
    token_id=None
):
    """
    Run consensus process and return both final result and all responses data.
    Modified version of the built-in run_consensus function to return all intermediate data.
    
    Args:
        provider: An instance of AsyncOpenRouterProvider
        consensus_config: Configuration for the consensus process
        initial_conversation: Initial prompt messages
        contract_address: Contract address for progress tracking
        token_id: Token ID for progress tracking
        
    Returns:
        tuple: (final_consensus_result, all_response_data)
    """
    # Dictionary to store all responses and aggregations
    response_data = {}
    response_data["initial_conversation"] = initial_conversation

    # Update progress - Starting
    if contract_address and token_id:
        await update_consensus_progress(contract_address, token_id, "starting")

    # Step 1: Initial round
    print_colored("Running initial round of consensus...", "blue")
    if contract_address and token_id:
        await update_consensus_progress(contract_address, token_id, "initial_round")
        
    responses = await send_round(
        provider, consensus_config, response_data["initial_conversation"]
    )
    
    if contract_address and token_id:
        await update_consensus_progress(contract_address, token_id, "initial_aggregation")
        
    aggregated_response = await async_centralized_llm_aggregator(
        provider, consensus_config.aggregator_config, responses
    )
    print_colored("Initial aggregation complete", "blue")

    response_data["iteration_0"] = responses
    response_data["aggregate_0"] = aggregated_response

    # Step 2: Improvement rounds
    for i in range(consensus_config.iterations):
        print_colored(f"Running improvement round {i+1}...", "blue")
        if contract_address and token_id:
            await update_consensus_progress(contract_address, token_id, f"improvement_round_{i+1}")
            
        responses = await send_round(
            provider, consensus_config, initial_conversation, aggregated_response
        )
        
        if contract_address and token_id:
            await update_consensus_progress(contract_address, token_id, f"aggregation_{i+1}")
            
        aggregated_response = await async_centralized_llm_aggregator(
            provider, consensus_config.aggregator_config, responses
        )
        print_colored(f"Improvement round {i+1} complete", "blue")

        response_data[f"iteration_{i + 1}"] = responses
        response_data[f"aggregate_{i + 1}"] = aggregated_response

    # Update progress - Completed
    if contract_address and token_id:
        await update_consensus_progress(contract_address, token_id, "completed", {
            "final_result": aggregated_response
        })

    # Return both the final consensus and all response data
    return aggregated_response, response_data

async def fetch_nft_data(contract_address: str, token_id: str):
    """Fetch NFT metadata from the API endpoint"""
    url = "https://get-nft-data-dkwdhhyv7q-uc.a.run.app"
    params = {
        "contract_address": contract_address,
        "token_id": token_id
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            if response.status != 200:
                raise Exception(f"API request failed with status {response.status}")
            return await response.json()

async def fetch_ethereum_price():
    """Fetch current Ethereum price in USD from CoinGecko API"""
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": "ethereum",
        "vs_currencies": "usd"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            if response.status != 200:
                raise Exception(f"CoinGecko API request failed with status {response.status}")
            data = await response.json()
            return data["ethereum"]["usd"]

async def process_nft_appraisal(contract_address: str, token_id: str):
    """Main processing function for NFT appraisal"""
    # Update initial progress
    await update_consensus_progress(contract_address, token_id, "fetching_data")
    
    # Fetch NFT data
    metadata_data = await fetch_nft_data(contract_address, token_id)
    
    # Update progress after fetching data
    await update_consensus_progress(contract_address, token_id, "preparing_models")
    
    # Load API key from environment variable
    api_key = os.environ.get("OPEN_ROUTER_API_KEY", "")
    if not api_key:
        print_colored("Error: OPEN_ROUTER_API_KEY environment variable not set.", "red")
        print("Please set your OpenRouter API key in your .env file")
        return None

    # Initialize the settings
    settings = Settings()
    
    # Create paths for configuration and data
    config_path = Path("config")
    config_path.mkdir(exist_ok=True)
    
    # Load or create the consensus configuration
    config_file = config_path / "consensus_config.json"
    
    appraisal_date = "March, 2025"
        
    # if not config_file.exists():
    if True:
        default_config = {
            "models": [
                {
                    "id": "meta-llama/llama-3.2-3b-instruct:free",
                    "max_tokens": 3500,
                    "temperature": 0.7
                },
                {
                    "id": "liquid/lfm-3b",
                    "max_tokens": 3500,
                    "temperature": 0.7
                },
                {
                    "id": "google/gemini-2.0-flash-001",
                    "max_tokens": 3500,
                    "temperature": 0.7
                }
                
            ],
            "aggregator": [
                {
                    "model": {
                        "id": "google/gemini-flash-1.5-8b-exp",
                        "max_tokens": 3500,
                        "temperature": 0.65
                    },
                    "aggregator_context": [
                        {
                            "role": "system",
                            "content": "Your role is to objectively evaluate responses from multiple large-language models and combine them into a single coherent response. Your entire response/output is going to consist of a single JSON object, and you will NOT wrap it within JSON md markers. Focus on accuracy and completeness in your synthesis."
                        }
                    ],
                    "aggregator_prompt": [
                        {
                            "role": "user",
                            "content": """You have been provided with responses from various models to the latest query. Synthesize these responses into a single, high-quality answer and use three concise sentences at the very most. If the models disagree on any point, note this and explain the different perspective very concisely in one go. Your response should be well-structured, comprehensive, and accurate and very concise. Your response should be in JSON format like the models, and start with a SINGLE VALUE USD prediction of the NFT Price. Then there will be an explanation component where you will conduct your thorough discussion. Ensure that you are following the JSON format.
                            """
                        }
                    ]
                }
            ],
            "aggregated_prompt_type": "system",
            "improvement_prompt": "Please provide an improved answer based on the consensus responses. Your entire response/output is going to consist of a single JSON object, and you will NOT wrap it within JSON md markers",
            "iterations": 1
        }
        
        with open(config_file, "w") as f:
            json.dump(default_config, f, indent=4)
        
        print_colored(f"Created default configuration file at {config_file}", "green")
    
    # Load the configuration
    config_json = load_json(config_file)
    settings.load_consensus_config(config_json)
    
    # Create the OpenRouter provider
    provider = AsyncOpenRouterProvider(
        api_key=api_key,
        base_url=settings.open_router_base_url
    )
    
    # Patch the provider for better logging
    provider = await patch_provider_for_logging(provider)
    
    # Define the NFT appraisal conversation
    nft_appraisal_conversation = [
        {
            "role": "system",
            "content": """You are an expert at conducting NFT appraisals, and your goal is to output the price in USD value of the NFT at this specific date, which is March, 2025. You will be given pricing history and other metadata about the NFT and will have to extrapolate and analyze the trends from the data. Your response MUST be in JSON format starting with a single value of price in USD, followed by a detailed explanation of your reasoning.

            The sample data that you will be given will be in this input format, although the values will be different. Use it to understand how the data is laid out and what each entry means. Your analysis and appraisal should be more nuanced, smart, and data-driven than the example. 
            
            Your entire response/output is going to consist of a single JSON object, and you will NOT wrap it within JSON md markers

            In the JSON, the price of Ethereum (price_ethereum) was how much Ethereum was paid at the time and the price in USD (price_usd) is the price of that Ethereum at the time of the sale in USD. 

            Example Input:
            {
                "name": "Art Blocks",
                "token_id": "78000956",
                "token_address": "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
                "metadata": {
                    "symbol": "BLOCKS",
                    "rarity_rank": "None",
                    "rarity_percentage": "None",
                    "amount": "1"
                },
                "sales_history": [
                    {
                        "price_ethereum": 24.61,
                        "price_usd": 61914.7812,
                        "date": "2025-03-03 17:49:35"
                    },
                    {
                        "price_ethereum": 85.0,
                        "price_usd": 108403.25579,
                        "date": "2022-12-13 19:04:11"
                    },
                    {
                        "price_ethereum": 0.17,
                        "price_usd": 422.72201,
                        "date": "2021-06-11 09:21:07"
                    }
                ]
            }

            Example Output:
            {
                "price": 67240,
                "explanation": "Based on the sales history, the price of the NFT has been increasing over time. The most recent sale was for 24.61 ETH, which is worth $61914.7812 at the time of the sale. The previous sale was for 85 ETH, which is worth $108403.25579 at the time of the sale. The first sale was for 0.17 ETH, which is worth $422.72201 at the time of the sale. Based on this data, I estimate that the price of the NFT is currently $67240. Additional context on the rarity would help improve the response and the price estimate, however, with the given data, this seems a reasonable estimate for this date."
            }
            
            """
            },
        {
            "role": "user",
            "content": f"Your entire response/output is going to consist of a single JSON object, and you will NOT wrap it within JSON md markers. Here is the sample data: {metadata_data}. "
        }
    ]
    
    print_colored("\nSending NFT appraisal request to multiple models...", "magenta")
    print_colored("Using sample data for NFT appraisal", "cyan")
    
    # Display configuration summary
    for model in settings.consensus_config.models:
        print_colored(f"Model: {model.model_id} (max_tokens: {model.max_tokens})", "yellow")
    
    aggregator_model = settings.consensus_config.aggregator_config.model
    print_colored(f"Aggregator: {aggregator_model.model_id} (max_tokens: {aggregator_model.max_tokens})", "yellow")
    
    try:
        # Step 1: Run the consensus process with data tracking
        print_colored("\nRunning consensus process...", "magenta")
        consensus_result, all_responses_data = await run_consensus_with_data(
            provider=provider,
            consensus_config=settings.consensus_config,
            initial_conversation=nft_appraisal_conversation,
            contract_address=contract_address,
            token_id=token_id
        )
        
        # Get the individual responses from the tracked data
        individual_responses = all_responses_data.get("iteration_0", {})
        
        # Display individual responses
        format_and_print_responses(individual_responses, "<INDIVIDUAL MODEL RESPONSES>")
        
        # Extract price estimates from individual responses
        initial_prices = {}
        for model_id, response in individual_responses.items():
            price = extract_price_from_text(response)
            if price is not None:
                initial_prices[model_id] = price
                print_colored(f"Extracted price from {model_id}: ${price:.2f}", "green")
        
        # Calculate initial price statistics
        initial_price_values = list(initial_prices.values())
        if initial_price_values:
            initial_mean_price = statistics.mean(initial_price_values)
            if len(initial_price_values) > 1:
                initial_std_dev = statistics.stdev(initial_price_values)
            else:
                initial_std_dev = 0
            initial_confidence_score = calculate_confidence(initial_std_dev, initial_price_values)
            
            print_colored(f"Initial Price statistics:", "magenta")
            print_colored(f"- Mean price: ${initial_mean_price:.2f}", "cyan")
            print_colored(f"- Standard deviation: ${initial_std_dev:.2f}", "cyan")
            print_colored(f"- Confidence score: {initial_confidence_score:.2f}", "cyan")
        else:
            initial_mean_price = 0
            initial_std_dev = 0
            initial_confidence_score = 0
            print_colored("Warning: Could not extract any price estimates from model responses", "red")
        
        # Display the final consensus result
        print_colored("\n" + "=" * 80, "green")
        print_colored("FINAL CONSENSUS RESULT".center(80), "green")
        print_colored("=" * 80 + "\n", "green")
        
        # Format and wrap the consensus text
        wrapped_text = textwrap.fill(consensus_result, width=76)
        indented_text = textwrap.indent(wrapped_text, "  ")
        print(indented_text)
        
        print_colored("\n" + "=" * 80, "green")
        
        # Extract final price from consensus result
        final_consensus_price = extract_price_from_text(consensus_result)
        
        # Get final model responses from the last iteration of consensus
        final_iteration = settings.consensus_config.iterations
        if final_iteration > 0 and f"iteration_{final_iteration}" in all_responses_data:
            final_responses = all_responses_data[f"iteration_{final_iteration}"]
            print_colored(f"\nUsing responses from iteration {final_iteration} for statistics", "magenta")
        else:
            final_responses = individual_responses
            print_colored("\nUsing responses from initial round for statistics", "magenta")
        
        # Display final model responses if different from initial
        if final_iteration > 0:
            format_and_print_responses(final_responses, "<FINAL MODEL RESPONSES>")
        
        # Extract price estimates from final responses
        final_prices = {}
        for model_id, response in final_responses.items():
            if response:  # Only process non-empty responses
                price = extract_price_from_text(response)
                if price is not None:
                    final_prices[model_id] = price
                    print_colored(f"Extracted final price from {model_id}: ${price:.2f}", "green")
        
        # Calculate final price statistics
        final_price_values = list(final_prices.values())
        if final_price_values:
            final_mean_price = statistics.mean(final_price_values)
            if len(final_price_values) > 1:
                final_std_dev = statistics.stdev(final_price_values)
            else:
                final_std_dev = 0
            final_confidence_score = calculate_confidence(final_std_dev, final_price_values)
            
            print_colored(f"Final Price statistics:", "magenta")
            print_colored(f"- Mean price: ${final_mean_price:.2f}", "cyan")
            print_colored(f"- Standard deviation: ${final_std_dev:.2f}", "cyan")
            print_colored(f"- Confidence score: {final_confidence_score:.2f}", "cyan")
        else:
            # Fall back to initial statistics if no final prices
            final_mean_price = initial_mean_price
            final_std_dev = initial_std_dev
            final_confidence_score = initial_confidence_score
            print_colored("Warning: Could not extract prices from final responses, using initial statistics", "yellow")
        
        # If consensus price is None, use mean price
        if final_consensus_price is None:
            final_consensus_price = final_mean_price
            print_colored("Warning: Could not extract price from consensus result, using mean price", "yellow")
        
        # Clean up consensus result if it's a JSON string with JSON markdown
        cleaned_result = consensus_result
        if isinstance(consensus_result, str) and consensus_result.strip().startswith("```json"):
            cleaned_result = re.sub(r'```json\s*|\s*```', '', consensus_result)
        
        # Try to parse the result as JSON
        try:
            result_json = json.loads(cleaned_result)
            explanation = result_json.get("explanation", "")
            if not explanation and "predicted_price_USD" in result_json:
                # Try alternative fields
                explanation = result_json.get("text", "")
        except json.JSONDecodeError:
            explanation = cleaned_result
            print_colored("Warning: Could not parse consensus result as JSON", "yellow")
        
        # Before creating final output JSON, get ETH price
        try:
            eth_price = await fetch_ethereum_price()
        except Exception as e:
            print_colored(f"Warning: Could not fetch ETH price: {e}", "yellow")
            eth_price = 0
            
        # Create final output JSON
        final_output = {
            "price": final_consensus_price,
            "text": explanation,
            "standard_deviation": final_std_dev,
            "total_confidence": final_confidence_score,
            "ethereum_price_usd":  final_consensus_price / eth_price,
        }
        
        # Convert to JSON string
        final_json_string = json.dumps(final_output, indent=2)
        
        # Print final JSON
        print_colored("\nFINAL JSON OUTPUT:", "magenta")
        print(final_json_string)
        
        
        # Change this if you want file in results folder
        want_file = True
        
        if want_file:
            # Save the results to a file
            results_dir = Path("results")
            results_dir.mkdir(exist_ok=True)
            
            results_file = results_dir / "latest_consensus_result.json"
            with open(results_file, "w") as f:
                f.write(final_json_string)
            
            print_colored(f"\nSaved consensus result to {results_file}", "green")
        
        # Update progress with final result
        await update_consensus_progress(contract_address, token_id, "finalizing", {
            "price": final_consensus_price,
            "confidence": final_confidence_score
        })
        
        # Final update with complete data
        await update_consensus_progress(contract_address, token_id, "complete", final_output)
        
        # Return the final JSON string
        return final_json_string
        
    except Exception as e:
        # Update progress with error
        await update_consensus_progress(contract_address, token_id, "error", {
            "error": str(e)
        })
        
        print_colored(f"Error during consensus process: {e}", "red")
        import traceback
        traceback.print_exc()
        return json.dumps({
            "price": 0,
            "text": f"Error during consensus process: {str(e)}",
            "standard_deviation": 0,
            "total_confidence": 0
        })
    finally:
        # Close the provider's HTTP client
        await provider.close()

@https_fn.on_request()
def appraise_nft(request: https_fn.Request) -> https_fn.Response:
    """Cloud Function entry point"""
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600"
        }
        return https_fn.Response("", status=204, headers=headers)

    # Set CORS headers for the main request
    headers = {
        "Access-Control-Allow-Origin": "*"
    }

    try:
        # Get parameters from the request
        request_args = request.args
        contract_address = request_args.get("contract_address")
        token_id = request_args.get("token_id")

        if not contract_address or not token_id:
            return https_fn.Response(
                json.dumps({"error": "Missing contract_address or token_id parameter"}),
                status=400,
                headers=headers
            )

        # Run the async processing
        result = asyncio.run(process_nft_appraisal(contract_address, token_id))
        
        # Return the result
        return https_fn.Response(
            result,
            status=200,
            headers=headers
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({
                "error": str(e),
                "price": 0,
                "text": f"Error during consensus process: {str(e)}",
                "standard_deviation": 0,
                "total_confidence": 0
            }),
            status=500,
            headers=headers
        )

if __name__ == "__main__":
    # Local development testing
    import sys
    if len(sys.argv) != 3:
        print("Usage: python main.py <contract_address> <token_id>")
        sys.exit(1)
    
    contract_address = sys.argv[1]
    token_id = sys.argv[2]
    result = asyncio.run(process_nft_appraisal(contract_address, token_id))
    print_colored("\nProgram completed.", "green")
