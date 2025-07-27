'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface FlightPlannerProps {
  className?: string
  onOpenDetails: (type: string) => void
}

export default function FlightPlanner({ className = '', onOpenDetails }: FlightPlannerProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedTab, setSelectedTab] = useState('search')

  const upcomingFlights = [
    {
      id: 1,
      destination: 'ניו יורק',
      flag: '🇺🇸',
      date: '15 דצמבר',
      price: '₪3,200',
      duration: '12 שעות',
      airline: 'אל על',
      deal: 'מחיר מעולה!'
    },
    {
      id: 2,
      destination: 'פריז',
      flag: '🇫🇷',
      date: '22 דצמבר',
      price: '₪2,800',
      duration: '4.5 שעות',
      airline: 'אייר פראנס',
      deal: '15% הנחה'
    }
  ]

  const watchedFlights = [
    {
      destination: 'טוקיו',
      flag: '🇯🇵',
      currentPrice: '₪4,200',
      targetPrice: '₪3,800',
      trend: 'down',
      change: -200
    },
    {
      destination: 'לונדון',
      flag: '🇬🇧',
      currentPrice: '₪2,400',
      targetPrice: '₪2,200',
      trend: 'up',
      change: +150
    }
  ]

  const travelTips = [
    '✈️ הזמן הטוב ביותר להזמנה: 6-8 שבועות מראש',
    '💺 טוסים באמצע השבוע זול יותר',
    '🧳 בדוק משקל המזוודה מראש',
    '📱 הורד את אפליקציית חברת התעופה'
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg shadow-lg border-2 border-sky-400 ${className}`}>
        <div className="p-3 text-center text-sky-600">טוען מתכנן טיסות...</div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg shadow-lg border-2 border-sky-400 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-sky-300">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sky-800 text-lg flex items-center">
            ✈️ מתכנן טיסות
          </h3>
          <motion.button
            onClick={() => onOpenDetails('full-search')}
            className="px-3 py-1 bg-sky-600 text-white text-xs rounded-lg hover:bg-sky-700 transition-all duration-200 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔍 חיפוש מלא
          </motion.button>
        </div>
      </div>

      <div className="p-3">
        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          {[
            { key: 'search', label: 'חיפוש', icon: '🔍' },
            { key: 'watch', label: 'מעקב', icon: '👁️' },
            { key: 'tips', label: 'טיפים', icon: '💡' }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`p-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedTab === tab.key 
                  ? 'bg-sky-500 text-white shadow-md' 
                  : 'bg-sky-200 text-sky-700 hover:bg-sky-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg">{tab.icon}</div>
              <div className="text-xs">{tab.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Content based on selected tab */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'search' && (
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-sky-200">
                <div className="text-sm font-bold text-sky-800 mb-2">🏃‍♂️ טיסות מהירות</div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => onOpenDetails('search-tlv-nyc')}
                    className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-200 text-xs"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>🇺🇸 ניו יורק</div>
                    <div className="text-xs">מ-₪3,200</div>
                  </motion.button>
                  <motion.button
                    onClick={() => onOpenDetails('search-tlv-lon')}
                    className="p-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-200 text-xs"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>🇬🇧 לונדון</div>
                    <div className="text-xs">מ-₪2,400</div>
                  </motion.button>
                </div>
              </div>

              {/* Best Deals */}
              <div className="space-y-2">
                <div className="text-sm font-bold text-sky-800">🔥 מבצעים חמים</div>
                {upcomingFlights.map((flight) => (
                  <motion.div
                    key={flight.id}
                    className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-3 text-white"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onOpenDetails(`flight-${flight.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{flight.flag}</span>
                        <div>
                          <div className="font-bold text-sm">{flight.destination}</div>
                          <div className="text-xs opacity-80">{flight.date} • {flight.duration}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{flight.price}</div>
                        <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {flight.deal}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'watch' && (
            <div className="space-y-3">
              <div className="text-sm font-bold text-sky-800">👁️ מעקב מחירים</div>
              {watchedFlights.map((flight, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-sky-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{flight.flag}</span>
                      <div>
                        <div className="font-bold text-sm text-sky-800">{flight.destination}</div>
                        <div className="text-xs text-sky-600">יעד: {flight.targetPrice}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sky-800">{flight.currentPrice}</div>
                      <div className={`text-xs flex items-center ${
                        flight.trend === 'down' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {flight.trend === 'down' ? '📉' : '📈'} 
                        {flight.change > 0 ? '+' : ''}{flight.change}₪
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <motion.button
                onClick={() => onOpenDetails('add-watch')}
                className="w-full py-2 bg-sky-500 text-white text-xs rounded-lg hover:bg-sky-600 transition-all duration-200 font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ➕ הוסף יעד למעקב
              </motion.button>
            </div>
          )}

          {selectedTab === 'tips' && (
            <div className="space-y-3">
              <div className="text-sm font-bold text-sky-800">💡 טיפים לחיסכון</div>
              <div className="space-y-2">
                {travelTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-sky-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-xs text-sky-700">{tip}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg p-3 text-white">
                <div className="text-sm font-bold mb-1">🎯 אלרט מחיר</div>
                <div className="text-xs mb-2">קבל התראה כשהמחיר יורד ב-10% או יותר</div>
                <motion.button
                  onClick={() => onOpenDetails('price-alert')}
                  className="w-full py-2 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg hover:bg-white/30 transition-all duration-200 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🔔 הפעל התראות
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 