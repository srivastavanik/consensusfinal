import asyncio

import structlog

from flare_ai_consensus.consensus.aggregator import async_centralized_llm_aggregator
from flare_ai_consensus.router import AsyncOpenRouterProvider, ChatRequest
from flare_ai_consensus.settings import ConsensusConfig, Message, ModelConfig
from flare_ai_consensus.utils import parse_chat_response
from ..prediction_markets.query_processor import QueryProcessor
from ..prediction_markets.data_fetcher import FTSODataFetcher
from ..prediction_markets.verification import VerificationModule
from ..prediction_markets.templates import (
    PREDICTION_MARKET_PROMPT, 
    AGGREGATOR_PROMPT,
    AMBIGUITY_RESOLUTION_PROMPT,
    CRYPTO_PREDICTION_PROMPT
)
from datetime import datetime

logger = structlog.get_logger(__name__)


async def run_consensus(
    provider: AsyncOpenRouterProvider,
    consensus_config: ConsensusConfig,
    initial_conversation: list[Message],
) -> str:
    """
    Asynchronously runs the consensus learning loop.

    :param provider: An instance of an AsyncOpenRouterProvider.
    :param consensus_config: An instance of ConsensusConfig.
    :param initial_conversation: the input user prompt with system instructions.

    Returns: aggregated response (str)
    All responses are stored in response_data and can be returned for future use.
    """
    response_data = {}
    response_data["initial_conversation"] = initial_conversation

    # Step 1: Initial round.
    responses = await send_round(
        provider, consensus_config, response_data["initial_conversation"]
    )
    aggregated_response = await async_centralized_llm_aggregator(
        provider, consensus_config.aggregator_config, responses
    )
    logger.info(
        "initial response aggregation complete", aggregated_response=aggregated_response
    )

    response_data["iteration_0"] = responses
    response_data["aggregate_0"] = aggregated_response

    # Step 2: Improvement rounds.
    for i in range(consensus_config.iterations):
        responses = await send_round(
            provider, consensus_config, initial_conversation, aggregated_response
        )
        aggregated_response = await async_centralized_llm_aggregator(
            provider, consensus_config.aggregator_config, responses
        )
        logger.info(
            "responses aggregated",
            iteration=i + 1,
            aggregated_response=aggregated_response,
        )

        response_data[f"iteration_{i + 1}"] = responses
        response_data[f"aggregate_{i + 1}"] = aggregated_response

    return aggregated_response


def _build_improvement_conversation(
    consensus_config: ConsensusConfig,
    initial_conversation: list[Message],
    aggregated_response: str,
) -> list[Message]:
    """Build an updated conversation using the consensus configuration.

    :param consensus_config: An instance of ConsensusConfig.
    :param initial_conversation: the input user prompt with system instructions.
    :param aggregated_response: The aggregated consensus response.
    :return: A list of messages for the updated conversation.
    """
    conversation = initial_conversation.copy()

    # Add aggregated response
    conversation.append(
        {
            "role": consensus_config.aggregated_prompt_type,
            "content": f"Consensus: {aggregated_response}",
        }
    )

    # Add new prompt as "user" message
    conversation.append(
        {"role": "user", "content": consensus_config.improvement_prompt}
    )
    return conversation


async def _get_response_for_model(
    provider: AsyncOpenRouterProvider,
    consensus_config: ConsensusConfig,
    model: ModelConfig,
    initial_conversation: list[Message],
    aggregated_response: str | None,
) -> tuple[str | None, str]:
    """
    Asynchronously sends a chat completion request for a given model.

    :param provider: An instance of an asynchronous OpenRouter provider.
    :param consensus_config: An instance of ConsensusConfig.
    :param model: A ModelConfig instance.
    :param initial_conversation: the input user prompt with system instructions.
    :param aggregated_response: The aggregated consensus response
        from the previous round (or None).
    :return: A tuple of (model_id, response text).
    """
    if not aggregated_response:
        # Use initial prompt for the first round.
        conversation = initial_conversation
        logger.info("sending initial prompt", model_id=model.model_id)
    else:
        # Build the improvement conversation.
        conversation = _build_improvement_conversation(
            consensus_config, initial_conversation, aggregated_response
        )
        logger.info("sending improvement prompt", model_id=model.model_id)

    payload: ChatRequest = {
        "model": model.model_id,
        "messages": conversation,
        "max_tokens": model.max_tokens,
        "temperature": model.temperature,
    }
    response = await provider.send_chat_completion(payload)
    text = parse_chat_response(response)
    logger.info("new response", model_id=model.model_id, response=text)
    return model.model_id, text


async def send_round(
    provider: AsyncOpenRouterProvider,
    consensus_config: ConsensusConfig,
    initial_conversation: list[Message],
    aggregated_response: str | None = None,
) -> dict:
    """
    Asynchronously sends a round of chat completion requests for all models.

    :param provider: An instance of an asynchronous OpenRouter provider.
    :param consensus_config: An instance of ConsensusConfig.
    :param initial_conversation: the input user prompt with system instructions.
    :param aggregated_response: The aggregated consensus response from the
        previous round (or None).
    :return: A dictionary mapping model IDs to their response texts.
    """
    tasks = [
        _get_response_for_model(
            provider, consensus_config, model, initial_conversation, aggregated_response
        )
        for model in consensus_config.models
    ]
    results = await asyncio.gather(*tasks)
    return dict(results)


async def process_prediction_market(self, question, iterations=2):
    """
    Process a prediction market question through consensus learning.
    
    Args:
        question (str): The prediction market question to process
        iterations (int): Number of consensus iterations to perform
        
    Returns:
        dict: The final consensus decision with verification
    """
    # Initialize components
    query_processor = QueryProcessor()
    data_fetcher = FTSODataFetcher()
    verification_module = VerificationModule()
    
    # Process the query
    processed_query = query_processor.process_query(question)
    
    # Fetch relevant FTSO data
    feed_data = []
    if processed_query["required_feeds"]:
        feed_data = await data_fetcher.fetch_multiple_feeds(processed_query["required_feeds"])
    
    # Format data for the prompt
    data_summary = self._format_feed_data(feed_data)
    historical_summary = "No historical data available yet."  # You could extend this
    
    # Choose appropriate prompt template based on question type
    if processed_query["question_type"] == "price_prediction" and processed_query["identified_assets"]:
        initial_prompt = CRYPTO_PREDICTION_PROMPT.format(
            question=question,
            data_summary=data_summary,
            ftso_data=data_summary,  # Reusing same data for simplicity
            historical_summary=historical_summary
        )
    else:
        # Default to the standard prediction market prompt
        initial_prompt = PREDICTION_MARKET_PROMPT.format(
            question=question,
            data_summary=data_summary,
            historical_summary=historical_summary
        )
    
    # Create initial conversation for models
    initial_conversation = [
        {"role": "system", "content": "You are a prediction market expert analyzing real-world events with data-driven insights."},
        {"role": "user", "content": initial_prompt}
    ]
    
    # Get initial responses from all models
    initial_responses = await send_round(
        self.provider, 
        self.consensus_config, 
        initial_conversation
    )
    
    # Track all responses for verification
    all_responses = list(initial_responses.values())
    
    # Perform consensus iterations
    current_responses = initial_responses
    for i in range(iterations):
        # Format expert responses for aggregation
        expert_context = self._format_expert_responses(current_responses)
        
        # Create aggregation prompt
        aggregator_prompt = AGGREGATOR_PROMPT.format(
            question=question,
            expert_responses=expert_context
        )
        
        # Create conversation for aggregator
        aggregator_conversation = [
            {"role": "system", "content": "You are the final aggregator for a prediction market, synthesizing expert analyses into a definitive conclusion."},
            {"role": "user", "content": aggregator_prompt}
        ]
        
        # Get aggregated response
        aggregated_response = await async_centralized_llm_aggregator(
            self.provider, 
            self.consensus_config.aggregator_config, 
            current_responses
        )
        
        # Check if we have significant disagreement
        decisions = [verification_module.extract_decision(r) for r in all_responses]
        if len(set(decisions)) > 1 and i < iterations - 1:  # Only do resolution if not final iteration
            # Create a disagreement summary
            disagreement_summary = self._summarize_disagreements(current_responses)
            
            # Use ambiguity resolution prompt
            resolution_prompt = AMBIGUITY_RESOLUTION_PROMPT.format(
                question=question,
                disagreement_summary=disagreement_summary
            )
            
            # Create refined conversation for resolution
            resolution_conversation = [
                {"role": "system", "content": "You are resolving ambiguity in prediction market analyses by identifying key points of disagreement."},
                {"role": "user", "content": resolution_prompt}
            ]
            
            # Get refined responses with the resolution context
            refined_responses = await send_round(
                self.provider, 
                self.consensus_config, 
                resolution_conversation
            )
            current_responses = refined_responses
            all_responses.extend(refined_responses.values())
    
    # Generate final verification report
    verification_report = verification_module.generate_verification_report(
        all_responses, aggregated_response
    )
    
    # Combine everything into the final result
    final_result = {
        "question": question,
        "processed_query": processed_query,
        "data_used": feed_data,
        "final_decision": verification_module.extract_decision(aggregated_response),
        "confidence": verification_module.extract_confidence(aggregated_response),
        "reasoning": aggregated_response,
        "verification": verification_report
    }
    
    return final_result


def _format_feed_data(self, feed_data):
    """Format FTSO feed data for inclusion in prompts."""
    if not feed_data:
        return "No relevant price data available."
    
    formatted_data = "Current price data:\n"
    for feed in feed_data:
        # Handle decimal conversion appropriately
        value = feed["value"] / (10 ** abs(feed["decimals"]))
        feed_id = feed["feed_id"]
        # Convert feed_id bytes to string representation
        readable_id = bytes.fromhex(feed_id[2:].replace("0", "")).decode('utf-8', errors='ignore')
        formatted_data += f"- {readable_id}: ${value:.6f} (as of {datetime.fromtimestamp(feed['timestamp']).strftime('%Y-%m-%d %H:%M:%S')})\n"
    
    return formatted_data

def _format_expert_responses(self, responses):
    """Format expert responses for the aggregator."""
    formatted = ""
    for i, (model_id, response) in enumerate(responses.items()):
        formatted += f"EXPERT {i+1} ({model_id.split('/')[0]}):\n{response}\n\n"
    return formatted

def _summarize_disagreements(self, responses):
    """Summarize disagreements between model responses."""
    verification_module = VerificationModule()
    summary = "There is disagreement between experts:\n"
    
    # Extract decisions and confidences
    model_analyses = []
    for model_id, response in responses.items():
        decision = verification_module.extract_decision(response)
        confidence = verification_module.extract_confidence(response)
        model_analyses.append({
            "model": model_id.split('/')[0],
            "decision": decision,
            "confidence": confidence
        })
    
    # Group by decision
    decisions = {}
    for analysis in model_analyses:
        decision = analysis["decision"]
        if decision not in decisions:
            decisions[decision] = []
        decisions[decision].append(analysis)
    
    # Summarize each decision group
    for decision, analyses in decisions.items():
        models = [a["model"] for a in analyses]
        avg_confidence = sum(a["confidence"] for a in analyses if a["confidence"]) / len(analyses) if any(a["confidence"] for a in analyses) else "Unknown"
        
        summary += f"\n{decision} ({len(analyses)} experts): {', '.join(models)}\n"
        summary += f"Average confidence: {avg_confidence:.1f}/10\n"
    
    return summary
