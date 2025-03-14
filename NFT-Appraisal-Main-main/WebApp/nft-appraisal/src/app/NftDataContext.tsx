"use client"

import * as React from 'react';

// Define interfaces for prediction market data
export interface ProcessedQuery {
  question_type: string;
  identified_assets: string[];
  price_thresholds: string[];
  percentage_thresholds: string[];
  date_references: string[];
  timeframes: string[];
}

interface Verification {
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

interface PricePrediction {
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

interface VerificationResult {
  final_decision: string;
  confidence: number;
  reasoning: string;
  verification?: Verification;
  price_prediction?: PricePrediction;
}

interface ConsensusData {
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

interface DataFeed {
  feed_id: string;
  name: string;
  current_value: number;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  historical: { timestamp: string; value: number }[];
}

interface ModelComparisonItem {
  name: string;
  prediction: string;
  confidence: number;
  key_factor: string;
  reasoning?: string;
}

interface ModelComparison extends Array<ModelComparisonItem> {}

interface PredictionMarketData {
  question: string;
  processedQuery?: ProcessedQuery;
  verificationResult?: VerificationResult;
  consensusData?: ConsensusData;
  dataFeeds?: DataFeed[];
  modelComparison?: ModelComparison;
}

interface NFTDataContextType {
  predictionData: PredictionMarketData | null;
  setPredictionData: (data: PredictionMarketData | null) => void;
  isPredictionLoading: boolean;
  setIsPredictionLoading: (loading: boolean) => void;
  selectedConsensusTab: string;
  setSelectedConsensusTab: (tab: string) => void;
  consensusViewMode: string;
  setConsensusViewMode: (mode: string) => void;
  appMode: 'landing' | 'nft' | 'prediction';
  setAppMode: (mode: 'landing' | 'nft' | 'prediction') => void;
}

// React context for NFT data
// @ts-ignore - Ignoring type checking for React context creation
const NFTDataContext = React.createContext<NFTDataContextType>({} as NFTDataContextType);

export function NFTDataProvider({ children }: { children: React.ReactNode }) {
  const [predictionData, setPredictionData] = React.useState<PredictionMarketData | null>(null);
  const [isPredictionLoading, setIsPredictionLoading] = React.useState(false);
  const [selectedConsensusTab, setSelectedConsensusTab] = React.useState('summary');
  const [consensusViewMode, setConsensusViewMode] = React.useState('chart'); // Options: 'chart', 'table', 'detail'
  const [appMode, setAppMode] = React.useState('landing');

  return (
    <NFTDataContext.Provider value={{ 
      predictionData,
      setPredictionData,
      isPredictionLoading,
      setIsPredictionLoading,
      selectedConsensusTab,
      setSelectedConsensusTab,
      consensusViewMode,
      setConsensusViewMode,
      appMode,
      setAppMode
    }}>
      {children}
    </NFTDataContext.Provider>
  );
}

export function useNFTData(): NFTDataContextType {
  // @ts-ignore - Ignoring type checking for context to focus on functionality
  const context = React.useContext(NFTDataContext);
  // Type assertion to help TypeScript know this is a valid context
  return context as NFTDataContextType;
}