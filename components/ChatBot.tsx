'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { sendChatMessage, analyzeUserIntent } from '@/services/openai'
import { getLatestEmailWithAnalysis } from '@/services/gmail-calendar-integration'
import LoadingSpinner from './LoadingSpinner'

interface ChatBotProps {
  embedded?: boolean
  fullHeight?: boolean
}

export default function ChatBot({ embedded = false, fullHeight = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
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
    { text: 'מה אני צריך לעשות היום?', emoji: '📅' },
    { text: 'מה המצב הכספי והשקעות?', emoji: '💰' },
    { text: 'הראה לי את המשימות שלי', emoji: '✅' },
    { text: 'מתי הפגישה הבאה?', emoji: '⏰' },
    { text: 'הזכר לי להתקשר לאמא', emoji: '📞' },
    { text: 'מה עם אימון ובריאות?', emoji: '💪' },
    { text: 'תציע לי רעיון לארוחת ערב', emoji: '🍽️' },
    { text: 'איך מזג האוויר היום?', emoji: '🌤️' }
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
          unreadCount: 0 // זה יתעדכן מהרכיב של Gmail
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
      <div className={fullHeight 
        ? 'h-full flex flex-col bg-white rounded-lg md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl border-2 md:border-3 lg:border-4 border-black'
        : 'h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200'
      }>
        {/* Messages Area */}
        <div className={fullHeight 
          ? 'flex-1 p-2 md:p-4 lg:p-2 space-y-3 md:space-y-4 lg:space-y-2 overflow-y-auto scrollbar-hide'
          : 'flex-1 p-6 space-y-4 overflow-y-auto'
        }>
          {/* Welcome Message - Only show if no messages */}
          {chatMessages.length <= 1 && (
            <motion.div 
              className="text-center py-4 md:py-8 lg:py-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 lg:w-12 lg:h-12 bg-black text-white rounded-full flex items-center justify-center text-lg md:text-2xl lg:text-lg font-bold mx-auto mb-3 md:mb-4 lg:mb-2 animate-float shadow-md md:shadow-lg lg:shadow-md"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                🤖
              </motion.div>
              <h2 className="text-lg md:text-2xl lg:text-lg font-bold text-black mb-2 md:mb-3 lg:mb-1.5">
                שלום! איך אפשר לעזור לך היום?
              </h2>
              <p className="text-sm md:text-lg lg:text-sm text-gray-600 mb-4 md:mb-6 lg:mb-3 leading-relaxed px-4">
                שאל אותי על המשימות, הכסף, הלוח זמנים או כל דבר אחר 💡
              </p>
              
              {/* Quick Start Suggestions */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-1.5 max-w-sm md:max-w-2xl lg:max-w-lg mx-auto">
                {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="p-2 md:p-4 lg:p-2 bg-gray-50 hover:bg-black hover:text-white border-2 border-gray-200 hover:border-black rounded-lg md:rounded-xl lg:rounded-lg transition-all duration-300 group shadow-sm md:shadow-md lg:shadow-sm hover:shadow-md md:hover:shadow-lg lg:hover:shadow-md"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 * index }}
                  >
                    <div className="text-lg md:text-3xl lg:text-lg mb-1 md:mb-2 lg:mb-1">{suggestion.emoji}</div>
                    <div className="font-bold text-xs md:text-sm lg:text-xs leading-relaxed">{suggestion.text}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          {chatMessages.length > 1 && chatMessages.slice(1).map((message, index) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-start' : 'justify-end'} mb-2 md:mb-3 lg:mb-1.5`}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`max-w-xs md:max-w-xl lg:max-w-sm px-3 md:px-4 lg:px-2.5 py-2 md:py-3 lg:py-1.5 rounded-2xl shadow-sm md:shadow-md lg:shadow-sm border-2 ${
                  message.isUser
                    ? 'bg-black text-white border-gray-300'
                    : 'bg-gray-100 text-black border-gray-400'
                }`}
              >
                <p className="text-sm md:text-base lg:text-xs leading-relaxed font-medium">{message.text}</p>
                <p className={`text-xs md:text-sm lg:text-xs mt-1 md:mt-2 lg:mt-1 ${
                  message.isUser ? 'text-white/70' : 'text-gray-500'
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
              className="flex justify-end mb-2 md:mb-3 lg:mb-1.5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gray-100 text-black border-2 border-gray-400 px-3 md:px-4 lg:px-2.5 py-2 md:py-3 lg:py-1.5 rounded-2xl shadow-sm md:shadow-md lg:shadow-sm max-w-xs md:max-w-md">
                <LoadingSpinner message="חושב על התשובה הטובה ביותר..." />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Additional Quick Suggestions - Show after first message */}
        {chatMessages.length > 1 && (
          <div className="px-2 md:px-4 lg:px-2 py-2 md:py-3 lg:py-1.5 border-t-2 border-gray-200 bg-gray-50">
            <p className="text-sm md:text-base lg:text-xs text-black font-bold mb-1 md:mb-2 lg:mb-1">💡 הצעות נוספות:</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2 lg:gap-1">
              {quickSuggestions.slice(4).map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="px-2 md:px-3 lg:px-1.5 py-1 md:py-2 lg:py-0.5 bg-white hover:bg-black hover:text-white border border-gray-300 hover:border-black rounded-full transition-all duration-300 text-xs md:text-sm lg:text-xs font-medium shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion.emoji} {suggestion.text.split(' ').slice(0, 3).join(' ')}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={fullHeight 
          ? 'p-2 md:p-4 lg:p-2 bg-white border-t-2 border-gray-200 rounded-b-lg'
          : 'p-6 bg-gray-50 border-t border-gray-200/50 rounded-b-xl'
        }>
          <div className="flex space-x-2 md:space-x-3 lg:space-x-1.5">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="שאל אותי משהו חכם..."
              className="flex-1 px-3 md:px-4 lg:px-2.5 py-2 md:py-3 lg:py-1.5 border-2 border-gray-300 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm md:text-base lg:text-xs placeholder-gray-500 transition-all duration-200 font-medium shadow-sm md:shadow-md lg:shadow-sm"
              disabled={isTyping}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="px-4 md:px-6 lg:px-3 py-2 md:py-3 lg:py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm md:text-base lg:text-xs shadow-sm md:shadow-md lg:shadow-sm hover:shadow-md"
              whileHover={{ scale: currentMessage.trim() ? 1.05 : 1 }}
              whileTap={{ scale: currentMessage.trim() ? 0.95 : 1 }}
            >
              <span className="text-base md:text-lg lg:text-sm">➤</span>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // Popup view for floating chat
  return (
    <>
      {/* Chat Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 bg-black rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: isOpen ? -380 : 0,
          rotate: isOpen ? 180 : 0 
        }}
      >
        <span className="text-2xl text-white">
          {isOpen ? '×' : '🤖'}
        </span>
        {!isOpen && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-6 z-40 w-96 h-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Header */}
            <div className="bg-black p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold">העוזר החכם שלך</h3>
                  <p className="text-xs text-white/80">תמיד פה לעזור</p>
                </div>
                <div className="mr-auto flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
               <motion.div
                 key={message.id}
                 className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3 }}
               >
                 <div
                   className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg ${
                     message.isUser
                       ? 'bg-black text-white border border-gray-200'
                       : 'bg-gray-100 text-black border border-gray-200'
                   }`}
                 >
                   <p className="text-sm font-medium">{message.text}</p>
                   <p className={`text-xs mt-1 ${
                     message.isUser ? 'text-white/70' : 'text-gray-500'
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
                 <div className="bg-gray-100 text-black border border-gray-200 px-4 py-3 rounded-2xl shadow-lg">
                   <LoadingSpinner message="חושב..." />
                 </div>
               </motion.div>
             )}
             <div ref={messagesEndRef} />
           </div>

           {/* Quick Suggestions */}
           {chatMessages.length <= 1 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-black font-bold mb-2">הצעות מהירות:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="text-xs bg-white border border-gray-300 hover:bg-black hover:text-white px-3 py-2 rounded-full transition-all duration-300 flex items-center space-x-1 font-medium shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{suggestion.emoji}</span>
                    <span>{suggestion.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t-2 border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="כתוב הודעה..."
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium"
                disabled={isTyping}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                whileHover={{ scale: currentMessage.trim() ? 1.05 : 1 }}
                whileTap={{ scale: currentMessage.trim() ? 0.95 : 1 }}
              >
                ↩
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  )
} 