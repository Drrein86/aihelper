'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getGmailMessages, getUnreadCount, getUserProfile, generateFallbackGmail, type GmailMessage, type UserProfile } from '@/services/gmail'
import { isAuthenticated } from '@/services/google-auth'
import { getLatestEmailWithAnalysis, createEventFromEmail, type EmailAnalysis } from '@/services/gmail-calendar-integration'

interface GmailWidgetProps {
  className?: string
  onOpenDetails?: (type: string) => void
}

export default function GmailWidget({ className, onOpenDetails }: GmailWidgetProps) {
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [latestEmailAnalysis, setLatestEmailAnalysis] = useState<{
    message: GmailMessage | null
    analysis: EmailAnalysis | null
    canCreateEvent: boolean
  }>({ message: null, analysis: null, canCreateEvent: false })

  useEffect(() => {
    setMounted(true)
    loadGmailData()
  }, [])

  const loadGmailData = async () => {
    setLoading(true)
    
    try {
      if (isAuthenticated()) {
        // טעינת נתונים אמיתיים מ-Gmail
        const [messagesData, unreadData, profileData, latestAnalysis] = await Promise.all([
          getGmailMessages(5),
          getUnreadCount(),
          getUserProfile(),
          getLatestEmailWithAnalysis()
        ])
        
        setMessages(messagesData)
        setUnreadCount(unreadData)
        setUserProfile(profileData)
        setLatestEmailAnalysis(latestAnalysis)
      } else {
        // נתוני fallback
        const fallbackMessages = generateFallbackGmail()
        setMessages(fallbackMessages)
        setUnreadCount(1)
        setUserProfile({
          email: 'demo@example.com',
          name: 'משתמש דמו',
          picture: ''
        })
        // ניתוח fallback של ההודעה הראשונה
        if (fallbackMessages.length > 0) {
          const { analyzeEmailForEvents } = await import('@/services/gmail-calendar-integration')
          const analysis = analyzeEmailForEvents(fallbackMessages[0])
          setLatestEmailAnalysis({
            message: fallbackMessages[0],
            analysis,
            canCreateEvent: analysis.hasEvent && analysis.confidence >= 0.6
          })
        }
      }
    } catch (error) {
      console.error('Error loading Gmail data:', error)
      // נתוני fallback במקרה של שגיאה
      const fallbackMessages = generateFallbackGmail()
      setMessages(fallbackMessages)
      setUnreadCount(1)
      setUserProfile({
        email: 'demo@example.com',
        name: 'משתמש דמו',
        picture: ''
      })
      // ניתוח fallback של ההודעה הראשונה
      if (fallbackMessages.length > 0) {
        try {
          const { analyzeEmailForEvents } = await import('@/services/gmail-calendar-integration')
          const analysis = analyzeEmailForEvents(fallbackMessages[0])
          setLatestEmailAnalysis({
            message: fallbackMessages[0],
            analysis,
            canCreateEvent: analysis.hasEvent && analysis.confidence >= 0.6
          })
        } catch (analysisError) {
          console.error('Error analyzing fallback email:', analysisError)
        }
      }
    }
    
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className={className}>
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-red-300 h-full flex flex-col">
          <div className="animate-pulse bg-gray-200 rounded h-full"></div>
        </div>
      </div>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const messageDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'עכשיו'
    if (diffInHours < 24) return `${diffInHours}ש`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}י`
  }

  const getFromName = (from: string) => {
    // חילוץ שם מכתובת מייל
    const match = from.match(/^(.+?)\s*</)
    return match ? match[1].trim() : from.split('@')[0]
  }

  const handleCreateEventFromEmail = async () => {
    if (!latestEmailAnalysis.message || !latestEmailAnalysis.canCreateEvent) return
    
    try {
      const success = await createEventFromEmail(latestEmailAnalysis.message)
      if (success) {
        // הצגת הודעת הצלחה או רענון הרכיבים
        alert('האירוע נוצר בהצלחה בלוח השנה! 📅')
        // אפשר להוסיף כאן עדכון לעמוד או הצגת הודעה יפה יותר
      } else {
        alert('שגיאה ביצירת האירוע. אנא נסה שוב.')
      }
    } catch (error) {
      console.error('Error creating event from email:', error)
      alert('שגיאה ביצירת האירוע. אנא נסה שוב.')
    }
  }

  return (
    <div className={className}>
      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-red-300 h-full flex flex-col">
          {/* Header with user info */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <div className="text-sm">📧</div>
              <div className="flex-1">
                <div className="font-bold text-xs text-red-800">Gmail</div>
                <div className="text-xs opacity-80">{userProfile?.name || 'משתמש'}</div>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Latest messages preview */}
          <div className="flex-1 mb-1 overflow-hidden">
            {loading ? (
              <div className="text-center py-2">
                <div className="text-xs text-gray-500">טוען...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-2 bg-red-50 rounded">
                <div className="text-xs text-gray-500">אין הודעות</div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.slice(0, 2).map((message, index) => (
                  <div 
                    key={message.id}
                    className={`p-1 rounded text-xs ${
                      !message.read ? 'bg-red-50 border border-red-200 font-bold' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold truncate flex-1">
                        {getFromName(message.from)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(message.date)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {message.snippet}
                    </div>
                  </div>
                ))}
                {messages.length > 2 && (
                  <div className="text-xs text-red-600 text-center">
                    +{messages.length - 2} עוד
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smart Event Suggestion */}
          {latestEmailAnalysis.canCreateEvent && latestEmailAnalysis.analysis?.suggestedEvent && (
            <div className="mb-1 p-1 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-700">🤖 אירוע מוצע</span>
                <span className="text-xs text-green-600">
                  {Math.round(latestEmailAnalysis.analysis.confidence * 100)}% ביטחון
                </span>
              </div>
              <div className="text-blue-600 truncate mb-1">
                📅 {latestEmailAnalysis.analysis.suggestedEvent.title}
              </div>
              {latestEmailAnalysis.analysis.suggestedEvent.time && (
                <div className="text-blue-500 text-xs truncate">
                  🕐 {latestEmailAnalysis.analysis.suggestedEvent.time}
                </div>
              )}
              <motion.button
                onClick={handleCreateEventFromEmail}
                className="w-full mt-1 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all duration-200 font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ➕ ללוח שנה
              </motion.button>
            </div>
          )}

          {/* Expand Button */}
          <motion.button
            onClick={() => onOpenDetails?.('gmail')}
            className="w-full py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all duration-200 font-bold mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 Gmail
          </motion.button>
        </div>
      </div>
    </div>
  )
} 