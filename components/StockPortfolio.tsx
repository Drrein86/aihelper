'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  fetchMultipleStocks, 
  createSamplePortfolio, 
  calculatePortfolioValue,
  formatCurrency,
  convertUSDtoILS,
  StockData,
  PortfolioStock,
  ISRAELI_STOCKS,
  US_TECH_STOCKS
} from '@/services/stocks'

interface StockPortfolioProps {
  className?: string
}

export default function StockPortfolio({ className = '' }: StockPortfolioProps) {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedView, setSelectedView] = useState<'portfolio' | 'watchlist'>('portfolio')
  const [mounted, setMounted] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch data for portfolio stocks and some popular ones
      const symbols = ['AAPL', 'MSFT', 'TEVA', 'CHKP', 'TSLA', 'NVDA', 'GOOGL']
      const stocks = await fetchMultipleStocks(symbols)
      setStockData(stocks)
      
      // Create portfolio with current prices
      const portfolioData = createSamplePortfolio(stocks)
      setPortfolio(portfolioData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    setLastUpdate(new Date())
    fetchData()
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Don't render time until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg border-2 border-green-400 ${className}`}>
        <div className="p-3 border-b border-green-300">
          <h3 className="font-bold text-green-800 text-lg flex items-center">
            📈 תיק מניות חי
            <div className="ml-2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </h3>
        </div>
        <div className="p-3 text-center text-green-600">טוען נתוני מניות...</div>
      </div>
    )
  }

  const portfolioStats = calculatePortfolioValue(portfolio)

  return (
    <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg border-2 border-green-400 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-green-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-green-800 text-lg flex items-center">
            📈 תיק מניות חי
            {loading && (
              <motion.div 
                className="ml-2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedView('portfolio')}
              className={`px-2 py-1 text-xs rounded ${
                selectedView === 'portfolio' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-green-600 hover:bg-green-50'
              }`}
            >
              תיק
            </button>
            <button
              onClick={() => setSelectedView('watchlist')}
              className={`px-2 py-1 text-xs rounded ${
                selectedView === 'watchlist' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-green-600 hover:bg-green-50'
              }`}
            >
              מעקב
            </button>
          </div>
        </div>
        
        <div className="text-xs text-green-600">
          עדכון אחרון: {lastUpdate ? lastUpdate.toLocaleTimeString('he-IL') : 'טוען...'}
        </div>
      </div>

      <div className="p-3">
        <AnimatePresence mode="wait">
          {selectedView === 'portfolio' ? (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Portfolio Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-3 border border-green-300">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-green-600">סך הכל</div>
                    <div className="font-bold text-green-800">
                      {formatCurrency(portfolioStats.totalValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₪{convertUSDtoILS(portfolioStats.totalValue).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-green-600">רווח/הפסד</div>
                    <div className={`font-bold ${portfolioStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(portfolioStats.totalGainLoss)}
                    </div>
                    <div className={`text-xs ${portfolioStats.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {portfolioStats.totalGainLossPercent >= 0 ? '+' : ''}{portfolioStats.totalGainLossPercent.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-green-600">מניות</div>
                    <div className="font-bold text-green-800">{portfolio.length}</div>
                    <div className="text-xs text-gray-500">פעילות</div>
                  </div>
                </div>
              </div>

              {/* Portfolio Holdings */}
              <div className="space-y-2">
                {portfolio.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-green-200 hover:border-green-400 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-gray-800">{stock.symbol}</span>
                          <span className="text-xs text-gray-600 truncate">{stock.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.shares} מניות × {formatCurrency(stock.currentPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-gray-800">
                          {formatCurrency(stock.totalValue)}
                        </div>
                        <div className={`text-xs ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.gainLoss >= 0 ? '+' : ''}{formatCurrency(stock.gainLoss)}
                          <span className="mr-1">
                            ({stock.gainLossPercent >= 0 ? '+' : ''}{stock.gainLossPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Watchlist */}
              <div className="space-y-2">
                <div className="text-sm font-bold text-green-800 mb-2">מניות לעקב 🔍</div>
                {stockData.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-blue-200 hover:border-blue-400 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-gray-800">{stock.symbol}</span>
                          <span className="text-xs text-gray-600 truncate">{stock.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          עדכון: {stock.lastUpdated ? stock.lastUpdated.toLocaleTimeString('he-IL') : 'טוען...'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-gray-800">
                          {formatCurrency(stock.price)}
                        </div>
                        <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
                          <span className="mr-1">
                            ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refresh Button */}
        <motion.button
          onClick={fetchData}
          disabled={loading}
          className="w-full mt-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all duration-200 font-bold disabled:opacity-50"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? '🔄 מעדכן...' : '🔄 עדכן נתונים'}
        </motion.button>
      </div>
    </div>
  )
} 