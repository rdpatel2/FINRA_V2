'use client';

import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Trade } from './types/trade';
import { FinraApi } from './services/api.service'; 

const FinraTradesDashboard = () => {
  // Initialize with empty array
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('date');
  const [filterValue, setFilterValue] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  
  const itemsPerPage = 100;

  useEffect(() => {
    fetchTrades('all');
  }, []);

  const fetchTrades = async (type: string, value: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let data: any; // Use any temporarily to handle potential wrapper objects

      switch(type) {
        case 'all':
          data = await FinraApi.getAll();
          break;
        case 'date':
          data = await FinraApi.getByDate(value);
          break;
        case 'sector':
          data = await FinraApi.getBySector(value);
          break;
        case 'industry':
          data = await FinraApi.getByIndustry(value);
          break;
        case 'symbol':
          data = await FinraApi.getBySymbol(value);
          break;
        default:
          data = await FinraApi.getAll();
      }
      
      // FIX: Check if data is an array or wrapped in an object
      if (Array.isArray(data)) {
        setTrades(data);
      } else if (data && Array.isArray(data.data)) {
        // Handle case where backend returns { data: [...] }
        setTrades(data.data);
      } else if (data && Array.isArray(data.trades)) {
         // Handle case where backend returns { trades: [...] }
         setTrades(data.trades);
      } else {
        console.error("Unexpected API response format:", data);
        setTrades([]); // Fallback to empty array to prevent .slice error
        // Optional: Set a user-friendly error if data is missing
        if (!data) setError('No data received from server');
      }

      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching data');
      setTrades([]); // Ensure trades is empty on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (filterValue.trim()) {
      fetchTrades(filterType, filterValue);
    }
  };

  const handleSymbolSearch = () => {
    if (searchSymbol.trim()) {
      setFilterType('symbol');
      setFilterValue(searchSymbol);
      fetchTrades('symbol', searchSymbol);
    }
  };

  const handleReset = () => {
    setFilterType('date');
    setFilterValue('');
    setSearchSymbol('');
    fetchTrades('all');
  };

  const handleKeyPress = (e: KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      handler();
    }
  };

  // Safe slice calculation
  // We ensure trades is an array, but the extra (trades || []) check adds double safety
  const safeTrades = Array.isArray(trades) ? trades : [];
  const totalPages = Math.ceil(safeTrades.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrades = safeTrades.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FINRA Trade Data</h1>
          <p className="text-gray-600">Real-time short volume and trading data</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search by Symbol
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., AAPL)"
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                  onKeyPress={(e: any) => handleKeyPress(e, handleSymbolSearch)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSymbolSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filter
              </label>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="sector">Sector</option>
                  <option value="industry">Industry</option>
                  <option value="symbol">Symbol</option>
                </select>
                <input
                  type={filterType === 'date' ? 'date' : 'text'}
                  placeholder={`Enter ${filterType}`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyPress={(e: any) => handleKeyPress(e, handleFilter)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleFilter}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Reset to All Data
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-600">
              <p>Error: {error}</p>
            </div>
          ) : safeTrades.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No data found</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} - {Math.min(endIndex, safeTrades.length)} of {safeTrades.length} results
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Short Vol</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vol</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Short %</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Short Z</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vol Z</th>
                    </tr>
                  </thead>
<tbody className="bg-white divide-y divide-gray-200">
  {currentTrades.map((trade: Trade, idx: number) => {
    // 1. Create safe variables that default to 0 if null/undefined
    const shortZ = trade.short_zscore ?? 0;
    const volZ = trade.volume_zscore ?? 0;

    return (
      <tr key={idx} className="hover:bg-gray-50 transition">
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-bold text-blue-600">{trade.symbol}</span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-900">{trade.name}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-600">{trade.sector}</span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600">{trade.industry}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm text-gray-900">{formatNumber(trade.short_volume)}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm text-gray-900">{formatNumber(trade.total_volume)}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className={`text-sm font-medium ${trade.short_pct > 50 ? 'text-red-600' : 'text-green-600'}`}>
            {formatPercent(trade.short_pct)}
          </span>
        </td>
        
        {/* Short Z-Score Column */}
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1">
            {shortZ > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${shortZ > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {shortZ.toFixed(2)}
            </span>
          </div>
        </td>

        {/* Volume Z-Score Column */}
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1">
            {volZ > 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-900">
              {volZ.toFixed(2)}
            </span>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinraTradesDashboard;