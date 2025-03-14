"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ftsoApi, FTSOFeed } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

type SortBy = 'name' | 'price' | 'change';
type SortOrder = 'asc' | 'desc';
type FilterOption = 'all' | 'up' | 'down';

export interface DataFeedDisplayProps {
  predictionData: any;
}

export default function DataFeedDisplay({ predictionData }: DataFeedDisplayProps) {
  const [feeds, setFeeds] = useState<FTSOFeed[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<FTSOFeed[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<FTSOFeed | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 1 minute default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Function to fetch all FTSO feeds
  const fetchFeeds = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ftsoApi.getAllFeeds();
      setFeeds(data);
      setLastUpdated(new Date());

      // Select the first feed by default if none is selected
      if (!selectedFeed && data.length > 0) {
        setSelectedFeed(data[0]);
      } else if (selectedFeed) {
        // Update the selected feed with fresh data
        const updatedSelectedFeed = data.find(feed => feed.id === selectedFeed.id);
        if (updatedSelectedFeed) {
          setSelectedFeed(updatedSelectedFeed);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching FTSO feeds:', err);
      setError('Failed to load FTSO data feeds. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFeed]);

  // Apply sorting and filtering to feeds
  useEffect(() => {
    let result = [...feeds];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(feed => 
        feed.name.toLowerCase().includes(query) || feed.id.toLowerCase().includes(query)
      );
    }

    // Apply trend filter
    if (filterOption !== 'all') {
      result = result.filter(feed => {
        const isUp = feed.change_24h >= 0;
        return filterOption === 'up' ? isUp : !isUp;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'price':
          compareResult = a.current_price - b.current_price;
          break;
        case 'change':
          compareResult = a.change_24h - b.change_24h;
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    setFilteredFeeds(result);
  }, [feeds, sortBy, sortOrder, filterOption, searchQuery]);

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    fetchFeeds();

    // Set up auto-refresh
    if (autoRefresh) {
      const newIntervalId = setInterval(fetchFeeds, refreshInterval);
      setIntervalId(newIntervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [fetchFeeds, refreshInterval, autoRefresh]);

  // Handle auto-refresh toggle
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      // Turn off auto-refresh
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      // Turn on auto-refresh
      const newIntervalId = setInterval(fetchFeeds, refreshInterval);
      setIntervalId(newIntervalId);
    }

    setAutoRefresh(!autoRefresh);
  };

  // Handle refresh interval change
  const handleRefreshIntervalChange = (e: { target: { value: string } }) => {
    const newInterval = parseInt(e.target.value, 10);
    setRefreshInterval(newInterval);

    // Reset the interval with the new value
    if (autoRefresh && intervalId) {
      clearInterval(intervalId);
      const newIntervalId = setInterval(fetchFeeds, newInterval);
      setIntervalId(newIntervalId);
    }
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchFeeds();
  };

  // Handle sort change
  const handleSortChange = (newSortBy: SortBy) => {
    // If clicking the same column, toggle the order
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different column, set it as the new sort column and default to ascending
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Prepare chart data for the selected feed
  const chartData = selectedFeed ? {
    labels: selectedFeed.historical_data.map(data => new Date(data.timestamp)),
    datasets: [
      {
        label: selectedFeed.name,
        data: selectedFeed.historical_data.map(data => data.price),
        borderColor: selectedFeed.change_24h >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        backgroundColor: selectedFeed.change_24h >= 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          displayFormats: {
            hour: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedFeed ? `${selectedFeed.name} Price Trend` : 'Price Trend',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  if (isLoading && feeds.length === 0) {
    return <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20">Loading FTSO data feeds...</div>;
  }

  if (error && feeds.length === 0) {
    return <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-secondary/30 rounded-xl border border-primary/20">
      <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center">
        <h2 className="text-xl font-bold">FTSO Data Feeds</h2>

        <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
          <div className="flex items-center space-x-2 text-sm">
            <span>Auto Refresh:</span>
            <button 
              onClick={toggleAutoRefresh}
              className={`px-2 py-1 rounded ${autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span>Interval:</span>
            <select 
              value={refreshInterval} 
              onChange={handleRefreshIntervalChange}
              className="px-2 py-1 rounded border"
              disabled={!autoRefresh}
            >
              <option value={5000}>5 sec</option>
              <option value={15000}>15 sec</option>
              <option value={30000}>30 sec</option>
              <option value={60000}>1 min</option>
              <option value={300000}>5 min</option>
            </select>
          </div>

          <button 
            onClick={handleManualRefresh} 
            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
          >
            Refresh Now
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Filtering and Search Controls */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e: { target: { value: string } }) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex space-x-2">
          <select
            value={filterOption}
            onChange={(e: { target: { value: string } }) => setFilterOption(e.target.value as FilterOption)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Trends</option>
            <option value="up">Up Only</option>
            <option value="down">Down Only</option>
          </select>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-md overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => handleSortChange('name')}
              >
                Feed Name
                {sortBy === 'name' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="p-3 text-right cursor-pointer hover:bg-gray-200"
                onClick={() => handleSortChange('price')}
              >
                Current Price
                {sortBy === 'price' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="p-3 text-right cursor-pointer hover:bg-gray-200"
                onClick={() => handleSortChange('change')}
              >
                24h Change
                {sortBy === 'change' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeeds.length > 0 ? (
              filteredFeeds.map((feed) => (
                <tr 
                  key={feed.id} 
                  className={`border-t hover:bg-gray-50 ${selectedFeed?.id === feed.id ? 'bg-gray-100' : ''}`}
                >
                  <td className="p-3">{feed.name}</td>
                  <td className="p-3 text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: feed.current_price < 1 ? 4 : 2,
                    }).format(feed.current_price)}
                  </td>
                  <td className={`p-3 text-right ${feed.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {feed.change_24h >= 0 ? '+' : ''}{feed.change_24h.toFixed(2)}%
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedFeed(feed)}
                      className={`px-3 py-1 rounded ${selectedFeed?.id === feed.id ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No feeds found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedFeed && (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{selectedFeed.name} Details</h3>
            <div className={`px-3 py-1 rounded-full text-sm ${selectedFeed.change_24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {selectedFeed.change_24h >= 0 ? 'Trending Up' : 'Trending Down'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 mb-1">Current Price</p>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: selectedFeed.current_price < 1 ? 4 : 2,
                }).format(selectedFeed.current_price)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 mb-1">Previous Price</p>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: selectedFeed.previous_price < 1 ? 4 : 2,
                }).format(selectedFeed.previous_price)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500 mb-1">24h Change</p>
              <p className={`text-xl font-bold ${selectedFeed.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedFeed.change_24h >= 0 ? '+' : ''}{selectedFeed.change_24h.toFixed(2)}%
              </p>
            </div>
          </div>

          {chartData && (
            <div className="h-64 md:h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Feed ID: {selectedFeed.id}<br />
            Last Updated: {new Date(selectedFeed.updated_at).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
