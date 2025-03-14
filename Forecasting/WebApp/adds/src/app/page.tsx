"use client"

import ModelComparison from "./modelcomparison";
import SideInfo from "./sideinfo";
import Header from "./header";
import PredictionMarket from "./predictionmarket";
import Landing from "./landing";
import { NFTDataProvider, useNFTData } from "./NftDataContext";

function MainContent() {
  const { appMode } = useNFTData();
  
  if (appMode === 'landing') {
    return <Landing />;
  }
  
  return (
    <div className="w-full h-screen flex flex-col bg-bgcol text-gray-200">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {appMode === 'nft' ? (
          // NFT Appraisal Mode
          <>
            <ModelComparison />
            <SideInfo />
          </>
        ) : (
          // Prediction Market Mode
          <PredictionMarket />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <NFTDataProvider>
      <MainContent />
    </NFTDataProvider>
  );
}
