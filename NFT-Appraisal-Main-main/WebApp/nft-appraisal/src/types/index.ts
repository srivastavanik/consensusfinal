/**
 * Types for the NFT Appraisal and Market Prediction system
 */

// Define interfaces for prediction market data
export interface ProcessedQuery {
  question_type: string;
  identified_assets: string[];
  price_thresholds: string[];
  percentage_thresholds: string[];
  date_references: string[];
  timeframes: string[];
}

export interface Verification {
  model_agreement: number;
  supporting_evidence: string[];
  model_responses: {
    [model: string]: {
      decision: string;
      confidence: number;
      reasoning: string;
      evidence: string[];
    };
  };
}

export interface PricePrediction {
  asset: string;
  current_price: number;
  predicted_price: number;
  predicted_range: number[];
  timeframe: string;
  model_predictions: {
    [model: string]: number;
  };
  confidence_intervals: {
    [interval: string]: number[];
  };
  calculation_methodology: string;
  factors_considered: string[];
}

export interface VerificationResult {
  final_decision: string;
  confidence: number;
  reasoning: string;
  verification?: Verification;
  price_prediction?: PricePrediction;
}

export interface ConsensusData {
  total_iterations: number;
  current_iteration: number;
  iterations: {
    iteration_number: number;
    agreement_score: number;
    key_divergences: string[];
  }[];
  final_agreement_score: number;
  confidence_trend: number[];
  converged: boolean;
  convergence_metrics: {
    iterations_to_convergence: number;
    agreement_trend: number[];
    evidence_quality_scores: number[];
  };
}

export interface DataFeed {
  feed_id: string;
  name: string;
  current_value: number;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  historical: { timestamp: string; value: number }[];
}

export interface ModelComparisonItem {
  name: string;
  prediction: string;
  confidence: number;
  key_factor: string;
  reasoning: string;
}

export interface ModelComparison extends Array<ModelComparisonItem> {}

export interface PredictionMarketData {
  question: string;
  processedQuery?: ProcessedQuery;
  verificationResult?: VerificationResult;
  consensusData?: ConsensusData;
  dataFeeds?: DataFeed[];
  modelComparison?: ModelComparison;
}
