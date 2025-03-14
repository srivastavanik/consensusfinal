"use client";

import * as React from 'react';
import { useNFTData } from '../../app/NftDataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ConsensusAnalytics from './ConsensusAnalytics';
import ModelComparison from './ModelComparison';
import DataFeedDisplay from './DataFeedDisplay';
import MarketAnalytics from './MarketAnalytics';

export default function ConsensusAnalyticsDashboard() {
  const { predictionData, selectedConsensusTab, setSelectedConsensusTab } = useNFTData();

  if (!predictionData) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground text-xl">Submit a prediction question to view consensus analytics</p>
      </div>
    );
  }

  // Extract primary asset for market analysis
  const primaryAsset = predictionData.processedQuery?.identified_assets?.[0];

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        <Tabs 
          value={selectedConsensusTab} 
          onValueChange={setSelectedConsensusTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6 tabs-pink">
            <TabsTrigger value="summary">Consensus Analytics</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="models">Model Comparison</TabsTrigger>
            <TabsTrigger value="dataFeeds">Data Feeds</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            <ConsensusAnalytics predictionData={predictionData} />
          </TabsContent>

          <TabsContent value="market" className="mt-0">
            <MarketAnalytics 
              dataFeeds={predictionData.dataFeeds || []} 
              selectedAsset={primaryAsset}
            />
          </TabsContent>

          <TabsContent value="models" className="mt-0">
            <ModelComparison predictionData={predictionData} />
          </TabsContent>

          <TabsContent value="dataFeeds" className="mt-0">
            <DataFeedDisplay predictionData={predictionData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
