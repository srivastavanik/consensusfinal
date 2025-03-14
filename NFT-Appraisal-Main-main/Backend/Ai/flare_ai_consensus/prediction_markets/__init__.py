# prediction_markets module
from .data_fetcher import FTSODataFetcher
from .query_processor import QueryProcessor
from .verification import VerificationModule
from .templates import (
    PREDICTION_MARKET_PROMPT, 
    AGGREGATOR_PROMPT,
    AMBIGUITY_RESOLUTION_PROMPT,
    CRYPTO_PREDICTION_PROMPT,
    CORRELATION_ANALYSIS_PROMPT
) 