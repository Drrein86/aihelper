'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  fetchMultipleStocks, 
  createSamplePortfolio, 
  calculatePortfolioValue,
  formatCurrency,
  convertUSDtoILS,
  StockData,
  PortfolioStock
} from '@/services/stocks'

interface StockSummaryProps {
  className?: string
  onOpenAdvisor: () => void
}

export default function StockSummary({ className = '', onOpenAdvisor }: StockSummaryProps) {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Top 3 selected stocks for main page
  const selectedStocks = ['AAPL', 'MSFT', 'TSLA']

  const fetchData = async () => {
    setLoading(true)
    try {
      const stocks = await fetchMultipleStocks(selectedStocks)
      const portfolioData = createSamplePortfolio(stocks)
      setPortfolio(portfolioData.slice(0, 3)) // Only top 3 for main page
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg border-2 border-green-400 ${className}`}>
        <div className="p-3 text-center text-green-600">טוען נתוני מניות...</div>
      </div>
    )
  }

  const portfolioStats = calculatePortfolioValue(portfolio)
  const todayRecommendation = {
    stock: 'NVDA',
    reason: 'עלייה צפויה של 8% בעקבות השקת מוצר AI חדש',
    confidence: 85
  }

  return (
    <div className={`bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg border-2 border-green-400 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2 border-b border-green-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-green-800 text-lg flex items-center">
            📈 תיק המניות שלי
            {loading && (
              <div className="ml-2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            )}
          </h3>
          <motion.button
            onClick={onOpenAdvisor}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all duration-200 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🧠 יועץ פיננסי
          </motion.button>
        </div>
      </div>

      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-green-300 h-full flex flex-col">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-1 text-center mb-1">
            <div>
              <div className="text-xs text-green-600">{formatCurrency(portfolioStats.totalValue)}</div>
            </div>
            <div>
              <div className={`text-xs font-bold ${portfolioStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioStats.totalGainLossPercent >= 0 ? '+' : ''}{portfolioStats.totalGainLossPercent.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Top Stock */}
          {portfolio.length > 0 && (
            <div className="bg-green-50 rounded p-1 mb-1 text-center">
              <div className="text-xs font-bold">{portfolio[0].symbol}</div>
              <div className={`text-xs ${portfolio[0].gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolio[0].gainLoss >= 0 ? '+' : ''}{formatCurrency(portfolio[0].gainLoss)}
              </div>
            </div>
          )}

          {/* Expand Button */}
          <motion.button
            onClick={onOpenAdvisor}
            className="w-full py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-all duration-200 font-bold mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 מניות
          </motion.button>
        </div>
      </div>
    </div>
  )
} 