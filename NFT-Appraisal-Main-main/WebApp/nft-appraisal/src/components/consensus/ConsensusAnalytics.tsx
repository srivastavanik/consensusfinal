"use client";

import React, { useState, useEffect } from 'react';
import { consensusApi, ConsensusData } from '../../services/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define custom iteration data type
interface IterationData {
  iteration_number: number;
  consensus_value: number;
  confidence: number;
  agreement_score: number;
  outliers_removed: number;
  convergence_delta: number;
}

interface ConsensusAnalyticsProps {
  predictionData: any; // Using any to accommodate both PredictionMarketData and the api.ConsensusData
}

export default function ConsensusAnalytics({ predictionData }: ConsensusAnalyticsProps) {
  const [consensusData, setConsensusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have consensus data from props, use it
    if (predictionData?.consensusData) {
      setConsensusData(predictionData.consensusData);
      return;
    }

    // Otherwise, if we have a marketId, fetch the consensus data
    if (predictionData?.marketId) {
      setLoading(true);
      // Using getConsensusData instead of getConsensusForMarket since that's the available method
      consensusApi.getConsensusData()
        .then((data: ConsensusData[]) => {
          // Find the matching market data if available, or use the first item
          const marketData = data.find(item => item.consensus_id === predictionData.marketId) || data[0];
          setConsensusData(marketData);
          setLoading(false);
        })
        .catch((err: Error) => {
          console.error("Error fetching consensus data:", err);
          setError("Failed to load consensus data");
          setLoading(false);
        });
    }
  }, [predictionData]);

  if (loading) return <div className="text-center py-8">Loading consensus data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!consensusData) return <div className="text-center py-8">No consensus data available</div>;

  // Prepare data for iteration progress chart
  const iterationLabels = consensusData.iterations ? 
    consensusData.iterations.map((_: any, i: number) => `Iteration ${i + 1}`) : [];

  // Prepare data for confidence & agreement scores
  const confidenceData = consensusData.iterations ? 
    consensusData.iterations.map((i: any) => i.confidence * 100) : [];

  const agreementData = consensusData.iterations ? 
    consensusData.iterations.map((i: any) => i.agreement_score * 100) : [];

  const consensusValueData = consensusData.iterations ? 
    consensusData.iterations.map((i: any) => i.consensus_value) : [];

  // Chart data for consensus evolution
  const consensusEvolutionData = {
    labels: iterationLabels,
    datasets: [
      {
        label: 'Consensus Value',
        data: consensusValueData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ],
  };

  // Chart data for confidence & agreement
  const confidenceChartData = {
    labels: iterationLabels,
    datasets: [
      {
        label: 'Confidence (%)',
        data: confidenceData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Agreement Score (%)',
        data: agreementData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
    ],
  };

  // Final agreement score for gauge visualization
  const finalAgreementScore = consensusData.final_agreement_score ? 
    Math.round(consensusData.final_agreement_score * 100) : 0;

  // Consensus convergence metrics
  const convergenceMetrics = consensusData.convergence_metrics || {
    iterations_to_converge: 'N/A',
    total_iterations: consensusData.iterations?.length || 0,
    final_delta: 'N/A'
  };

  // Convergence status
  const convergenceStatus = consensusData.converged !== undefined ? 
    (consensusData.converged ? 'Converged' : 'Not Converged') : 'Unknown';
  const statusColor = consensusData.converged ? 'text-green-500' : 'text-amber-500';

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Final Consensus Value</h3>
          <p className="text-2xl font-bold mt-2">{consensusData.consensus_value?.toFixed(4) || 'N/A'}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Confidence Level</h3>
          <p className="text-2xl font-bold mt-2">{(consensusData.confidence * 100)?.toFixed(2) || 'N/A'}%</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Convergence Status</h3>
          <p className={`text-2xl font-bold mt-2 ${statusColor}`}>{convergenceStatus}</p>
        </div>
      </div>

      {/* Consensus evolution chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Consensus Value Evolution</h3>
        <div className="h-64">
          <Line 
            data={consensusEvolutionData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Confidence & agreement chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Model Confidence & Agreement</h3>
        <div className="h-64">
          <Line 
            data={confidenceChartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  min: 0,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Percentage (%)',
                  },
                },
              }
            }} 
          />
        </div>
      </div>

      {/* Iteration details */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Iteration Details</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Iteration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consensus Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agreement Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Convergence Delta</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {consensusData.iterations && consensusData.iterations.map((iteration: IterationData, index: number) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{iteration.consensus_value.toFixed(4)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{(iteration.confidence * 100).toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{(iteration.agreement_score * 100).toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{iteration.convergence_delta.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convergence metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Iterations to Converge</h3>
          <p className="text-2xl font-bold mt-2">{convergenceMetrics.iterations_to_converge}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Total Iterations</h3>
          <p className="text-2xl font-bold mt-2">{convergenceMetrics.total_iterations}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500 dark:text-gray-400">Final Delta</h3>
          <p className="text-2xl font-bold mt-2">{typeof convergenceMetrics.final_delta === 'number' ? convergenceMetrics.final_delta.toFixed(6) : convergenceMetrics.final_delta}</p>
        </div>
      </div>

      {/* Outlier analysis section - could be added in future iterations */}
      {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Outlier Analysis</h3>
        <div className="h-64">
          <Bar 
            data={{
              labels: iterationLabels,
              datasets: [{
                label: 'Outliers Removed',
                data: consensusData.iterations.map((i) => i.outliers_removed),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
              }]
            }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }} 
          />
        </div>
      </div> */}
    </div>
  );
}
