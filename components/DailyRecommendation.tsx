'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

interface DailyRecommendationProps {
  className?: string
  onOpenDetails: (type: string) => void
}

export default function DailyRecommendation({ className = '', onOpenDetails }: DailyRecommendationProps) {
  const [mounted, setMounted] = useState(false)
  const [currentRecommendation, setCurrentRecommendation] = useState(0)

  const recommendations = [
    {
      id: 'weather-activity',
      type: 'פעילות',
      icon: '🌤️',
      title: 'יום מושלם לטיול',
      description: 'מזג האוויר מושלם היום - טמפרטורה של 24°, נסה להקדיש זמן לטיול קצר בפארק',
      action: 'תכנן טיול',
      color: 'from-blue-400 to-cyan-500',
      confidence: 92
    },
    {
      id: 'food-suggestion',
      type: 'אוכל',
      icon: '🍜',
      title: 'המלצת שף היום',
      description: 'בהתבסס על העדפותיך - תבשיל עדשים כתומות עם קוקוס וכורכום. בריא וטעים!',
      action: 'קבל מתכון',
      color: 'from-orange-400 to-red-500',
      confidence: 88
    },
    {
      id: 'productivity',
      type: 'פרודקטיביות',
      icon: '⚡',
      title: 'שעת השיא שלך',
      description: 'השעה 10:00-12:00 היא זמן הפרודקטיביות הגבוה שלך. תכנן משימות חשובות לזמן הזה',
      action: 'תכנן יום',
      color: 'from-green-400 to-emerald-500',
      confidence: 95
    },
    {
      id: 'social',
      type: 'חברתי',
      icon: '👥',
      title: 'זמן לחברים',
      description: 'לא דיברת עם רועי כבר 3 ימים. אולי כדאי לשלוח הודעה או לתכנן פגישה?',
      action: 'שלח הודעה',
      color: 'from-purple-400 to-pink-500',
      confidence: 85
    }
  ]

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentRecommendation((prev) => (prev + 1) % recommendations.length)
    }, 8000) // Change every 8 seconds
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-lg border-2 border-yellow-400 ${className}`}>
        <div className="p-3 text-center text-yellow-600">טוען המלצות...</div>
      </div>
    )
  }

  const current = recommendations[currentRecommendation]

  return (
    <div className={`bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-lg border-2 border-yellow-400 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2 border-b border-yellow-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-yellow-800 text-lg flex items-center">
            💡 המלצת היום
          </h3>
          <div className="flex space-x-1">
            {recommendations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentRecommendation ? 'bg-yellow-600' : 'bg-yellow-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-yellow-300 h-full flex flex-col">
          <motion.div
            key={currentRecommendation}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-r ${current.color} rounded p-1 text-white flex-1 flex flex-col`}
          >
            {/* Icon & Title */}
            <div className="flex items-center space-x-1 mb-1">
              <div className="text-sm">{current.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-xs">{current.title}</div>
                <div className="text-xs opacity-80">{current.confidence}%</div>
              </div>
            </div>

            {/* Brief Description */}
            <div className="text-xs opacity-90 flex-1">
              {current.description.substring(0, 30)}...
            </div>
          </motion.div>

          {/* Navigation & Expand */}
          <div className="flex space-x-1 mt-1">
            <motion.button
              onClick={() => setCurrentRecommendation((prev) => (prev + 1) % recommendations.length)}
              className="px-1 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➡️
            </motion.button>
            <motion.button
              onClick={() => onOpenDetails(current.type)}
              className="flex-1 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-all duration-200 font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔍 המלצה
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
} 