/**
 * Service for handling market prediction and forecasting API interactions
 */

// Importing from local types file
import type { PredictionMarketData, VerificationResult, ProcessedQuery, ModelComparison } from '../types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Process a prediction market question and get AI consensus analysis
 * @param question The user's prediction market question
 */
export async function analyzePrediction(question: string): Promise<PredictionMarketData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prediction/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze prediction');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing prediction:', error);
    throw error;
  }
}

/**
 * Get market data feeds relevant to the prediction
 * @param assets List of assets to get data for
 */
export async function getMarketDataFeeds(assets: string[]): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prediction/data-feeds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assets }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get market data feeds');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting market data feeds:', error);
    throw error;
  }
}

/**
 * Get AI model comparison data for a specific prediction
 * @param question The user's prediction market question
 */
export async function getModelComparison(question: string): Promise<ModelComparison> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prediction/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get model comparison');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting model comparison:', error);
    throw error;
  }
}
