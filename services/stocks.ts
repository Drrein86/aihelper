// Stock Market API Service
export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  lastUpdated: Date
}

export interface PortfolioStock {
  symbol: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
const BASE_URL = 'https://www.alphavantage.co/query'

// Israeli stocks symbols for demonstration
export const ISRAELI_STOCKS = [
  { symbol: 'TEVA', name: 'טבע תעשיות פרמצבטיות' },
  { symbol: 'ICL', name: 'כימיקלים לישראל' },
  { symbol: 'CHKP', name: 'צ\'ק פוינט' },
  { symbol: 'NICE', name: 'נייס מערכות' }
]

// US Tech stocks for demonstration
export const US_TECH_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' }
]

export async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data['Error Message'] || data['Note']) {
      console.warn(`API limit or error for ${symbol}:`, data)
      return generateFallbackStockData(symbol)
    }
    
    const quote = data['Global Quote']
    if (!quote) {
      return generateFallbackStockData(symbol)
    }
    
    const stockName = [...ISRAELI_STOCKS, ...US_TECH_STOCKS].find(s => s.symbol === symbol)?.name || symbol
    
    return {
      symbol,
      name: stockName,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      currency: 'USD',
      lastUpdated: new Date(quote['07. latest trading day'])
    }
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error)
    return generateFallbackStockData(symbol)
  }
}

export async function fetchMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const promises = symbols.map(symbol => fetchStockData(symbol))
  const results = await Promise.all(promises)
  return results.filter(stock => stock !== null) as StockData[]
}

// Fallback data generator for when API is unavailable
function generateFallbackStockData(symbol: string): StockData {
  const stockInfo = [...ISRAELI_STOCKS, ...US_TECH_STOCKS].find(s => s.symbol === symbol)
  
  // Generate realistic-looking data
  const basePrice = {
    'TEVA': 12.5,
    'ICL': 8.2,
    'CHKP': 145.3,
    'NICE': 215.7,
    'AAPL': 175.2,
    'MSFT': 378.9,
    'GOOGL': 2625.4,
    'TSLA': 248.5,
    'NVDA': 485.3,
    'AMZN': 142.8
  }[symbol] || 100
  
  const randomChange = (Math.random() - 0.5) * 10 // -5% to +5%
  const price = basePrice + (basePrice * randomChange / 100)
  const change = price - basePrice
  const changePercent = (change / basePrice) * 100
  
  return {
    symbol,
    name: stockInfo?.name || symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    currency: 'USD',
    lastUpdated: new Date()
  }
}

export function calculatePortfolioValue(stocks: PortfolioStock[]): {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
} {
  const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0)
  const totalInvested = stocks.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0)
  const totalGainLoss = totalValue - totalInvested
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
  
  return {
    totalValue,
    totalGainLoss,
    totalGainLossPercent
  }
}

// Create sample portfolio with real symbols
export function createSamplePortfolio(currentPrices: StockData[]): PortfolioStock[] {
  const portfolioData = [
    { symbol: 'AAPL', shares: 10, avgPrice: 160 },
    { symbol: 'MSFT', shares: 5, avgPrice: 350 },
    { symbol: 'TEVA', shares: 100, avgPrice: 10 },
    { symbol: 'CHKP', shares: 7, avgPrice: 140 },
    { symbol: 'TSLA', shares: 3, avgPrice: 200 }
  ]
  
  return portfolioData.map(item => {
    const currentStock = currentPrices.find(s => s.symbol === item.symbol)
    const currentPrice = currentStock?.price || item.avgPrice
    const totalValue = item.shares * currentPrice
    const totalInvested = item.shares * item.avgPrice
    const gainLoss = totalValue - totalInvested
    const gainLossPercent = (gainLoss / totalInvested) * 100
    
    return {
      ...item,
      name: currentStock?.name || item.symbol,
      currentPrice,
      totalValue,
      gainLoss,
      gainLossPercent
    }
  })
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'ILS') {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Convert USD to ILS (approximate rate)
export function convertUSDtoILS(usdAmount: number): number {
  const exchangeRate = 3.7 // Approximate USD to ILS rate
  return usdAmount * exchangeRate
} 