'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Challenge {
  title: string
  description: string
  duration: string
  difficulty: 'קל' | 'בינוני' | 'קשה'
  category: string
  color: string
  icon: string
  progress?: number
}

interface DailyChallengesProps {
  className?: string
  onOpenDetails?: (type: string) => void
}

export default function DailyChallenges({ className, onOpenDetails }: DailyChallengesProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  // אתגרים סטטיים כ-fallback
  const fallbackChallenges: Challenge[] = [
    {
      title: "2 ליטר מים ביום",
      description: "שתה 2 ליטר מים מדי יום למשך חודש",
      duration: "30 ימים",
      difficulty: "קל",
      category: "בריאות",
      color: "from-blue-400 to-cyan-500",
      icon: "💧",
      progress: 45
    },
    {
      title: "5 אימונים בשבוע",
      description: "התאמן 5 פעמים בשבוע למשך חודש",
      duration: "4 שבועות",
      difficulty: "בינוני",
      category: "כושר",
      color: "from-green-400 to-emerald-500",
      icon: "💪",
      progress: 60
    },
    {
      title: "קריאת 20 דקות ביום",
      description: "קרא ספר 20 דקות מדי יום",
      duration: "21 ימים",
      difficulty: "קל",
      category: "השכלה",
      color: "from-purple-400 to-violet-500",
      icon: "📚",
      progress: 75
    },
    {
      title: "מדיטציה של 10 דקות",
      description: "תרגל מדיטציה 10 דקות מדי יום",
      duration: "14 ימים",
      difficulty: "בינוני",
      category: "מנטלי",
      color: "from-pink-400 to-rose-500",
      icon: "🧘",
      progress: 30
    },
    {
      title: "10,000 צעדים ביום",
      description: "צעד 10,000 צעדים מדי יום",
      duration: "30 ימים",
      difficulty: "בינוני",
      category: "פעילות",
      color: "from-orange-400 to-red-500",
      icon: "🚶",
      progress: 50
    }
  ]

  useEffect(() => {
    setMounted(true)
    loadChallenges()
  }, [])

  useEffect(() => {
    if (challenges.length > 0) {
      const interval = setInterval(() => {
        setCurrentChallenge((prev) => (prev + 1) % challenges.length)
      }, 15000) // החלפה כל 15 שניות

      return () => clearInterval(interval)
    }
  }, [challenges])

  const loadChallenges = async () => {
    try {
      // ניסיון לקבל אתגרים מ-GPT
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'תן לי 5 אתגרים יומיים/שבועיים/חודשיים למשפר חיים בפורמט JSON: [{"title": "שם האתגר", "description": "תיאור קצר", "duration": "זמן", "difficulty": "קל/בינוני/קשה", "category": "קטגוריה"}]',
          conversationHistory: [
            {
              role: 'system',
              content: 'אתה מומחה ליצירת אתגרים יומיים מוטיבציוניים. החזר רק JSON array עם 5 אתגרים בעברית.'
            }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        try {
          // ניסיון לפרס JSON מתוך התגובה
          let challengesData = []
          if (data.content) {
            challengesData = JSON.parse(data.content)
          } else if (data.message) {
            challengesData = JSON.parse(data.message)
          } else if (typeof data === 'string') {
            challengesData = JSON.parse(data)
          }
          
          if (Array.isArray(challengesData) && challengesData.length > 0) {
            const processedChallenges = challengesData.map((challenge: any, index: number) => ({
              ...challenge,
              color: fallbackChallenges[index % fallbackChallenges.length].color,
              icon: fallbackChallenges[index % fallbackChallenges.length].icon,
              progress: Math.floor(Math.random() * 80) + 10 // התקדמות רנדומלית
            }))
            setChallenges(processedChallenges)
            setLoading(false)
            return
          }
        } catch (e) {
          console.log('Failed to parse challenges from GPT, using fallback:', e)
        }
      }
    } catch (error) {
      console.log('Failed to load challenges from GPT, using fallback')
    }

    // Fallback לאתגרים סטטיים
    setChallenges(fallbackChallenges)
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className={className}>
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-orange-300 h-full flex flex-col">
          <div className="animate-pulse bg-gray-200 rounded h-full"></div>
        </div>
      </div>
    )
  }

  const current = challenges[currentChallenge] || fallbackChallenges[0]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'קל': return 'bg-green-500'
      case 'בינוני': return 'bg-yellow-500'
      case 'קשה': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={className}>
      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-orange-300 h-full flex flex-col">
          <motion.div
            key={currentChallenge}
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
                <div className="text-xs opacity-80">{current.duration}</div>
              </div>
            </div>

            {/* Brief Description */}
            <div className="text-xs opacity-90 mb-1 flex-1">
              {current.description.substring(0, 30)}...
            </div>

            {/* Progress & Difficulty */}
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className={`px-1 py-0.5 rounded text-xs font-bold ${getDifficultyColor(current.difficulty)}`}>
                  {current.difficulty}
                </span>
              </div>
              <div className="text-xs opacity-80">
                {current.progress}%
              </div>
            </div>
          </motion.div>

          {/* Navigation & Expand */}
          <div className="flex space-x-1 mt-1">
            <motion.button
              onClick={() => setCurrentChallenge((prev) => (prev + 1) % challenges.length)}
              className="px-1 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➡️
            </motion.button>
            <motion.button
              onClick={() => onOpenDetails?.('challenges')}
              className="flex-1 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-all duration-200 font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔍 אתגרים
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
} 