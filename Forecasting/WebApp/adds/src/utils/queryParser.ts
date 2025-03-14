/**
 * Utility functions for parsing prediction market queries
 */

/**
 * Extract cryptocurrency/asset names from a user query
 * @param query The user's question/query
 * @returns Array of identified asset names
 */
export function extractAssetsFromQuery(query: string): string[] {
  const assets: string[] = [];
  const normalizedQuery = query.toLowerCase();
  
  // Common cryptocurrency and asset names to look for
  const commonAssets = [
    "bitcoin", "btc",
    "ethereum", "eth",
    "solana", "sol",
    "cardano", "ada",
    "binance coin", "bnb",
    "ripple", "xrp",
    "dogecoin", "doge",
    "polkadot", "dot",
    "avalanche", "avax",
    "litecoin", "ltc",
    "chainlink", "link",
    "polygon", "matic",
    "uniswap", "uni",
    "stellar", "xlm",
    "cosmos", "atom",
    "near protocol", "near",
    "algorand", "algo",
    "tron", "trx",
    "s&p 500", "nasdaq", "dow jones", "dji",
    "gold", "silver", "crude oil", "natural gas",
    "tesla", "apple", "microsoft", "amazon", "google", "meta"
  ];
  
  // Check for each asset
  for (const asset of commonAssets) {
    if (normalizedQuery.includes(asset)) {
      // For symbols, make sure they're not part of another word
      if (asset.length <= 4) { // likely a symbol
        const regex = new RegExp(`\\b${asset}\\b`, 'i');
        if (regex.test(normalizedQuery)) {
          // Map symbols to full names for consistency
          const fullName = mapSymbolToName(asset.toLowerCase());
          if (!assets.includes(fullName)) {
            assets.push(fullName);
          }
        }
      } else {
        const fullName = mapSymbolToName(asset.toLowerCase());
        if (!assets.includes(fullName)) {
          assets.push(fullName);
        }
      }
    }
  }
  
  return assets;
}

/**
 * Map cryptocurrency symbols to their full names
 * @param symbol Cryptocurrency symbol or name
 * @returns Standardized full name
 */
function mapSymbolToName(symbol: string): string {
  const symbolMap: {[key: string]: string} = {
    'btc': 'Bitcoin',
    'bitcoin': 'Bitcoin',
    'eth': 'Ethereum',
    'ethereum': 'Ethereum',
    'sol': 'Solana',
    'solana': 'Solana',
    'ada': 'Cardano',
    'cardano': 'Cardano',
    'bnb': 'BNB',
    'binance coin': 'BNB',
    'xrp': 'XRP',
    'ripple': 'XRP',
    'doge': 'Dogecoin',
    'dogecoin': 'Dogecoin',
    'dot': 'Polkadot',
    'polkadot': 'Polkadot',
    'avax': 'Avalanche',
    'avalanche': 'Avalanche',
    'ltc': 'Litecoin',
    'litecoin': 'Litecoin',
    'link': 'Chainlink',
    'chainlink': 'Chainlink',
    'matic': 'Polygon',
    'polygon': 'Polygon',
    'uni': 'Uniswap',
    'uniswap': 'Uniswap',
    'xlm': 'Stellar',
    'stellar': 'Stellar',
    'atom': 'Cosmos',
    'cosmos': 'Cosmos',
    'near': 'NEAR Protocol',
    'near protocol': 'NEAR Protocol',
    'algo': 'Algorand',
    'algorand': 'Algorand',
    'trx': 'TRON',
    'tron': 'TRON',
    'nasdaq': 'NASDAQ',
    's&p 500': 'S&P 500',
    'dow jones': 'Dow Jones',
    'dji': 'Dow Jones',
    'gold': 'Gold',
    'silver': 'Silver',
    'crude oil': 'Crude Oil',
    'natural gas': 'Natural Gas',
    'tesla': 'Tesla',
    'apple': 'Apple',
    'microsoft': 'Microsoft',
    'amazon': 'Amazon',
    'google': 'Google',
    'meta': 'Meta'
  };
  
  return symbolMap[symbol] || symbol.charAt(0).toUpperCase() + symbol.slice(1);
}
