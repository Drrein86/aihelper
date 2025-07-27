'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeLatestEmails, createEventFromEmail, type EmailAnalysis } from '@/services/gmail-calendar-integration'
import { type GmailMessage } from '@/services/gmail'
import { isAuthenticated } from '@/services/google-auth'

interface GmailCalendarIntegrationProps {
  className?: string
  onEventCreated?: () => void
}

export default function GmailCalendarIntegration({ 
  className = '', 
  onEventCreated 
}: GmailCalendarIntegrationProps) {
  const [emailsWithEvents, setEmailsWithEvents] = useState<Array<GmailMessage & { analysis: EmailAnalysis }>>([])
  const [loading, setLoading] = useState(true)
  const [creatingEvent, setCreatingEvent] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadEmailAnalysis()
  }, [])

  const loadEmailAnalysis = async () => {
    setLoading(true)
    
    try {
      if (isAuthenticated()) {
        const { emailsWithEvents: emails } = await analyzeLatestEmails(10)
        setEmailsWithEvents(emails)
      } else {
        // נתוני fallback עם ניתוח מדומה
        setEmailsWithEvents([])
      }
    } catch (error) {
      console.error('Error loading email analysis:', error)
      setEmailsWithEvents([])
    }
    
    setLoading(false)
  }

  const handleCreateEvent = async (message: GmailMessage) => {
    setCreatingEvent(message.id)
    
    try {
      const success = await createEventFromEmail(message)
      if (success) {
        // הסרת ההודעה מהרשימה כי האירוע כבר נוצר
        setEmailsWithEvents(prev => prev.filter(email => email.id !== message.id))
        onEventCreated?.()
        
        // הצגת הודעת הצלחה
        alert('האירוע נוצר בהצלחה בלוח השנה! 📅')
      } else {
        alert('שגיאה ביצירת האירוע. אנא נסה שוב.')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('שגיאה ביצירת האירוע. אנא נסה שוב.')
    } finally {
      setCreatingEvent(null)
    }
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '👥'
      case 'task': return '✅'
      case 'payment': return '💸'
      case 'work': return '🏢'
      default: return '📅'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700 border-green-300'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    return 'bg-red-100 text-red-700 border-red-300'
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-blue-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-blue-800 text-lg">🤖 אירועים חכמים</h3>
            {emailsWithEvents.length > 0 && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                {emailsWithEvents.length}
              </span>
            )}
          </div>
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all duration-200 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showDetails ? '🔺 הסתר' : '🔻 הצג'}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {emailsWithEvents.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">📧</div>
            <p className="text-gray-600">אין הודעות עם אירועים מוצעים</p>
            <p className="text-gray-500 text-sm">הוודעות החדשות יותר ינותחו אוטומטית</p>
          </div>
        ) : (
          <>
            {/* Quick Preview */}
            {!showDetails && (
              <div className="space-y-2">
                {emailsWithEvents.slice(0, 2).map((email) => (
                  <motion.div
                    key={email.id}
                    className="p-2 bg-white rounded border border-blue-200 hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-blue-800 truncate flex-1">
                        {email.analysis.suggestedEvent?.title}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded border ${getConfidenceColor(email.analysis.confidence)}`}>
                        {Math.round(email.analysis.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>{getEventTypeIcon(email.analysis.suggestedEvent?.type || 'personal')}</span>
                        <span>{formatTimeAgo(email.date)}</span>
                      </div>
                      <motion.button
                        onClick={() => handleCreateEvent(email)}
                        disabled={creatingEvent === email.id}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {creatingEvent === email.id ? '⏳' : '📅+'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {emailsWithEvents.length > 2 && (
                  <p className="text-center text-blue-600 text-sm">
                    +{emailsWithEvents.length - 2} אירועים נוספים
                  </p>
                )}
              </div>
            )}

            {/* Detailed View */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 max-h-96 overflow-y-auto"
                >
                  {emailsWithEvents.map((email) => (
                    <motion.div
                      key={email.id}
                      className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-blue-800 mb-1">
                            {email.subject}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {email.snippet}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded border ${getConfidenceColor(email.analysis.confidence)}`}>
                          {Math.round(email.analysis.confidence * 100)}% ביטחון
                        </span>
                      </div>

                      {email.analysis.suggestedEvent && (
                        <div className="bg-blue-50 rounded p-2 mb-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {getEventTypeIcon(email.analysis.suggestedEvent.type)}
                            </span>
                            <span className="font-medium text-blue-800 text-sm">
                              {email.analysis.suggestedEvent.title}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                            {email.analysis.suggestedEvent.time && (
                              <div>🕐 {email.analysis.suggestedEvent.time}</div>
                            )}
                            {email.analysis.suggestedEvent.date && (
                              <div>📅 {email.analysis.suggestedEvent.date}</div>
                            )}
                            {email.analysis.suggestedEvent.location && (
                              <div className="col-span-2">📍 {email.analysis.suggestedEvent.location}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(email.date)} • {email.from?.split('@')[0]}
                        </span>
                        <motion.button
                          onClick={() => handleCreateEvent(email)}
                          disabled={creatingEvent === email.id}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-bold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {creatingEvent === email.id ? '⏳ יוצר...' : '📅 ליצור אירוע'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
} 