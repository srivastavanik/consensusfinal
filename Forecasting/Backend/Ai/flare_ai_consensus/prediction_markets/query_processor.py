# query_processor.py
import re
from datetime import datetime
from dateutil.parser import parse as parse_date
import json

class QueryProcessor:
    """Processes prediction market questions into standardized formats for AI analysis."""
    
    def __init__(self):
        self.common_assets = {
            "BTC": "Bitcoin",
            "ETH": "Ethereum",
            "FLR": "Flare",
            "SGB": "Songbird",
            "XRP": "XRP",
            "USDC": "USD Coin",
            "USDT": "Tether"
        }
        
        self.feed_id_mapping = {
            "BTC/USD": "0x014254432f55534400000000000000000000000000",
            "ETH/USD": "0x014554482f55534400000000000000000000000000",
            "FLR/USD": "0x01464c522f55534400000000000000000000000000",
            "SGB/USD": "0x015347422f55534400000000000000000000000000",
            "XRP/USD": "0x015852502f55534400000000000000000000000000",
            "USDC/USD": "0x015553444300000000000000000000000000000000",
            "USDT/USD": "0x0155534454000000000000000000000000000000"
        }
    
    def process_query(self, question):
        """
        Process a prediction market question to extract key components
        and identify required data feeds.
        """
        # Extract potential price thresholds
        price_pattern = r"(\$[0-9,]+(?:\.[0-9]+)?|[0-9,]+(?:\.[0-9]+)?\s*(?:USD|dollars))"
        price_matches = re.findall(price_pattern, question)
        
        # Extract potential date references
        date_pattern = r"((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|Q[1-4]\s+\d{4}|EOY\s+\d{4}|\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2})"
        date_matches = re.findall(date_pattern, question)
        
        # Identify crypto assets mentioned
        asset_matches = []
        for asset, full_name in self.common_assets.items():
            if asset in question or full_name in question:
                asset_matches.append(asset)
        
        # Identify price pairs
        pair_pattern = r"([A-Z]{3,4})/([A-Z]{3,4})"
        pair_matches = re.findall(pair_pattern, question)
        
        # Check for percentage terms
        percentage_pattern = r"(\d+(?:\.\d+)?%)"
        percentage_matches = re.findall(percentage_pattern, question)
        
        # Check for specific timeframes
        timeframe_pattern = r"(by\s+end\s+of\s+\d{4}|within\s+\d+\s+(?:days|weeks|months|years)|before\s+\d{4})"
        timeframe_matches = re.findall(timeframe_pattern, question, re.IGNORECASE)
        
        # Determine feed IDs needed
        required_feeds = []
        for asset in asset_matches:
            feed_key = f"{asset}/USD"
            if feed_key in self.feed_id_mapping:
                required_feeds.append(self.feed_id_mapping[feed_key])
        
        for base, quote in pair_matches:
            feed_key = f"{base}/{quote}"
            if feed_key in self.feed_id_mapping:
                required_feeds.append(self.feed_id_mapping[feed_key])
        
        # Determine question type
        question_type = self._determine_question_type(question)
        
        # Create structured query data
        processed_query = {
            "original_question": question,
            "identified_assets": asset_matches,
            "price_thresholds": price_matches,
            "date_references": date_matches,
            "percentage_thresholds": percentage_matches,
            "timeframes": timeframe_matches,
            "required_feeds": required_feeds,
            "price_pairs": pair_matches,
            "question_type": question_type
        }
        
        return processed_query
    
    def _determine_question_type(self, question):
        """Determine the type of prediction market question."""
        question_lower = question.lower()
        
        # Price prediction questions
        if re.search(r"price|worth|value|cost|rate", question_lower) and re.search(r"\$|usd|dollar", question_lower):
            return "price_prediction"
        
        # Event occurrence questions
        if re.search(r"will|happen|occur|launch|release|announce", question_lower):
            return "event_occurrence"
        
        # Comparative questions
        if re.search(r"higher than|lower than|more than|less than|exceed|fall below|outperform", question_lower):
            return "comparative"
        
        # Temporal questions
        if re.search(r"when|by what date|how soon|how long", question_lower):
            return "temporal"
        
        # Default to generic
        return "generic"
    
    def generate_data_requirements(self, processed_query):
        """Generate a list of data requirements needed to answer the question."""
        requirements = []
        
        # Always include the base FTSO feeds if assets are identified
        if processed_query["identified_assets"]:
            requirements.append({
                "type": "ftso_data",
                "assets": processed_query["identified_assets"],
                "reason": "Base price data for identified assets"
            })
        
        # For price prediction questions, add historical data requirement
        if processed_query["question_type"] == "price_prediction":
            requirements.append({
                "type": "historical_data",
                "lookback_period": "90d",  # Default to 90 days
                "reason": "Historical price trends for prediction"
            })
        
        # For event occurrence, add news and social sentiment
        if processed_query["question_type"] == "event_occurrence":
            requirements.append({
                "type": "news_data",
                "reason": "Recent news relevant to the prediction"
            })
            requirements.append({
                "type": "social_sentiment",
                "reason": "Social media sentiment indicators"
            })
        
        # For all questions with timeframes, add calendar data
        if processed_query["timeframes"]:
            requirements.append({
                "type": "calendar_data",
                "reason": "Important dates and scheduled events"
            })
            
        return requirements 