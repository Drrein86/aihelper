'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DailyMenuProps {
  className?: string
  onOpenDetails: (mealType: string) => void
}

export default function DailyMenu({ className = '', onOpenDetails }: DailyMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')

  const meals = {
    breakfast: {
      name: 'ארוחת בוקר',
      icon: '🌅',
      time: '07:00-09:00',
      color: 'from-orange-400 to-yellow-500',
      main: 'שייק פרוטאין עם בננה',
      side: 'טוסט אבוקדו',
      drink: 'קפה שחור',
      calories: 420,
      nutrients: { protein: 25, carbs: 35, fat: 18 }
    },
    lunch: {
      name: 'ארוחת צהריים',
      icon: '☀️',
      time: '12:00-14:00',
      color: 'from-green-400 to-emerald-500',
      main: 'סלט קינואה עם ירקות',
      side: 'חומוס וירקות',
      drink: 'מים עם לימון',
      calories: 520,
      nutrients: { protein: 18, carbs: 45, fat: 22 }
    },
    dinner: {
      name: 'ארוחת ערב',
      icon: '🌙',
      time: '18:00-20:00',
      color: 'from-purple-400 to-indigo-500',
      main: 'סלמון אפוי עם ירקות',
      side: 'אורז חום',
      drink: 'תה ירוק',
      calories: 480,
      nutrients: { protein: 32, carbs: 28, fat: 24 }
    },
    snack: {
      name: 'חטיף',
      icon: '🍎',
      time: '15:00-16:00',
      color: 'from-pink-400 to-rose-500',
      main: 'אגוזים מעורבים',
      side: 'תפוח',
      drink: 'מים',
      calories: 180,
      nutrients: { protein: 6, carbs: 12, fat: 14 }
    }
  }

  useEffect(() => {
    setMounted(true)
    // Auto-select meal based on current time
    const hour = new Date().getHours()
    if (hour < 10) setSelectedMeal('breakfast')
    else if (hour < 15) setSelectedMeal('lunch')
    else if (hour < 17) setSelectedMeal('snack')
    else setSelectedMeal('dinner')
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-pink-100 to-red-100 rounded-lg shadow-lg border-2 border-pink-400 ${className}`}>
        <div className="p-3 text-center text-pink-600">טוען תפריט...</div>
      </div>
    )
  }

  const currentMeal = meals[selectedMeal as keyof typeof meals]
  const totalCalories = Object.values(meals).reduce((sum, meal) => sum + meal.calories, 0)

  return (
    <div className={`bg-gradient-to-br from-pink-100 to-red-100 rounded-lg shadow-lg border-2 border-pink-400 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2 border-b border-pink-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-pink-800 text-lg flex items-center">
            🍽️ תפריט היום
          </h3>
          <div className="text-xs bg-pink-500 text-white px-2 py-1 rounded-full">
            {totalCalories} קלוריות
          </div>
        </div>
      </div>

      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-pink-300 h-full flex flex-col">
          {/* Current Meal Highlight */}
          <motion.div
            key={selectedMeal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-r ${currentMeal.color} rounded p-1 text-white mb-1 flex-1`}
          >
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-sm">{currentMeal.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-xs">{currentMeal.name}</div>
                <div className="text-xs opacity-80">{currentMeal.calories} קלוריות</div>
              </div>
            </div>

            <div className="text-xs">
              🍽️ {currentMeal.main}
            </div>
          </motion.div>

          {/* Meal Quick Selector */}
          <div className="grid grid-cols-4 gap-1 mb-1">
            {Object.entries(meals).map(([key, meal]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedMeal(key)}
                className={`p-0.5 rounded text-xs font-bold transition-all duration-200 ${
                  selectedMeal === key 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-pink-200 text-pink-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-xs">{meal.icon}</div>
              </motion.button>
            ))}
          </div>

          {/* Expand Button */}
          <motion.button
            onClick={() => onOpenDetails(selectedMeal)}
            className="w-full py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-all duration-200 font-bold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 תפריט
          </motion.button>
        </div>
      </div>
    </div>
  )
} 