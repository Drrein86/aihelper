'use client'

import ChatBot from '@/components/ChatBot'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import StockSummary from '@/components/StockSummary'
import CalendarWidget from '@/components/CalendarWidget'
import StockPortfolio from '@/components/StockPortfolio'
import InspirationQuotes from '@/components/InspirationQuotes'
import DailyChallenges from '@/components/DailyChallenges'
import DailyRecommendation from '@/components/DailyRecommendation'
import DailyMenu from '@/components/DailyMenu'
import GmailWidget from '@/components/GmailWidget'
import GmailCalendarIntegration from '@/components/GmailCalendarIntegration'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import { Icons } from '@/components/ui/Icons'
import React from 'react'

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { 
    user, 
    tasks, 
    events, 
    notifications, 
    financial
  } = useStore()

  // Quick stats for calculations
  const pendingTasks = tasks.filter(t => !t.done).length
  const unreadNotifications = notifications.filter(n => !n.read).length
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate.toDateString() === new Date().toDateString()
  }).length
  
  // Update time every second + handle auth callback
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // בדיקה אם יש פרמטרי auth בURL
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    
    if (authStatus === 'success') {
      console.log('✅ Google התחברות הצליחה!')
      // מסיר את הפרמטר מה-URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authStatus === 'error') {
      console.error('❌ שגיאה בהתחברות Google')
      // מסיר את הפרמטר מה-URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    return () => clearInterval(timer)
  }, [])

  const getTimeBasedGreeting = () => {
    if (!currentTime) return 'שלום'
    const hour = currentTime.getHours()
    if (hour < 12) return 'בוקר טוב'
    if (hour < 18) return 'אחר הצהריים טובים'
    return 'ערב טוב'
  }

  const features = [
    {
      id: 'calendar',
      title: 'לוח השנה',
      description: 'אירועים ופגישות',
      icon: Icons.Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      height: 'h-16',
      content: {
        date: currentTime?.getDate() || '--',
        events: todayEvents,
        preview: events.slice(0, 1).map(e => ({ title: e.title, time: e.time }))
      }
    },
    {
      id: 'stocks',
      title: 'מניות',
      description: 'תיק השקעות',
      icon: Icons.TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      height: 'h-16',
      content: {
        change: '+2.5%',
        status: 'יום טוב',
        stocks: ['AAPL', 'MSFT', 'TSLA'],
        preview: [
          { symbol: 'AAPL', change: '+1.2%', price: '$150.25' }
        ]
      }
    },
    {
      id: 'gmail',
      title: 'דואר',
      description: 'הודעות ומיילים',
      icon: Icons.Mail,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      height: 'h-16',
      content: {
        unread: 5,
        preview: [
          { subject: 'פגישה חשובה', sender: 'מנהל הפרויקט', time: '10:30' }
        ]
      }
    },
    {
      id: 'tasks',
      title: 'משימות',
      description: 'משימות ויעדים',
      icon: Icons.Check,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      height: 'h-16',
      content: {
        pending: pendingTasks,
        completed: tasks.filter(t => t.done).length,
        preview: tasks.slice(0, 1).map(t => ({ text: t.text, done: t.done }))
      }
    },
    {
      id: 'recommendations',
      title: 'המלצות',
      description: 'מותאמות אישית',
      icon: Icons.Sparkles,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      height: 'h-16',
      content: {
        tip: 'תרגיל קצר',
        category: 'בריאות',
        icon: '💪'
      }
    },
    {
      id: 'challenges',
      title: 'אתגרים',
      description: 'מטרות יומיות',
      icon: Icons.TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      height: 'h-16',
      content: {
        completed: 3,
        total: 5,
        challenges: [
          { name: '10,000 צעדים', progress: 80, icon: '🚶' },
          { name: '8 כוסות מים', progress: 60, icon: '💧' }
        ]
      }
    },
    {
      id: 'inspiration',
      title: 'השראה',
      description: 'ציטוטים מעוררים',
      icon: Icons.Sparkles,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      height: 'h-16',
      content: {
        quote: 'הדרך הטובה ביותר...',
        author: 'פיטר דרוקר',
        category: 'מוטיבציה'
      }
    },
    {
      id: 'notifications',
      title: 'התראות',
      description: 'התראות חשובות',
      icon: Icons.Bell,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      height: 'h-16',
      content: {
        unread: unreadNotifications,
        preview: notifications.slice(0, 1).map(n => ({ title: n.title, message: n.message }))
      }
    }
  ]

  const openFeature = (featureId: string) => {
    setActiveFeature(featureId)
    setShowFeatureModal(true)
  }

  if (!mounted) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-center flex-col gap-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex-center shadow-2xl">
            <Icons.Zap className="text-white" size={40} />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            טוען עוזר חכם...
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
              </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50 shadow-lg h-12">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Zap className="text-white" size={12} />
              </motion.div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getTimeBasedGreeting()}, {user.name}
                </h1>
                <p className="text-xs text-gray-600">העוזר החכם שלך</p>
              </div>
          </div>
          
            {/* Center Stats - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
        <motion.div 
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md border border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
        >
                <Icons.Calendar className="text-blue-600" size={10} />
                <span className="text-xs font-semibold text-blue-700">{todayEvents} אירועים</span>
              </motion.div>
          <motion.div 
                className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md border border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Check className="text-green-600" size={10} />
                <span className="text-xs font-semibold text-green-700">{pendingTasks} משימות</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md border border-orange-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Bell className="text-orange-600" size={10} />
                <span className="text-xs font-semibold text-orange-700">{unreadNotifications} התראות</span>
              </motion.div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button - Only visible on mobile */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icons.Menu className="text-gray-600" size={16} />
              </motion.button>

              {/* Live Clock */}
        <motion.div 
                className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border border-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
        >
                <Icons.Clock className="text-gray-600" size={10} />
                <span className="text-xs font-bold text-gray-900">
                  {currentTime?.toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) || '--:--'}
                </span>
        </motion.div>
              <GoogleAuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Mobile Menu Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex-center">
                      <Icons.Zap className="text-white" size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">תפריט</h2>
                      <p className="text-white/80 text-sm">כל הפיצ'רים</p>
                    </div>
                  </div>
              <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Icons.Close className="text-white" size={16} />
              </button>
          </div>
                </div>

              {/* Mobile Menu Items */}
              <div className="p-4 space-y-3 h-[calc(100%-5rem)] overflow-y-auto">
                {features.map((feature, index) => (
                  <motion.button
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      openFeature(feature.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all duration-300
                      hover:shadow-lg hover:scale-[1.02] active:scale-95
                      ${feature.borderColor} ${feature.bgColor}
                      flex items-center gap-3 text-right
                    `}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex-center shadow-lg`}>
                      <feature.icon className="text-white" size={20} />
                </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                    <Icons.ChevronDown className="text-gray-400 rotate-[-90deg]" size={20} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Responsive Layout */}
      <main className="h-[calc(100vh-3rem)] flex">
        {/* AI Chat - Full width on mobile, 50% on desktop */}
        <div className="w-full lg:w-1/2 h-full p-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-200 h-full overflow-hidden"
          >
            {/* Compact Chat Header */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex-center shadow-md">
                  <Icons.Message className="text-white" size={12} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    עוזר חכם
                  </h2>
                  <p className="text-white/80 text-xs">שאל אותי כל שאלה</p>
                </div>
              </div>
            </div>

            {/* Chat Content - No Scroll */}
            <div className="h-[calc(100%-3.5rem)] overflow-hidden">
              <ChatBot embedded={true} fullHeight={true} noScroll={true} />
          </div>
          </motion.div>
                </div>

        {/* Features Layout - Hidden on mobile, 50% width on desktop */}
        <div className="hidden lg:block lg:w-1/2 h-full p-2">
          <div className="grid grid-cols-3 gap-3 h-full">
            {/* Column 1 (Right) - 3 features */}
            <div className="flex flex-col gap-3 h-full">
              {features.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openFeature(feature.id)}
                  className={`
                    bg-white rounded-lg shadow-sm border cursor-pointer
                    transition-all duration-300 hover:shadow-md
                    ${feature.borderColor} hover:border-opacity-100
                    flex-1 min-h-0
                  `}
                    >
                  <div className="p-2 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-4 h-4 bg-gradient-to-br ${feature.color} rounded flex-center shadow-sm`}>
                        <feature.icon className="text-white" size={8} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">{feature.title}</h3>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className={`flex-1 ${feature.bgColor} rounded border ${feature.borderColor} p-1`}>
                      {feature.id === 'calendar' && (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900">
                              {feature.content.date}
                            </div>
                            <div className="text-xs text-gray-600">
                              {feature.content.events} אירועים
                            </div>
                          </div>
                </div>
                      )}

                      {feature.id === 'stocks' && (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-bold text-green-600">
                              {feature.content.change}
                            </div>
                            <div className="text-xs text-gray-600">
                              {feature.content.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.id === 'gmail' && (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900">
                              {feature.content.unread}
                            </div>
                            <div className="text-xs text-gray-600">
                              הודעות חדשות
                            </div>
                          </div>
                    </div>
                  )}
                </div>

                    {/* Action Button */}
                    <div className="mt-1">
                      <div className={`w-full py-0.5 px-1 bg-gradient-to-r ${feature.color} text-white text-xs font-semibold rounded text-center`}>
                        פתח
              </div>
            </div>
            </div>
          </motion.div>
              ))}
          </div>

            {/* Column 2 (Middle) - 2 features */}
            <div className="flex flex-col gap-3 h-full">
              {features.slice(3, 5).map((feature, index) => (
            <motion.div 
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * 0.1 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openFeature(feature.id)}
                  className={`
                    bg-white rounded-lg shadow-sm border cursor-pointer
                    transition-all duration-300 hover:shadow-md
                    ${feature.borderColor} hover:border-opacity-100
                    flex-1 min-h-0
                  `}
            >
                  <div className="p-2 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-4 h-4 bg-gradient-to-br ${feature.color} rounded flex-center shadow-sm`}>
                        <feature.icon className="text-white" size={8} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">{feature.title}</h3>
                      </div>
              </div>
              
                    {/* Content Preview */}
                    <div className={`flex-1 ${feature.bgColor} rounded border ${feature.borderColor} p-1`}>
                      {feature.id === 'tasks' && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 mb-0.5">
                              {feature.content.pending}
                            </div>
                            <div className="text-xs text-gray-600">
                              משימות פתוחות
                            </div>
                          </div>
                                                  <div className="space-y-0.5">
                          {feature.content.preview?.map((task, idx) => {
                            // Type guard to ensure this is a task object with done property
                            if (!('done' in task) || !('text' in task)) return null;
                            return (
                              <div key={idx} className="flex items-center gap-0.5 text-xs">
                                <div className={`w-1 h-1 rounded-full border flex-center ${
                                  task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {task.done && <Icons.Check className="text-white" size={3} />}
                                </div>
                                <span className={`flex-1 truncate ${task.done ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                  {task.text}
                                </span>
                              </div>
                            );
                          })}
                          </div>
                </div>
                      )}

                      {feature.id === 'recommendations' && (
                        <div className="h-full flex flex-col justify-center text-center">
                          <div className="text-xs mb-0.5">{feature.content.icon}</div>
                          <div className="text-xs text-gray-900">
                            {feature.content.tip}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {feature.content.category}
                          </div>
                        </div>
                      )}
                  </div>
                  
                    {/* Action Button */}
                    <div className="mt-1">
                      <div className={`w-full py-0.5 px-1 bg-gradient-to-r ${feature.color} text-white text-xs font-semibold rounded text-center`}>
                        פתח
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
                </div>
                
            {/* Column 3 (Left) - 3 features */}
            <div className="flex flex-col gap-3 h-full">
              {features.slice(5, 8).map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 5) * 0.1 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openFeature(feature.id)}
                  className={`
                    bg-white rounded-lg shadow-sm border cursor-pointer
                    transition-all duration-300 hover:shadow-md
                    ${feature.borderColor} hover:border-opacity-100
                    flex-1 min-h-0
                  `}
                >
                  <div className="p-2 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-4 h-4 bg-gradient-to-br ${feature.color} rounded flex-center shadow-sm`}>
                        <feature.icon className="text-white" size={8} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">{feature.title}</h3>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className={`flex-1 ${feature.bgColor} rounded border ${feature.borderColor} p-1`}>
                      {feature.id === 'challenges' && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 mb-0.5">
                              {feature.content.completed}/{feature.content.total}
                            </div>
                            <div className="text-xs text-gray-600">
                              הושלמו
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            {feature.content.challenges?.slice(0, 1).map((challenge, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="flex items-center gap-0.5 mb-0.5">
                                  <span>{challenge.icon}</span>
                                  <span className="font-semibold text-gray-700">{challenge.name}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-0.5">
                                  <div 
                                    className="bg-orange-500 h-0.5 rounded-full" 
                                    style={{ width: `${challenge.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )) || []}
                          </div>
                        </div>
                      )}

                      {feature.id === 'inspiration' && (
                        <div className="h-full flex flex-col justify-center text-center">
                          <div className="text-xs text-gray-900 mb-0.5 italic">
                            "{feature.content.quote}"
                          </div>
                          <div className="text-xs text-gray-600">
                            {feature.content.author}
                          </div>
                        </div>
                      )}

                      {feature.id === 'notifications' && (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900">
                              {feature.content.unread}
                            </div>
                            <div className="text-xs text-gray-600">
                              התראות חדשות
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-1">
                      <div className={`w-full py-0.5 px-1 bg-gradient-to-r ${feature.color} text-white text-xs font-semibold rounded text-center`}>
                        פתח
                      </div>
                    </div>
              </div>
            </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Feature Modal */}
      <AnimatePresence>
        {showFeatureModal && activeFeature && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeatureModal(false)}
          >
            <motion.div 
              className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-4">
                  {features.find(f => f.id === activeFeature) && (
                    <>
                      <div className={`w-12 h-12 bg-gradient-to-br ${features.find(f => f.id === activeFeature)!.color} rounded-2xl flex-center shadow-lg`}>
                        {React.createElement(features.find(f => f.id === activeFeature)!.icon, {
                          className: "text-white",
                          size: 24
                        })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {features.find(f => f.id === activeFeature)?.title}
                        </h2>
                        <p className="text-gray-600">
                          {features.find(f => f.id === activeFeature)?.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowFeatureModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Icons.Close className="text-gray-600" size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="h-[calc(100%-5rem)] overflow-auto p-6">
                {activeFeature === 'calendar' && <Calendar />}
                {activeFeature === 'stocks' && <StockPortfolio />}
                {activeFeature === 'gmail' && (
                  <div className="space-y-6">
                    <GmailWidget />
                    <GmailCalendarIntegration />
                  </div>
                )}
                {activeFeature === 'tasks' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">ניהול משימות</h3>
                    <div className="grid gap-4">
                      {tasks.map((task) => (
                        <div key={task.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex-center ${
                              task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {task.done && <Icons.Check className="text-white" size={14} />}
                            </div>
                            <span className={`flex-1 ${task.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeFeature === 'recommendations' && (
                  <div className="space-y-6">
                    <DailyRecommendation 
                      className="h-full" 
                      onOpenDetails={() => {}}
                    />
                  </div>
                )}
                {activeFeature === 'challenges' && (
                  <div className="space-y-6">
                    <DailyChallenges 
                      className="h-full" 
                      onOpenDetails={() => {}}
                    />
                  </div>
                )}
                {activeFeature === 'inspiration' && (
                  <div className="space-y-6">
                    <InspirationQuotes 
                      className="h-full" 
                      onOpenDetails={() => {}}
                    />
                  </div>
                )}
                {activeFeature === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">התראות</h3>
                    <div className="grid gap-4">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-600">{notification.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
              </div>
          </div>
        )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 