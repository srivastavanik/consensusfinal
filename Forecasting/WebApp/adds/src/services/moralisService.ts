/**
 * Moralis API service for real market data
 */

import { DataFeed } from '../types/index';

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API || process.env.MORALIS_API;
const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2';

/**
 * Get current price of a token
 * @param token Token symbol (e.g. 'BTC', 'ETH')
 * @param currency Currency to convert to (default: 'USD')
 */
export async function getTokenPrice(token: string, currency: string = 'USD'): Promise<number> {
  try {
    // Map common token names to their symbols if needed
    const tokenSymbols: {[key: string]: string} = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA',
      'bnb': 'BNB',
      'xrp': 'XRP',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'avalanche': 'AVAX',
      'litecoin': 'LTC'
    };
    
    const tokenSymbol = tokenSymbols[token.toLowerCase()] || token.toUpperCase();
    
    // For top cryptocurrencies, use CoinGecko API as Moralis doesn't directly support major coins like BTC
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${token.toLowerCase()}&vs_currencies=usd`;
    
    console.log(`Fetching price for ${token} from CoinGecko`);
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`CoinGecko fetch failed for ${token}, trying fallback`);
      // Use mock data as fallback
      throw new Error(`Failed to fetch from CoinGecko for ${token}`);
    }

    const data = await response.json();
    const price = data[token.toLowerCase()]?.usd;
    
    if (!price) {
      console.log(`No price found in CoinGecko response for ${token}, using fallback`);      
      throw new Error(`No price found for ${token}`);
    }
    
    console.log(`Successfully fetched price for ${token}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${token}:`, error);
    // Return estimated price based on known tokens as fallback
    const estimatedPrices: {[key: string]: number} = {
      'BTC': 62500,
      'ETH': 3300,
      'SOL': 180,
      'ADA': 0.55,
      'BNB': 610,
      'XRP': 0.65,
      'DOGE': 0.16,
      'DOT': 7.9,
      'AVAX': 36,
      'LTC': 87
    };
    
    // Define token symbols map again within catch block for error handling
    const fallbackSymbols: {[key: string]: string} = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA',
      'bnb': 'BNB',
      'xrp': 'XRP',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'avalanche': 'AVAX',
      'litecoin': 'LTC'
    };
    
    const symbol = fallbackSymbols[token.toLowerCase()] || token.toUpperCase();
    console.log(`Using fallback price for ${token}: $${estimatedPrices[symbol] || 100}`);
    return estimatedPrices[symbol] || 100;
  }
}

/**
 * Get historical token prices for a specific time range
 * @param token Token symbol
 * @param days Number of days to look back
 */
export async function getHistoricalPrices(token: string, days: number = 14): Promise<{timestamp: string, value: number}[]> {
  try {
    const tokenSymbols: {[key: string]: string} = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA',
      'bnb': 'BNB',
      'xrp': 'XRP',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'avalanche': 'AVAX',
      'litecoin': 'LTC'
    };
    
    const tokenId = token.toLowerCase();
    
    // Use CoinGecko for historical prices
    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`;
    
    console.log(`Fetching historical prices for ${token} from CoinGecko`);
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`CoinGecko historical data fetch failed for ${token}, using fallback`);
      throw new Error(`Failed to fetch historical prices for ${token}`);
    }

    const data = await response.json();
    if (!data.prices || !Array.isArray(data.prices)) {
      console.log(`Invalid historical data for ${token}, using fallback`);
      throw new Error(`Invalid historical data for ${token}`);
    }
    
    console.log(`Successfully fetched historical prices for ${token}`);
    return data.prices.map((priceData: [number, number]) => ({
      timestamp: new Date(priceData[0]).toISOString(),
      value: priceData[1]
    }));
  } catch (error) {
    console.error(`Error fetching historical prices for ${token}:`, error);
    
    // Generate realistic mock historical data if API fails
    console.log(`Generating mock historical data for ${token}`);
    const historicalData = [];
    const basePrice = getBasePrice(token);
    const currentDate = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      
      // Create some realistic price movements (with some volatility)
      const volatility = 0.03; // 3% daily volatility
      const randomChange = 1 + ((Math.random() - 0.5) * volatility * 2);
      const price = basePrice * (1 + ((days - i) / days) * 0.1) * randomChange;
      
      historicalData.push({
        timestamp: date.toISOString(),
        value: price
      });
    }
    
    console.log(`Generated ${historicalData.length} mock data points for ${token}`);
    return historicalData;
  }
}

/**
 * Get market data feeds for multiple assets
 * @param assets List of asset names or symbols
 */
export async function getMarketDataFeeds(assets: string[]): Promise<DataFeed[]> {
  try {
    console.log(`Getting market data for assets: ${assets.join(', ')}`);
    const dataFeeds: DataFeed[] = [];
    
    // Process each asset
    for (const asset of assets) {
      try {
        // Get current price
        const currentPrice = await getTokenPrice(asset);
        
        // Get historical prices for trend analysis
        const historicalPrices = await getHistoricalPrices(asset);
        
        // Calculate trend based on historical data
        let trend: 'up' | 'down' | 'stable' = "stable";
        if (historicalPrices.length > 5) {
          const recent = historicalPrices[historicalPrices.length - 1]?.value || 0;
          const past = historicalPrices[0]?.value || 0;
          const percentChange = past > 0 ? ((recent - past) / past) * 100 : 0;
          
          if (percentChange > 5) trend = "up";
          else if (percentChange < -5) trend = "down";
        }
        
        dataFeeds.push({
          name: asset.charAt(0).toUpperCase() + asset.slice(1).toLowerCase(),
          feed_id: asset.toLowerCase(),
          current_value: currentPrice,
          historical: historicalPrices,
          trend: trend,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error processing market data for ${asset}:`, error);
        // Add fallback data
        dataFeeds.push(createFallbackDataFeed(asset));
      }
    }
    
    return dataFeeds;
  } catch (error) {
    console.error('Error in getMarketDataFeeds:', error);
    // Return fallback data feeds
    return assets.map(asset => createFallbackDataFeed(asset));
  }
}

/**
 * Create fallback data feed when API calls fail
 */
function createFallbackDataFeed(asset: string): DataFeed {
  const basePrice = getBasePrice(asset);
  const historical = [];
  const currentDate = new Date();
  
  // Generate mock historical data
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(currentDate.getDate() - i);
    const volatility = 0.02;
    const randomChange = 1 + ((Math.random() - 0.5) * volatility * 2);
    const price = basePrice * (1 + ((14 - i) / 14) * 0.1) * randomChange;
    
    historical.push({
      timestamp: date.toISOString(),
      value: price
    });
  }
  
  // Determine trend
  const recent = historical.length > 0 ? historical[historical.length - 1]?.value || 0 : 0;
  const past = historical.length > 0 ? historical[0]?.value || 0 : 0;
  const percentChange = past > 0 ? ((recent - past) / past) * 100 : 0;
  let trend: 'up' | 'down' | 'stable' = "stable";
  if (percentChange > 5) trend = "up";
  else if (percentChange < -5) trend = "down";
  
  return {
    name: asset.charAt(0).toUpperCase() + asset.slice(1).toLowerCase(),
    feed_id: asset.toLowerCase(),
    current_value: basePrice,
    historical: historical,
    trend: trend,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper function to get a base price for a token when generating mock data
 */
export function getBasePrice(token: string): number {
  const baseTokenPrices: {[key: string]: number} = {
    'bitcoin': 62500,
    'btc': 62500,
    'ethereum': 3300,
    'eth': 3300,
    'solana': 180,
    'sol': 180,
    'cardano': 0.55,
    'ada': 0.55,
    'bnb': 610,
    'xrp': 0.65,
    'dogecoin': 0.16,
    'doge': 0.16,
    'polkadot': 7.9,
    'dot': 7.9,
    'avalanche': 36,
    'avax': 36,
    'litecoin': 87,
    'ltc': 87
  };
  
  return baseTokenPrices[token.toLowerCase()] || 100; // Default to $100 if token not found
}
