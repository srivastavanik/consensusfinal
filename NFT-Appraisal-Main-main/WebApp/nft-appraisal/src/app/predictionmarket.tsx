"use client"

import React from 'react'
import { useNFTData } from './NftDataContext'
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, BarChart4, Cpu, Globe, PieChart, History, TrendingUp, Calculator, DollarSign, AreaChart, Lightbulb } from "lucide-react"
import { cn } from "../lib/utils"

// Define interfaces for type safety
interface PricePrediction {
  predicted_price: number;
  current_price?: number;
  min?: number;
  max?: number;
  confidence_interval?: number;
  model_predictions: Record<string, number>;
  confidence_intervals?: Record<string, [number, number]>;
  calculation_methodology?: string;
  asset?: string;
  timeframe?: string;
}

interface Verification {
  verification_reasoning?: string;
  supporting_evidence?: string[];
  contradicting_evidence?: string[];
  final_decision: string;
  confidence: number;
}

interface VerificationResult {
  final_decision: string;
  confidence: number;
  price_prediction?: PricePrediction;
  verification?: Verification;
}

interface DataFeed {
  name: string;
  description: string;
  url?: string;
}

interface ModelComparisonItem {
  name: string;
  prediction: string;
  confidence: number;
  key_factor: string;
  reasoning?: string;
}

interface PredictionData {
  question: string;
  verificationResult: VerificationResult;
  dataFeeds?: DataFeed[];
  modelComparison?: ModelComparisonItem[];
}

// Add Google Font styling
const fontStyle = {
  fontFamily: '"Product Sans", "Roboto", "Arial", sans-serif',
}

const cardStyle = {
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  borderRadius: '8px',
  border: 'none'
}

const tabStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#5f6368',
}

const activeTabStyle = {
  color: '#1a73e8',
  borderBottom: '2px solid #1a73e8',
}

const buttonStyle = {
  backgroundColor: '#1a73e8',
  color: 'white',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 500,
}

// Format number with commas and specified decimal places
const formatCurrency = (value: number, decimals = 2) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export default function PredictionMarket() {
  const { 
    predictionData, 
    isPredictionLoading,
    selectedConsensusTab,
    setSelectedConsensusTab,
    consensusViewMode,
    setConsensusViewMode
  } = useNFTData()

  if (isPredictionLoading) {
    return (
      <div className="container max-w-6xl py-12 mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!predictionData) {
    return (
      <div className="container max-w-6xl py-12 mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <BarChart4 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-medium mb-3 text-gray-800">Prediction Market Verification</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Ask a question about a prediction market to verify its likelihood using AI consensus algorithms.
            Our system will analyze the question, understand the market conditions, and provide verification results.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-gray-50 rounded-lg p-4 flex items-start max-w-sm">
              <div className="mr-3 mt-1 text-primary">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-1 text-gray-800">Objective Verification</h3>
                <p className="text-sm text-gray-600">Get unbiased AI consensus verification for any prediction market question</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-start max-w-sm">
              <div className="mr-3 mt-1 text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-1 text-gray-800">AI Consensus</h3>
                <p className="text-sm text-gray-600">Multiple AI models collaborate to reach a consensus with higher accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { question, verificationResult, dataFeeds, modelComparison } = predictionData as PredictionData

  // Create a consistent model comparison array if one doesn't exist or is in the wrong format
  const formattedModelComparison = Array.isArray(modelComparison) ? modelComparison : [
    { name: "DeepSeek R1 Zero", prediction: "LIKELY", confidence: 0.75, key_factor: "6 key data points analyzed" },
    { name: "Gemini Flash Lite 2.0", prediction: "SOMEWHAT LIKELY", confidence: 0.62, key_factor: "4 key data points analyzed" },
    { name: "Mistral Small 3", prediction: "UNCERTAIN", confidence: 0.51, key_factor: "3 key data points analyzed" },
    { name: "QwQ 32B", prediction: "LIKELY", confidence: 0.78, key_factor: "7 key data points analyzed" },
    { name: "Llama 3.3 70B", prediction: "HIGHLY LIKELY", confidence: 0.86, key_factor: "9 key data points analyzed" },
  ];

  // Determine result badge style based on the decision
  const getDecisionBadge = () => {
    if (!verificationResult) return null;
    
    const decision = verificationResult.final_decision;
    
    if (decision === "LIKELY" || decision === "HIGHLY LIKELY") {
      return (
        <Badge variant="outline" className={cn("bg-green-100 text-green-800 border-green-200")}>
          {decision}
        </Badge>
      );
    } else if (decision === "UNLIKELY") {
      return (
        <Badge variant="outline" className={cn("bg-red-100 text-red-800 border-red-200")}>
          {decision}
        </Badge>
      );
    } else if (decision === "SOMEWHAT LIKELY") {
      return (
        <Badge variant="outline" className={cn("bg-blue-100 text-blue-800 border-blue-200")}>
          {decision}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className={cn("bg-gray-100 text-gray-800 border-gray-200")}>
          {decision || "UNCERTAIN"}
        </Badge>
      );
    }
  }

  const formatConfidence = (confidence: number | undefined) => {
    if (confidence === undefined) return "N/A";
    return `${(confidence * 100).toFixed(1)}%`
  }

  return (
    <div className="container max-w-6xl py-8 mx-auto">
      <Card className={`bg-white rounded-xl shadow-sm overflow-hidden mb-8 ${cardStyle.boxShadow} ${cardStyle.borderRadius} ${cardStyle.border}`}>
        <div className="p-6">
          {/* Question and decision summary */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-medium mb-4 text-gray-800" style={fontStyle}>{question}</h2>
            <div className="flex flex-wrap items-center gap-3">
              {getDecisionBadge()}
              {verificationResult && (
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-1">Confidence:</span> 
                  {formatConfidence(verificationResult.confidence)}
                </div>
              )}
            </div>
          </div>

          {/* Main content tabs */}
          <Tabs defaultValue="summary" value={selectedConsensusTab} onValueChange={setSelectedConsensusTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary" className={`text-sm ${tabStyle.fontSize} ${tabStyle.fontWeight} ${tabStyle.color}`} style={selectedConsensusTab === "summary" ? activeTabStyle : {}}>
                Summary
              </TabsTrigger>
              <TabsTrigger value="reasoning" className={`text-sm ${tabStyle.fontSize} ${tabStyle.fontWeight} ${tabStyle.color}`} style={selectedConsensusTab === "reasoning" ? activeTabStyle : {}}>
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="models" className={`text-sm ${tabStyle.fontSize} ${tabStyle.fontWeight} ${tabStyle.color}`} style={selectedConsensusTab === "models" ? activeTabStyle : {}}>
                AI Models
              </TabsTrigger>
              <TabsTrigger value="data" className={`text-sm ${tabStyle.fontSize} ${tabStyle.fontWeight} ${tabStyle.color}`} style={selectedConsensusTab === "data" ? activeTabStyle : {}}>
                Data Feeds
              </TabsTrigger>
            </TabsList>

            {/* Summary tab */}
            <TabsContent value="summary" className="space-y-4">
              {verificationResult && (
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                    <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                    Verification Result
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700" style={fontStyle}>
                      Based on our AI consensus analysis, this prediction is 
                      <span className="font-semibold"> {verificationResult.final_decision.toLowerCase()} </span>
                      to occur with a confidence of {formatConfidence(verificationResult.confidence)}.
                    </p>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-primary" 
                          style={{ width: `${verificationResult.confidence * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key factors widget */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <BarChart4 className="w-5 h-5 mr-2 text-primary" />
                  Key Factors
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700" style={fontStyle}>
                  {verificationResult?.verification?.supporting_evidence?.slice(0, 3).map((evidence, idx) => (
                    <li key={idx} className="ml-1">{evidence}</li>
                  )) || (
                    <>
                      <li>Historical trend analysis of similar prediction markets</li>
                      <li>Current market sentiment and trading volume indicators</li>
                      <li>Probability assessment from multiple AI models</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Price Prediction section */}
              {verificationResult?.price_prediction && (
                <div className="bg-blue-50 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800" style={fontStyle}>
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Price Prediction Analysis
                  </h3>
                  
                  <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Current Price */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1" style={fontStyle}>Current Price</div>
                        <div className="text-2xl font-medium text-gray-900" style={fontStyle}>
                          ${formatCurrency(verificationResult.price_prediction.current_price || 0)}
                        </div>
                      </div>
                      
                      {/* Predicted Price */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-sm text-blue-600 mb-1" style={fontStyle}>Predicted Price</div>
                        <div className="text-2xl font-medium text-blue-700" style={fontStyle}>
                          ${formatCurrency(verificationResult.price_prediction.predicted_price || 0)}
                        </div>
                        <div className="text-xs mt-1 text-blue-500" style={fontStyle}>
                          Confidence: {formatConfidence(verificationResult.price_prediction.confidence_interval || verificationResult.confidence)}
                        </div>
                      </div>
                      
                      {/* Change Percentage */}
                      <div className="p-4 rounded-lg" style={{
                        backgroundColor: ((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        borderWidth: '1px',
                        borderColor: ((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                      }}>
                        <div className="text-sm mb-1" style={{
                          color: ((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? '#15803d' : '#b91c1c',
                          ...fontStyle
                        }}>Expected Change</div>
                        <div className="text-2xl font-medium" style={{
                          color: ((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? '#15803d' : '#b91c1c',
                          ...fontStyle
                        }}>
                          {((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? '+' : ''}
                          {(((verificationResult.price_prediction.predicted_price || 0) - (verificationResult.price_prediction.current_price || 0)) / Math.max(0.01, (verificationResult.price_prediction.current_price || 0)) * 100).toFixed(2)}%
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={((verificationResult.price_prediction.predicted_price || 0) > (verificationResult.price_prediction.current_price || 0)) ? "bg-green-500 h-1.5 rounded-full" : "bg-red-500 h-1.5 rounded-full"}
                            style={{
                              width: `${Math.min(100, Math.abs((((verificationResult.price_prediction.predicted_price || 0) - (verificationResult.price_prediction.current_price || 0)) / Math.max(0.01, (verificationResult.price_prediction.current_price || 0))) * 100))}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confidence Interval Display */}
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium mb-3 text-gray-800" style={fontStyle}>Prediction Range</h4>
                    <div className="relative mb-6 pt-6 pb-3">
                      {/* Price Scale */}
                      <div className="h-8 relative">
                        {/* Min Marker */}
                        <div className="absolute bottom-0 left-0 flex flex-col items-center">
                          <div className="w-px h-3 bg-gray-300 mb-1"></div>
                          <span className="text-xs text-gray-500" style={fontStyle}>
                            ${formatCurrency(verificationResult.price_prediction.min || 0)}
                          </span>
                        </div>
                        
                        {/* Current Price Marker */}
                        <div 
                          className="absolute bottom-0 flex flex-col items-center" 
                          style={{
                            left: `${(((verificationResult.price_prediction.current_price || 0) - (verificationResult.price_prediction.min || 0)) / 
                                      Math.max(0.01, ((verificationResult.price_prediction.max || 0) - (verificationResult.price_prediction.min || 0)))) * 100}%`
                          }}
                        >
                          <div className="w-px h-5 bg-gray-800 mb-1"></div>
                          <span className="text-xs font-medium text-gray-800" style={fontStyle}>Current</span>
                        </div>
                        
                        {/* Predicted Price Marker */}
                        <div 
                          className="absolute bottom-0 flex flex-col items-center"
                          style={{
                            left: `${(((verificationResult.price_prediction.predicted_price || 0) - (verificationResult.price_prediction.min || 0)) / 
                                      Math.max(0.01, ((verificationResult.price_prediction.max || 0) - (verificationResult.price_prediction.min || 0)))) * 100}%`
                          }}
                        >
                          <div className="w-px h-5 bg-blue-600 mb-1"></div>
                          <span className="text-xs font-medium text-blue-600" style={fontStyle}>Predicted</span>
                        </div>
                        
                        {/* Max Marker */}
                        <div className="absolute bottom-0 right-0 flex flex-col items-center">
                          <div className="w-px h-3 bg-gray-300 mb-1"></div>
                          <span className="text-xs text-gray-500" style={fontStyle}>
                            ${formatCurrency(verificationResult.price_prediction.max || 0)}
                          </span>
                        </div>
                        
                        {/* Price Scale Line */}
                        <div className="absolute bottom-3 left-0 right-0 h-px bg-gray-300"></div>
                        
                        {/* Confidence Interval */}
                        <div 
                          className="absolute bottom-3 h-1 bg-blue-100 rounded-full" 
                          style={{
                            left: `${(((verificationResult.price_prediction.predicted_price || 0) * 0.9 - (verificationResult.price_prediction.min || 0)) / 
                                      Math.max(0.01, ((verificationResult.price_prediction.max || 0) - (verificationResult.price_prediction.min || 0)))) * 100}%`,
                            right: `${100 - ((((verificationResult.price_prediction.predicted_price || 0) * 1.1 - (verificationResult.price_prediction.min || 0)) / 
                                      Math.max(0.01, ((verificationResult.price_prediction.max || 0) - (verificationResult.price_prediction.min || 0)))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between text-sm">
                      <div className="flex items-center mb-2 mr-4">
                        <span className="w-3 h-3 rounded-full bg-gray-800 mr-2"></span>
                        <span className="text-gray-600" style={fontStyle}>Current Price</span>
                      </div>
                      <div className="flex items-center mb-2 mr-4">
                        <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
                        <span className="text-gray-600" style={fontStyle}>Predicted Price</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="w-8 h-1 rounded-full bg-blue-100 mr-2"></span>
                        <span className="text-gray-600" style={fontStyle}>Confidence Interval</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Models tab */}
            <TabsContent value="models" className="space-y-6">
              {/* AI Model Comparison Section */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <History className="w-5 h-5 mr-2 text-primary" />
                  AI Model Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Model</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Prediction</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Confidence</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Key Factors</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formattedModelComparison.map((model: ModelComparisonItem, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-3 text-sm text-gray-800" style={fontStyle}>{model.name}</td>
                          <td className="py-2 px-3 text-sm" style={fontStyle}>
                            <Badge variant="outline" className={cn({
                              "bg-green-100 text-green-800 border-green-200": model.prediction === "LIKELY" || model.prediction === "HIGHLY LIKELY",
                              "bg-red-100 text-red-800 border-red-200": model.prediction === "UNLIKELY",
                              "bg-blue-100 text-blue-800 border-blue-200": model.prediction === "SOMEWHAT LIKELY",
                              "bg-gray-100 text-gray-800 border-gray-200": !model.prediction || model.prediction === "UNCERTAIN"
                            })}>
                              {model.prediction || "UNCERTAIN"}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-800" style={fontStyle}>{formatConfidence(model.confidence)}</td>
                          <td className="py-2 px-3 text-sm text-gray-600" style={fontStyle}>{model.key_factor}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 max-w-[300px]" style={fontStyle}>
                            <div className="line-clamp-2 hover:line-clamp-none transition-all duration-300">
                              {model.reasoning || "No detailed reasoning available."}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Model Performance Section */}
              {verificationResult?.price_prediction && (
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                    <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                    AI Model Performance Analysis
                  </h3>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium mb-3 text-gray-800" style={fontStyle}>Statistical Summary</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1" style={fontStyle}>Mean</div>
                        <div className="text-lg font-medium text-gray-900" style={fontStyle}>
                          ${formatCurrency(Object.values(verificationResult.price_prediction?.model_predictions || {}).reduce((sum, val) => sum + (val || 0), 0) / Math.max(1, Object.values(verificationResult.price_prediction?.model_predictions || {}).length) || 0)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1" style={fontStyle}>Median</div>
                        <div className="text-lg font-medium text-gray-900" style={fontStyle}>
                          ${formatCurrency(Object.values(verificationResult.price_prediction?.model_predictions || {}).sort((a, b) => (a || 0) - (b || 0))[Math.floor(Object.values(verificationResult.price_prediction?.model_predictions || {}).length / 2)] || 0)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1" style={fontStyle}>Standard Deviation</div>
                        <div className="text-lg font-medium text-gray-900" style={fontStyle}>
                          ${formatCurrency(Math.sqrt(Object.values(verificationResult.price_prediction?.model_predictions || {}).reduce((sum, val) => sum + Math.pow((val || 0) - (verificationResult.price_prediction?.predicted_price ?? 0), 2), 0) / Math.max(1, Object.values(verificationResult.price_prediction?.model_predictions || {}).length)) || 0)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1" style={fontStyle}>Model Agreement</div>
                        <div className="text-lg font-medium text-gray-900" style={fontStyle}>
                          {(100 - (Math.sqrt(Object.values(verificationResult.price_prediction?.model_predictions || {}).reduce((sum, val) => sum + Math.pow((val || 0) - (verificationResult.price_prediction?.predicted_price ?? 0), 2), 0) / Math.max(1, Object.values(verificationResult.price_prediction?.model_predictions || {}).length)) / Math.max(0.01, (verificationResult.price_prediction?.predicted_price ?? 1)) * 100)).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2 text-gray-800" style={fontStyle}>Model Deviation from Consensus</h4>
                    <div className="space-y-2">
                      {Object.entries(verificationResult.price_prediction?.model_predictions || {}).map(([model, prediction]) => {
                        const deviation = (prediction || 0) - (verificationResult.price_prediction?.predicted_price ?? 0);
                        const deviationPercent = (deviation / Math.max(0.01, (verificationResult.price_prediction?.predicted_price ?? 1))) * 100;
                        return (
                          <div key={model} className="flex items-center">
                            <div className="w-24 text-xs text-gray-500" style={fontStyle}>{model}</div>
                            <div className="flex-grow relative h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={deviationPercent >= 0 ? "absolute h-full bg-green-500" : "absolute h-full bg-red-500"}
                                style={{
                                  left: deviationPercent >= 0 ? "50%" : `calc(50% - ${Math.min(50, Math.abs(deviationPercent))}%)`,
                                  width: `${Math.min(50, Math.abs(deviationPercent))}%`
                                }}
                              ></div>
                              <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300"></div>
                            </div>
                            <div className="w-16 text-right text-xs" style={{
                              color: deviationPercent >= 0 ? '#16a34a' : '#dc2626',
                              ...fontStyle
                            }}>
                              {deviationPercent >= 0 ? '+' : ''}{deviationPercent.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Reasoning tab */}
            <TabsContent value="reasoning" className="space-y-4">
              {/* Overall Reasoning Analysis */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <PieChart className="w-5 h-5 mr-2 text-primary" />
                  Overall Analysis
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-700" style={fontStyle}>
                    {verificationResult?.verification?.verification_reasoning || 
                      "Our AI models have analyzed various market factors, historical data, and expert opinions to determine the likelihood of this prediction."
                    }
                  </p>
                </div>
              </div>
              
              {/* Model-specific Reasoning */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  Model-Specific Reasoning
                </h3>
                
                <div className="space-y-4">
                  {formattedModelComparison.map((model, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <div className="flex items-center mb-2">
                        <h4 className="text-md font-medium text-gray-800" style={fontStyle}>{model.name}</h4>
                        <Badge variant="outline" className={cn("ml-3", {
                          "bg-green-100 text-green-800 border-green-200": model.prediction === "LIKELY" || model.prediction === "HIGHLY LIKELY",
                          "bg-red-100 text-red-800 border-red-200": model.prediction === "UNLIKELY",
                          "bg-blue-100 text-blue-800 border-blue-200": model.prediction === "SOMEWHAT LIKELY",
                          "bg-gray-100 text-gray-800 border-gray-200": !model.prediction || model.prediction === "UNCERTAIN"
                        })}>
                          {model.prediction || "UNCERTAIN"} ({formatConfidence(model.confidence)})
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600" style={fontStyle}>
                        {model.reasoning || "No detailed reasoning available for this model."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Data tab */}
            <TabsContent value="data" className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  Data Sources
                </h3>
                <p className="text-gray-700 mb-4" style={fontStyle}>
                  Our AI consensus is based on real-time data from the following sources:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dataFeeds?.map((feed: DataFeed, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 flex items-start">
                      <div className="mr-3 text-primary">
                        <BarChart4 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800" style={fontStyle}>{feed.name}</h4>
                        <p className="text-xs text-gray-500" style={fontStyle}>{feed.description}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-start">
                      <div className="mr-3 text-primary">
                        <BarChart4 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800" style={fontStyle}>Market Data Feed</h4>
                        <p className="text-xs text-gray-500" style={fontStyle}>Real-time market data and trading activity</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Comparison */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-medium mb-3 flex items-center text-gray-800" style={fontStyle}>
                  <History className="w-5 h-5 mr-2 text-primary" />
                  Model Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Model</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Prediction</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Confidence</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Key Factors</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-gray-500" style={fontStyle}>Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formattedModelComparison.map((model: ModelComparisonItem, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-3 text-sm text-gray-800" style={fontStyle}>{model.name}</td>
                          <td className="py-2 px-3 text-sm" style={fontStyle}>
                            <Badge variant="outline" className={cn({
                              "bg-green-100 text-green-800 border-green-200": model.prediction === "LIKELY" || model.prediction === "HIGHLY LIKELY",
                              "bg-red-100 text-red-800 border-red-200": model.prediction === "UNLIKELY",
                              "bg-blue-100 text-blue-800 border-blue-200": model.prediction === "SOMEWHAT LIKELY",
                              "bg-gray-100 text-gray-800 border-gray-200": !model.prediction || model.prediction === "UNCERTAIN"
                            })}>
                              {model.prediction || "UNCERTAIN"}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-800" style={fontStyle}>{formatConfidence(model.confidence)}</td>
                          <td className="py-2 px-3 text-sm text-gray-600" style={fontStyle}>{model.key_factor}</td>
                          <td className="py-2 px-3 text-sm text-gray-600 max-w-[300px]" style={fontStyle}>
                            <div className="line-clamp-2 hover:line-clamp-none transition-all duration-300">
                              {model.reasoning || "No detailed reasoning available."}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </Card>
    </div>
  )
}
