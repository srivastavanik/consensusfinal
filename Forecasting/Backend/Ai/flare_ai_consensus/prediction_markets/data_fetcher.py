# data_fetcher.py
import json
from datetime import datetime
from web3 import Web3, HTTPProvider
import aiohttp
import asyncio

class FTSODataFetcher:
    def __init__(self, network="coston2"):
        """Initialize the FTSO data fetcher with network configuration."""
        self.network = network
        self.ftso_endpoint = self._get_network_endpoint(network)
        self.ftso_address = self._get_ftso_address(network)
        
        # Initialize Web3 (non-async for simpler implementation)
        self.w3 = Web3(HTTPProvider(self.ftso_endpoint))
        
        # Load ABI
        self.abi = self._load_ftso_abi()
        self.ftso_contract = self.w3.eth.contract(address=self.w3.to_checksum_address(self.ftso_address), abi=self.abi)
        
    def _get_network_endpoint(self, network):
        """Get the RPC endpoint for the specified network."""
        endpoints = {
            "coston2": "https://coston2-api.flare.network/ext/C/rpc",
            "flare": "https://flare-api.flare.network/ext/C/rpc",
            "songbird": "https://songbird-api.flare.network/ext/C/rpc"
        }
        return endpoints.get(network, endpoints["coston2"])
    
    def _get_ftso_address(self, network):
        """Get the FTSO contract address for the specified network."""
        addresses = {
            "coston2": "0x3d893C53D9e8056135C26C8c638B76C8b60Df726",
            "flare": "0x7BDE3Df0624114eDB3A67dFe6753e62f4e7c1d20",
            "songbird": "0x767292929c2aAC7A048D68A77776F5E8d447C732"
        }
        return addresses.get(network, addresses["coston2"])
    
    def _load_ftso_abi(self):
        """Load the FTSO contract ABI."""
        # This is a simplified ABI for demonstration
        return [
            {
                "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
                "name": "getFeedById",
                "outputs": [
                    {"internalType": "uint256", "name": "", "type": "uint256"},
                    {"internalType": "int8", "name": "", "type": "int8"},
                    {"internalType": "uint64", "name": "", "type": "uint64"}
                ],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "bytes21[]", "name": "_feedIds", "type": "bytes21[]"}],
                "name": "getFeedsById",
                "outputs": [
                    {"internalType": "uint256[]", "name": "", "type": "uint256[]"},
                    {"internalType": "int8[]", "name": "", "type": "int8[]"},
                    {"internalType": "uint64", "name": "", "type": "uint64"}
                ],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    
    async def fetch_price_feed(self, feed_id, time_range=None):
        """Fetch specific price feed data from FTSO."""
        # For async compatibility, we'll simulate this with asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            lambda: self.ftso_contract.functions.getFeedById(feed_id).call()
        )
        
        return {
            "value": result[0],
            "decimals": result[1],
            "timestamp": result[2],
            "feed_id": feed_id
        }
    
    async def fetch_multiple_feeds(self, feed_ids, time_range=None):
        """Fetch multiple feeds for cross-referencing."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.ftso_contract.functions.getFeedsById(feed_ids).call()
        )
        
        feeds = []
        for i, feed_id in enumerate(feed_ids):
            feeds.append({
                "value": result[0][i],
                "decimals": result[1][i],
                "timestamp": result[2],
                "feed_id": feed_id
            })
        return feeds
    
    async def fetch_external_data(self, api_endpoint, params=None):
        """Fetch additional data from external APIs for more comprehensive analysis."""
        async with aiohttp.ClientSession() as session:
            async with session.get(api_endpoint, params=params) as response:
                if response.status != 200:
                    return {"error": f"API request failed with status {response.status}"}
                return await response.json() 