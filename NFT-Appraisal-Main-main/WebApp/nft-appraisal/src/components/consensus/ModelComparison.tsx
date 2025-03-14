"use client";

import React, { useState, useEffect } from 'react';
import { modelComparisonApi, ModelComparisonData } from '../../services/api';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ModelComparisonProps {
  predictionData: {
    modelComparison?: any;
    nftId?: string; // Used to fetch model data for a specific NFT
  };
}

export default function ModelComparison({ predictionData }: ModelComparisonProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsData, setModelsData] = useState<ModelComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch models data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await modelComparisonApi.getAllModels();
        setModelsData(data);
        
        // Set the first model as selected by default
        if (data.length > 0 && !selectedModel) {
          setSelectedModel(data[0].model_id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching model comparison data:', err);
        setError('Failed to load model comparison data');
        
        // Fallback to mock data if provided in props
        if (predictionData.modelComparison) {
          try {
            // Convert the legacy format to our new format
            const mockModels = predictionData.modelComparison.models || [];
            const mockData: ModelComparisonData[] = mockModels.map(
              (modelId: string) => ({
                model_id: modelId,
                model_name: modelId,
                accuracy: predictionData.modelComparison?.confidences?.[modelId] || 0.5,
                confidence: predictionData.modelComparison?.confidences?.[modelId] || 0.5,
                response_time: predictionData.modelComparison?.response_times?.[modelId] || 0,
                evidence_quality: 0.7,
                key_features: [
                  { name: 'Feature 1', weight: 0.3 },
                  { name: 'Feature 2', weight: 0.2 },
                ],
                prediction: 0,
                explanation: 'Mock data',
              })
            );
            
            setModelsData(mockData);
            if (mockData.length > 0 && !selectedModel) {
              setSelectedModel(mockData[0].model_id);
            }
            setError(null);
          } catch (mockErr) {
            console.error('Error creating mock data:', mockErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [predictionData.modelComparison, selectedModel]);

  // Get the selected model data
  const selectedModelData = modelsData.find(model => model.model_id === selectedModel);
  
  // Prepare the comparison chart data
  const comparisonChartData = {
    labels: ['Accuracy', 'Confidence', 'Response Time', 'Evidence Quality'],
    datasets: modelsData.map(model => ({
      label: model.model_name,
      data: [
        model.accuracy,
        model.confidence,
        // Normalize response time (lower is better, so invert it)
        1 - Math.min(model.response_time / 5, 1),
        model.evidence_quality,
      ],
      backgroundColor: model.model_id === selectedModel 
        ? 'rgba(255, 99, 132, 0.3)'
        : 'rgba(54, 162, 235, 0.2)',
      borderColor: model.model_id === selectedModel
        ? 'rgb(255, 99, 132)'
        : 'rgb(54, 162, 235)',
      borderWidth: model.model_id === selectedModel ? 2 : 1,
    })),
  };
  
  // Prepare key features chart data for the selected model
  const keyFeaturesData = selectedModelData ? {
    labels: selectedModelData.key_features.map(feature => feature.name),
    datasets: [
      {
        label: 'Feature Weight',
        data: selectedModelData.key_features.map(feature => feature.weight),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  } : { labels: [], datasets: [] };
  
  if (isLoading) {
    return <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20">Loading model comparison data...</div>;
  }

  if (error && modelsData.length === 0) {
    return <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20">
      <h2 className="text-xl font-bold mb-4">Model Comparison</h2>
      
      {/* Model Selection */}
      <div className="mb-6 flex flex-wrap gap-2">
        {modelsData.map(model => (
          <button
            key={model.model_id}
            onClick={() => setSelectedModel(model.model_id)}
            className={`px-3 py-1 rounded-lg ${
              selectedModel === model.model_id
                ? 'bg-primary text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {model.model_name}
          </button>
        ))}
      </div>
      
      {/* Model Metrics Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart for Model Comparison */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-md font-semibold mb-4">Performance Metrics Comparison</h3>
          <Radar
            data={comparisonChartData}
            options={{
              responsive: true,
              scales: {
                r: {
                  min: 0,
                  max: 1,
                  ticks: {
                    stepSize: 0.2,
                    showLabelBackdrop: false,
                  },
                },
              },
            }}
          />
          <div className="mt-4 text-xs text-gray-500 text-center">
            * Response time is normalized (higher is better)
          </div>
        </div>
        
        {/* Key Features Chart */}
        {selectedModelData && (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-md font-semibold mb-4">Key Features Impact</h3>
            <Bar
              data={keyFeaturesData}
              options={{
                indexAxis: 'y' as const,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    max: 1,
                  },
                },
              }}
            />
          </div>
        )}
      </div>
      
      {/* Selected Model Details */}
      {selectedModelData && (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">{selectedModelData.model_name} Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Accuracy</h4>
              <p className="text-xl font-semibold">{(selectedModelData.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Confidence</h4>
              <p className="text-xl font-semibold">{(selectedModelData.confidence * 100).toFixed(1)}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Response Time</h4>
              <p className="text-xl font-semibold">{selectedModelData.response_time.toFixed(1)}s</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Evidence Quality</h4>
              <p className="text-xl font-semibold">{(selectedModelData.evidence_quality * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Prediction</h4>
            <p className="text-xl font-semibold">{selectedModelData.prediction}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Explanation</h4>
            <p className="text-gray-700">{selectedModelData.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
