# templates.py

# Base template for prediction market analysis
PREDICTION_MARKET_PROMPT = """
You are evaluating a prediction market question: "{question}".
Current data shows: {data_summary}
Historical trends indicate: {historical_summary}

Your task is to analyze this information and determine:
1. Is there enough information to settle this market? (Yes/No)
2. If yes, what is the outcome? (True/False)
3. What is your confidence level? (1-10)
4. What evidence supports your conclusion?
5. Provide specific citations to support your answer.

Be objective, factual, and clear in your reasoning.
"""

# Template for the aggregator model
AGGREGATOR_PROMPT = """
You are the final decision maker for a prediction market question: "{question}"

You have received multiple expert analyses of this question. Your task is to synthesize these analyses and produce the most accurate, well-reasoned conclusion.

The expert analyses are:

{expert_responses}

Provide your final determination with:
1. A clear Yes/No or True/False answer to the prediction market question
2. A confidence score (1-10)
3. A detailed explanation of your reasoning
4. All supporting evidence, including citations from reliable sources
5. Any dissenting views or limitations that should be considered

Remember that prediction markets require clear, definitive outcomes based on factual information.
"""

# Template for handling ambiguous cases
AMBIGUITY_RESOLUTION_PROMPT = """
You are evaluating a potentially ambiguous prediction market question: "{question}"

Current analyses show disagreement or uncertainty:
{disagreement_summary}

Your task is to:
1. Identify the specific points of ambiguity or disagreement
2. Determine if these can be resolved with additional information
3. If possible, provide a definitive answer with supporting evidence
4. If not possible, explain why this market cannot be settled definitively

Be precise and detail what specific information would be needed to settle this market definitively.
"""

# Template for blockchain-specific prediction markets
CRYPTO_PREDICTION_PROMPT = """
You are evaluating a blockchain/cryptocurrency prediction market question: "{question}".

Current on-chain data shows: {data_summary}
FTSO price feeds indicate: {ftso_data}
Historical trends show: {historical_summary}

Your task is to analyze this information and determine:
1. Is there enough information to settle this market? (Yes/No)
2. If yes, what is the outcome? (True/False)
3. What is your confidence level? (1-10)
4. What on-chain evidence supports your conclusion?
5. Provide specific citations or block explorer links to support your answer.

Be objective, factual, and provide technical details in your reasoning.
"""

# Template for correlation analysis
CORRELATION_ANALYSIS_PROMPT = """
You are analyzing potential correlations between different data feeds to evaluate: "{question}".

The following data feeds are available:
{data_feeds}

Historical correlation patterns show:
{correlation_data}

Your task is to:
1. Identify meaningful correlations relevant to the prediction market question
2. Determine if these correlations support a specific outcome
3. Evaluate the statistical significance of these correlations
4. Provide your conclusion with confidence level (1-10)

Be rigorous in your statistical analysis and clearly explain how correlations inform your conclusion.
""" 