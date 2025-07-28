'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { sendChatMessage, analyzeUserIntent } from '@/services/openai'
import { getLatestEmailWithAnalysis } from '@/services/gmail-calendar-integration'
import LoadingSpinner from './LoadingSpinner'
import { Icons } from './ui/Icons'

interface ChatBotProps {
  embedded?: boolean
  fullHeight?: boolean
}

export default function ChatBot({ embedded = false, fullHeight = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get data from store
  const { 
    chatMessages, 
    addChatMessage, 
    user, 
    tasks, 
    events, 
    financial, 
    notifications,
    addNotification
  } = useStore()
  
  // Create conversation history for OpenAI
  const conversationHistory = chatMessages.slice(1).map(msg => ({
    role: msg.isUser ? 'user' as const : 'assistant' as const,
    content: msg.text
  }))

  const quickSuggestions = [
    { text: 'מה אני צריך לעשות היום?', emoji: '📅', color: 'text-blue-400' },
    { text: 'מה המצב הכספי והשקעות?', emoji: '💰', color: 'text-green-400' },
    { text: 'הראה לי את המשימות שלי', emoji: '✅', color: 'text-purple-400' },
    { text: 'מתי הפגישה הבאה?', emoji: '⏰', color: 'text-orange-400' },
    { text: 'הזכר לי להתקשר לאמא', emoji: '📞', color: 'text-pink-400' },
    { text: 'מה עם אימון ובריאות?', emoji: '💪', color: 'text-red-400' },
    { text: 'תציע לי רעיון לארוחת ערב', emoji: '🍽️', color: 'text-yellow-400' },
    { text: 'איך מזג האוויר היום?', emoji: '🌤️', color: 'text-cyan-400' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    // Add user message to store
    addChatMessage({
      text: currentMessage,
      isUser: true
    })

    const userMessage = currentMessage
    setCurrentMessage('')
    setIsTyping(true)
    setShowSuggestions(false)

    try {
      // Analyze user intent
      const intent = analyzeUserIntent(userMessage)
      
      // Get latest Gmail data
      const gmailAnalysis = await getLatestEmailWithAnalysis()
      
      // Prepare user data for AI
      const userData = {
        tasks,
        events,
        financial,
        notifications,
        userName: user.name,
        gmail: {
          latestMessage: gmailAnalysis.message ? {
            subject: gmailAnalysis.message.subject,
            from: gmailAnalysis.message.from,
            snippet: gmailAnalysis.message.snippet,
            date: gmailAnalysis.message.date
          } : undefined,
          suggestedEvent: gmailAnalysis.analysis?.suggestedEvent ? {
            title: gmailAnalysis.analysis.suggestedEvent.title,
            confidence: gmailAnalysis.analysis.confidence,
            time: gmailAnalysis.analysis.suggestedEvent.time,
            date: gmailAnalysis.analysis.suggestedEvent.date,
            type: gmailAnalysis.analysis.suggestedEvent.type
          } : undefined,
          unreadCount: 0
        }
      }
      
      // Send message to AI service
      const aiResponse = await sendChatMessage(userMessage, userData, conversationHistory)
      
      // Add AI response to store
      addChatMessage({
        text: aiResponse,
        isUser: false
      })

      // If user intent suggests actions, add helpful notification
      if (intent.confidence > 0.5 && intent.suggestedActions) {
        addNotification({
          title: 'פעולות מוצעות',
          message: `זוהה כוונה: ${intent.intent}. פעולות אפשריות: ${intent.suggestedActions.join(', ')}`,
          type: 'info',
          read: false
        })
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      addChatMessage({
        text: 'מצטער, יש בעיה בשירות. נסה שוב בעוד רגע.',
        isUser: false
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion)
    setShowSuggestions(false)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Embedded view for main content
  if (embedded) {
    return (
      <div className={`
        ${fullHeight ? 'h-full' : 'h-full'} 
        flex flex-col card border-none shadow-xl overflow-hidden
        relative
      `}>
        {/* Enhanced Header */}
        <div className="glass-hover p-4 border-b border-white/10 flex-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{ 
                boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(147, 51, 234, 0.4)', '0 0 20px rgba(59, 130, 246, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icons.Zap className="text-white" size={24} />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gradient">העוזר החכם שלך</h2>
              <p className="text-sm text-secondary">תמיד פה לעזור ולייעץ</p>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-400"></div>
            </div>
          </motion.div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Welcome Message */}
          {chatMessages.length <= 1 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Icons.Message className="text-white" size={32} />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gradient mb-3">
                שלום! איך אפשר לעזור לך היום?
              </h3>
              <p className="text-lg text-secondary mb-8 leading-relaxed max-w-md mx-auto">
                שאל אותי על המשימות, הכסף, הלוח זמנים או כל דבר אחר שתרצה
              </p>
              
              {/* Enhanced Quick Start Suggestions */}
              {showSuggestions && (
                <motion.div 
                  className="grid grid-cols-2 gap-4 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, staggerChildren: 0.1 }}
                >
                  {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="glass-hover p-4 rounded-2xl transition-all duration-300 group border border-white/20"
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <div className={`text-3xl mb-3 ${suggestion.color} transition-all duration-300 group-hover:scale-110`}>
                        {suggestion.emoji}
                      </div>
                      <div className="font-semibold text-sm text-primary group-hover:text-gradient leading-relaxed">
                        {suggestion.text}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Enhanced Chat Messages */}
          {chatMessages.length > 1 && chatMessages.slice(1).map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-start' : 'justify-end'} mb-4`}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`flex items-start gap-3 max-w-2xl ${message.isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <motion.div 
                  className={`
                    w-10 h-10 rounded-2xl flex-center shadow-lg
                    ${message.isUser 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {message.isUser ? (
                    <Icons.User className="text-white" size={16} />
                  ) : (
                    <Icons.Zap className="text-white" size={16} />
                  )}
                </motion.div>

                {/* Message Bubble */}
                <div
                  className={`
                    px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-sm
                    ${message.isUser
                      ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white border-blue-300/30'
                      : 'glass border-white/20 text-primary'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed font-medium mb-2">{message.text}</p>
                  <p className={`text-xs ${
                    message.isUser ? 'text-white/70' : 'text-secondary'
                  }`}>
                    {message.timestamp.toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Enhanced Typing Indicator */}
          {isTyping && (
            <motion.div
              className="flex justify-end mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3 max-w-xl flex-row-reverse">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icons.Zap className="text-white" size={16} />
                </motion.div>
                <div className="glass px-6 py-4 rounded-2xl border border-white/20 shadow-lg">
                  <LoadingSpinner message="חושב על התשובה המושלמת..." />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Quick Suggestions */}
        {chatMessages.length > 1 && showSuggestions && (
          <motion.div 
            className="glass-hover px-6 py-4 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icons.Sparkles className="text-purple-400" size={16} />
              <p className="text-sm font-bold text-primary">הצעות חכמות</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.slice(4).map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="btn-ghost px-3 py-2 text-xs rounded-full flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={suggestion.color}>{suggestion.emoji}</span>
                  <span>{suggestion.text.split(' ').slice(0, 3).join(' ')}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Input Area */}
        <div className="glass-hover p-6 border-t border-white/10">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="שאל אותי משהו חכם..."
                className="input pr-12"
                disabled={isTyping}
              />
              <motion.button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 btn-ghost p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Sparkles className="text-purple-400" size={16} />
              </motion.button>
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="btn-primary w-12 h-12 rounded-2xl flex-center disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: currentMessage.trim() ? 1.05 : 1 }}
              whileTap={{ scale: currentMessage.trim() ? 0.95 : 1 }}
            >
              <Icons.Send className="text-white" size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Popup view for floating chat
  return (
    <>
      {/* Enhanced Chat Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl flex-center"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          y: isOpen ? -400 : 0,
          rotate: isOpen ? 180 : 0,
          boxShadow: isOpen 
            ? '0 0 50px rgba(147, 51, 234, 0.5)' 
            : ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(147, 51, 234, 0.4)', '0 0 20px rgba(59, 130, 246, 0.3)']
        }}
        transition={{ 
          duration: isOpen ? 0.3 : 2,
          repeat: isOpen ? 0 : Infinity
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
            >
              <Icons.Close className="text-white" size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Icons.Message className="text-white" size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && chatMessages.length <= 1 && (
          <motion.div
            className="absolute -top-2 -left-2 w-4 h-4 bg-red-400 rounded-full animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </motion.button>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Enhanced Chat Header */}
            <div className="glass-hover p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex-center shadow-lg">
                  <Icons.Zap className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-primary">העוזר החכם שלך</h3>
                  <p className="text-xs text-secondary">תמיד פה לעזור</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {/* Welcome message for popup */}
              {chatMessages.length <= 1 && (
                <motion.div 
                  className="text-center py-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex-center shadow-lg">
                    <Icons.Message className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-primary mb-2">שלום!</h3>
                  <p className="text-sm text-secondary mb-4">איך אפשר לעזור?</p>
                </motion.div>
              )}

              {chatMessages.length > 1 && chatMessages.slice(1).map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border ${
                      message.isUser
                        ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white border-blue-300/30'
                        : 'glass text-primary border-white/20'
                    }`}
                  >
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-white/70' : 'text-secondary'
                    }`}>
                      {message.timestamp.toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="glass px-4 py-3 rounded-2xl border border-white/20 shadow-lg">
                    <LoadingSpinner message="חושב..." />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions for popup */}
            {chatMessages.length <= 1 && (
              <div className="px-4 py-2 border-t border-white/10">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                  <Icons.Sparkles size={12} />
                  הצעות מהירות:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="btn-ghost text-xs px-3 py-1 rounded-full flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className={suggestion.color}>{suggestion.emoji}</span>
                      <span>{suggestion.text.split(' ').slice(0, 2).join(' ')}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="כתוב הודעה..."
                  className="input text-sm"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="btn-primary w-10 h-10 rounded-xl flex-center disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: currentMessage.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: currentMessage.trim() ? 0.95 : 1 }}
                >
                  <Icons.Send className="text-white" size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 