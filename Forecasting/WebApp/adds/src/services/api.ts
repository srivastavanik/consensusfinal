import axios from 'axios';

// Configure the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define data types
export interface HistoricalDataPoint {
  timestamp: string;
  price: number;
}

export interface FTSOFeed {
  id: string;
  name: string;
  current_price: number;
  previous_price: number;
  change_24h: number;
  updated_at: string;
  historical_data: HistoricalDataPoint[];
}

export interface KeyFeature {
  name: string;
  weight: number;
}

export interface ModelComparisonData {
  model_id: string;
  model_name: string;
  accuracy: number;
  confidence: number;
  response_time: number;
  evidence_quality: number;
  key_features: KeyFeature[];
  prediction: number;
  explanation: string;
}

export interface ConsensusData {
  consensus_id: string;
  timestamp: string;
  consensus_value: number;
  confidence_level: number;
  participant_count: number;
  market_status: 'open' | 'closed' | 'pending';
  details: {
    values: number[];
    weights: number[];
    sources: string[];
  };
}

// FTSO API Service
export const ftsoApi = {
  async getAllFeeds(): Promise<FTSOFeed[]> {
    try {
      const response = await apiClient.get('/api/ftso/feeds');
      return response.data;
    } catch (error) {
      console.error('Error fetching all FTSO feeds:', error);
      
      // Return mock data if API fails
      return [
        {
          id: 'ftso-xrp-usd',
          name: 'XRP/USD',
          current_price: 0.5923,
          previous_price: 0.5738,
          change_24h: 3.22,
          updated_at: new Date().toISOString(),
          historical_data: generateMockHistoricalData(0.57, 0.60),
        },
        {
          id: 'ftso-flr-usd',
          name: 'FLR/USD',
          current_price: 0.0243,
          previous_price: 0.0251,
          change_24h: -3.19,
          updated_at: new Date().toISOString(),
          historical_data: generateMockHistoricalData(0.023, 0.026),
        },
        {
          id: 'ftso-ltc-usd',
          name: 'LTC/USD',
          current_price: 67.92,
          previous_price: 65.47,
          change_24h: 3.74,
          updated_at: new Date().toISOString(),
          historical_data: generateMockHistoricalData(64, 68),
        },
        {
          id: 'ftso-btc-usd',
          name: 'BTC/USD',
          current_price: 27453.12,
          previous_price: 27981.35,
          change_24h: -1.89,
          updated_at: new Date().toISOString(),
          historical_data: generateMockHistoricalData(27000, 28000),
        },
        {
          id: 'ftso-eth-usd',
          name: 'ETH/USD',
          current_price: 1843.27,
          previous_price: 1801.53,
          change_24h: 2.32,
          updated_at: new Date().toISOString(),
          historical_data: generateMockHistoricalData(1800, 1850),
        },
      ];
    }
  },
  
  async getFeedById(feedId: string): Promise<FTSOFeed | null> {
    try {
      const response = await apiClient.get(`/api/ftso/feeds/${feedId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching FTSO feed ${feedId}:`, error);
      return null;
    }
  },
};

// Model Comparison API Service
export const modelComparisonApi = {
  async getAllModels(): Promise<ModelComparisonData[]> {
    try {
      const response = await apiClient.get('/api/models/comparison');
      return response.data;
    } catch (error) {
      console.error('Error fetching model comparison data:', error);
      
      // Return mock data if API fails
      return [
        {
          model_id: 'qwen',
          model_name: 'Qwen',
          accuracy: 0.89,
          confidence: 0.92,
          response_time: 0.5,
          evidence_quality: 0.90,
          key_features: [
            { name: 'Context Understanding', weight: 0.8 },
            { name: 'Market Trend Analysis', weight: 0.7 },
            { name: 'Tokenomics Evaluation', weight: 0.6 },
          ],
          prediction: 1.25,
          explanation: 'Qwen excels at analyzing market data with a focus on long-term trends and contextual understanding.',
        },
        {
          model_id: 'llama',
          model_name: 'Llama',
          accuracy: 0.87,
          confidence: 0.88,
          response_time: 0.4,
          evidence_quality: 0.85,
          key_features: [
            { name: 'Technical Analysis', weight: 0.85 },
            { name: 'On-Chain Metrics', weight: 0.75 },
            { name: 'Smart Contract Evaluation', weight: 0.65 },
          ],
          prediction: 1.18,
          explanation: 'Llama specializes in on-chain analysis and smart contract evaluation for accurate NFT valuations.',
        },
        {
          model_id: 'gemini',
          model_name: 'Gemini',
          accuracy: 0.91,
          confidence: 0.89,
          response_time: 0.6,
          evidence_quality: 0.92,
          key_features: [
            { name: 'Multimodal Analysis', weight: 0.9 },
            { name: 'Artistic Value Assessment', weight: 0.8 },
            { name: 'Collection Rarity', weight: 0.7 },
          ],
          prediction: 1.30,
          explanation: 'Gemini leverages multimodal capabilities to assess both visual attributes and market data for comprehensive NFT appraisals.',
        },
        {
          model_id: 'claude',
          model_name: 'Claude',
          accuracy: 0.86,
          confidence: 0.82,
          response_time: 0.7,
          evidence_quality: 0.88,
          key_features: [
            { name: 'Social Sentiment', weight: 0.8 },
            { name: 'Creator History', weight: 0.7 },
            { name: 'Market Liquidity', weight: 0.6 },
          ],
          prediction: 1.15,
          explanation: 'Claude excels at analyzing social sentiment and creator reputation for accurate NFT valuation predictions.',
        },
      ];
    }
  },
  
  async getModelById(modelId: string): Promise<ModelComparisonData | null> {
    try {
      const response = await apiClient.get(`/api/models/${modelId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching model ${modelId}:`, error);
      return null;
    }
  },
};

// Consensus API Service
export const consensusApi = {
  async getConsensusData(): Promise<ConsensusData[]> {
    try {
      const response = await apiClient.get('/api/consensus/data');
      return response.data;
    } catch (error) {
      console.error('Error fetching consensus data:', error);
      
      // Return mock data if API fails
      return [
        {
          consensus_id: 'cons-1',
          timestamp: new Date().toISOString(),
          consensus_value: 27350.45,
          confidence_level: 0.89,
          participant_count: 5,
          market_status: 'open',
          details: {
            values: [27300, 27400, 27380, 27325, 27350],
            weights: [0.3, 0.2, 0.2, 0.15, 0.15],
            sources: ['model-1', 'model-2', 'model-3', 'model-4', 'model-5'],
          },
        },
        {
          consensus_id: 'cons-2',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          consensus_value: 27280.12,
          confidence_level: 0.92,
          participant_count: 5,
          market_status: 'closed',
          details: {
            values: [27260, 27290, 27300, 27275, 27280],
            weights: [0.3, 0.2, 0.2, 0.15, 0.15],
            sources: ['model-1', 'model-2', 'model-3', 'model-4', 'model-5'],
          },
        },
      ];
    }
  },
};

// Helper function to generate mock historical data
function generateMockHistoricalData(min: number, max: number): HistoricalDataPoint[] {
  const result: HistoricalDataPoint[] = [];
  const now = new Date();
  
  // Generate data points for the last 24 hours (hourly)
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (i * 3600000));
    const randomValue = min + Math.random() * (max - min);
    
    result.push({
      timestamp: timestamp.toISOString(),
      price: parseFloat(randomValue.toFixed(min < 1 ? 4 : 2)),
    });
  }
  
  // Return data in chronological order
  return result.reverse();
}

export default {
  ftso: ftsoApi,
  modelComparison: modelComparisonApi,
  consensus: consensusApi,
};
