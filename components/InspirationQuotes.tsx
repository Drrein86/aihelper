'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Quote {
  text: string
  author: string
  category: string
  color: string
  icon: string
}

interface InspirationQuotesProps {
  className?: string
  onOpenDetails?: (type: string) => void
}

export default function InspirationQuotes({ className, onOpenDetails }: InspirationQuotesProps) {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  // משפטי השראה סטטיים כ-fallback
  const fallbackQuotes: Quote[] = [
    {
      text: "האושר נמצא בדברים הקטנים שאנחנו עושים כל יום",
      author: "שמואל יוסף עגנון",
      category: "אושר",
      color: "from-pink-400 to-rose-500",
      icon: "✨"
    },
    {
      text: "כל מסע של אלף קילומטר מתחיל בצעד אחד",
      author: "לאו טסה",
      category: "התחלה",
      color: "from-blue-400 to-indigo-500",
      icon: "🚀"
    },
    {
      text: "הדרך להתחיל היא להפסיק לדבר ולהתחיל לעשות",
      author: "וולט דיסני",
      category: "פעולה",
      color: "from-green-400 to-emerald-500",
      icon: "⚡"
    },
    {
      text: "אתה לא יכול לחזור אחורה ולשנות את ההתחלה, אבל אתה יכול להתחיל מחדש",
      author: "סי.ס לואיס",
      category: "התחדשות",
      color: "from-purple-400 to-violet-500",
      icon: "🌟"
    },
    {
      text: "הדבר היחיד שעומד בינך לבין החלום שלך הוא הרצון לנסות",
      author: "ג'ואל בראון",
      category: "חלומות",
      color: "from-orange-400 to-red-500",
      icon: "💫"
    }
  ]

  useEffect(() => {
    setMounted(true)
    loadQuotes()
  }, [])

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length)
      }, 12000) // החלפה כל 12 שניות

      return () => clearInterval(interval)
    }
  }, [quotes])

  const loadQuotes = async () => {
    try {
      // ניסיון לקבל ציטוטים מ-GPT
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'תן לי 5 משפטי השראה קצרים בעברית בפורמט JSON: [{"text": "הטקסט", "author": "השם", "category": "הקטגוריה"}]',
          conversationHistory: [
            {
              role: 'system',
              content: 'אתה מומחה למשפטי השראה. החזר רק JSON array עם 5 ציטוטים בעברית.'
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        try {
          // ניסיון לפרס JSON מתוך התגובה
          let quotesData = []
          if (data.content) {
            quotesData = JSON.parse(data.content)
          } else if (data.message) {
            quotesData = JSON.parse(data.message)
          } else if (typeof data === 'string') {
            quotesData = JSON.parse(data)
          }
          
          if (Array.isArray(quotesData) && quotesData.length > 0) {
            const processedQuotes = quotesData.map((quote: any, index: number) => ({
              ...quote,
              color: fallbackQuotes[index % fallbackQuotes.length].color,
              icon: fallbackQuotes[index % fallbackQuotes.length].icon
            }))
            setQuotes(processedQuotes)
            setLoading(false)
            return
          }
        } catch (e) {
          console.log('Failed to parse quotes from GPT, using fallback:', e)
        }
      }
    } catch (error) {
      console.log('Failed to load quotes from GPT, using fallback')
    }

    // Fallback למשפטים סטטיים
    setQuotes(fallbackQuotes)
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className={className}>
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-pink-300 h-full flex flex-col">
          <div className="animate-pulse bg-gray-200 rounded h-full"></div>
        </div>
      </div>
    )
  }

  const current = quotes[currentQuote] || fallbackQuotes[0]

  return (
    <div className={className}>
      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-pink-300 h-full flex flex-col">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-r ${current.color} rounded p-1 text-white flex-1 flex flex-col`}
          >
            {/* Icon & Category */}
            <div className="flex items-center space-x-1 mb-1">
              <div className="text-sm">{current.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-xs">{current.category}</div>
                <div className="text-xs opacity-80">{current.author}</div>
              </div>
            </div>

            {/* Quote Text */}
            <div className="text-xs opacity-90 flex-1 text-center">
              "{current.text.substring(0, 35)}..."
            </div>
          </motion.div>

          {/* Navigation & Expand */}
          <div className="flex space-x-1 mt-1">
            <motion.button
              onClick={() => setCurrentQuote((prev) => (prev + 1) % quotes.length)}
              className="px-1 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➡️
            </motion.button>
            <motion.button
              onClick={() => onOpenDetails?.('inspiration')}
              className="flex-1 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-all duration-200 font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔍 השראה
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
} 