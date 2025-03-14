"use client";

import * as React from 'react';
import { Button } from "~/components/ui/button";
import { LightbulbIcon, LineChart, PieChart, Zap } from "lucide-react";
import { useNFTData } from "./NftDataContext";

// Apply Open Sans font throughout the application 
const openSansFont = '"Open Sans", sans-serif';

// Simple Card component for our landing page
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={`p-6 bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg border-0 rounded-xl shadow-xl hover:shadow-pink-200/30 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);

export default function Landing() {
  const { setAppMode } = useNFTData();

  // Function to handle button click and transition to main app
  const handleBeginClick = () => {
    // Add a smooth transition effect
    document.body.style.transition = "opacity 0.5s ease-in-out";
    document.body.style.opacity = "0.5";
    
    // After a short delay, set the app mode to 'prediction' for Forecaster functionality
    setTimeout(() => {
      setAppMode('prediction');
      // Reset the opacity
      document.body.style.opacity = "1";
    }, 500);
  };

  // Adding keyframes for gradient animations
  React.useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Define the keyframes
    const keyframes = `
      @keyframes panGradient {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(50%); }
      }
    `;
    
    // Set the keyframes in the style element
    styleEl.textContent = keyframes;
    
    // Append the style element to the document head
    document.head.appendChild(styleEl);
    
    // Cleanup function to remove the style element when the component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative font-sans">
      {/* Animated Gradient Background with Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-pink-200 to-white opacity-90"></div>
      
      {/* Gradient Animation Layer */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[length:10px_10px] animate-pan-right" 
             style={{ 
               backgroundImage: `linear-gradient(to right, transparent 30%, rgba(236, 72, 153, 0.3) 45%, rgba(236, 72, 153, 0.3) 55%, transparent 70%)`,
               animation: 'panGradient 15s linear infinite'
             }}>
        </div>
        <div className="absolute inset-0 bg-[length:10px_10px] animate-pan-left" 
             style={{ 
               backgroundImage: `linear-gradient(to left, transparent 30%, rgba(236, 72, 153, 0.3) 45%, rgba(236, 72, 153, 0.3) 55%, transparent 70%)`,
               animation: 'panGradient 18s linear infinite'
             }}>
        </div>
      </div>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay">
        <div className="h-full w-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-.895-3-2-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-.895-3-2-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-.895-3-2-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-.895-3-2-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
      </div>
      
      {/* Animated Gradient Circles */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-white rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-white rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400 to-white rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Main content area with surrounding features */}
        <div className="w-full max-w-7xl relative">
          {/* Top row features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-pink-500 bg-opacity-20 p-4 mb-4 shadow-inner">
                  <PieChart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: openSansFont }}>
                  AI-Powered Predictions
                </h3>
                <p className="text-black text-opacity-80" style={{ fontFamily: openSansFont }}>
                  Advanced machine learning algorithms provide accurate market predictions with detailed confidence intervals
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-pink-500 bg-opacity-20 p-4 mb-4 shadow-inner">
                  <LineChart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: openSansFont }}>
                  Comprehensive Analytics
                </h3>
                <p className="text-black text-opacity-80" style={{ fontFamily: openSansFont }}>
                  Detailed visualization and analysis of market trends, model comparisons, and performance metrics
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-pink-500 bg-opacity-20 p-4 mb-4 shadow-inner">
                  <Zap className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: openSansFont }}>
                  Flare Network Integration
                </h3>
                <p className="text-black text-opacity-80" style={{ fontFamily: openSansFont }}>
                  Seamlessly connects with Flare's decentralized oracle network for secure and reliable market data
                </p>
              </div>
            </Card>
          </div>

          {/* Header Section (Center) */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="relative inline-block">
              <h1 className="text-8xl font-extrabold text-white mb-6 tracking-tight relative z-10" style={{ fontFamily: openSansFont }}>
                Meet <span className="relative text-white" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 192, 203, 0.6)' }}>
                  Forecaster
                </span>
              </h1>
              {/* Enhanced glow effects */}
              <div className="absolute -inset-2 rounded-lg bg-pink-600 opacity-60 blur-2xl z-0 animate-pulse"></div>
              <div className="absolute -inset-3 rounded-lg bg-pink-500 opacity-40 blur-3xl z-0 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -inset-4 rounded-lg bg-pink-400 opacity-30 blur-3xl z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>
            <p className="text-xl text-white opacity-90 mb-4 mt-8" style={{ fontFamily: openSansFont }}>
              Your advanced AI-powered tool for market predictions and verification with unprecedented accuracy and transparency
            </p>
            <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 mb-10 inline-block shadow-lg">
              <p className="text-white text-md" style={{ fontFamily: openSansFont }}>
                <span className="font-semibold">Powered by:</span> <span className="text-blue-200">Qwen</span> · <span className="text-green-200">Llama</span> · <span className="text-yellow-200">Gemini</span> · <span className="text-pink-200">Claude</span>
              </p>
            </div>
            <Button 
              onClick={handleBeginClick}
              className="px-8 py-6 text-lg rounded-full font-medium bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-pink-400/30"
              style={{ fontFamily: openSansFont }}
            >
              Begin
            </Button>
          </div>

          {/* Bottom row features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 4 */}
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-pink-500 bg-opacity-20 p-4 mb-4 shadow-inner">
                  <LightbulbIcon className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: openSansFont }}>
                  Smart Decision Support
                </h3>
                <p className="text-black text-opacity-80" style={{ fontFamily: openSansFont }}>
                  Get actionable insights and decision support backed by multiple AI models and real-time data
                </p>
              </div>
            </Card>

            {/* Google Trusted Testing Feature */}
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-pink-500/20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 flex justify-center mb-4 md:mb-0">
                  <div className="rounded-full bg-pink-500 bg-opacity-20 p-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#db2777" className="w-12 h-12">
                      <path d="M22.5 11.63h-1.5V9.75a7.5 7.5 0 0 0-7.5-7.5c-4.13 0-7.5 3.37-7.5 7.5v1.88H4.5c-.83 0-1.5.67-1.5 1.5v9.37c0 .83.67 1.5 1.5 1.5h18c.83 0 1.5-.67 1.5-1.5v-9.37c0-.83-.67-1.5-1.5-1.5zm-9-1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm2.25 9.37h-4.5v-3.75c0-.41.34-.75.75-.75h3c.41 0 .75.34.75.75v3.75z"/>
                    </svg>
                  </div>
                </div>
                <div className="md:w-2/3 text-center md:text-left md:pl-6">
                  <h3 className="text-2xl font-semibold text-black mb-2" style={{ fontFamily: openSansFont }}>
                    Enterprise-Grade Security
                  </h3>
                  <p className="text-black text-opacity-80" style={{ fontFamily: openSansFont }}>
                    Forecaster uses Google Cloud infrastructure for secure, scalable, and reliable predictions you can trust.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-pink-600/20 via-pink-500/10 to-pink-600/20 p-6 rounded-2xl backdrop-filter backdrop-blur-sm">
            <p className="text-white font-medium mb-2" style={{ fontFamily: openSansFont }}> 2025 Forecaster. All rights reserved.</p>
            <p className="text-sm text-white text-opacity-80" style={{ fontFamily: openSansFont }}>
              Powered by advanced AI and the <span className="text-pink-300 font-medium">Flare Network</span>
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="text-white hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-pink-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
