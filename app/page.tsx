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
  
  // Update time every second
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
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
      description: 'ניהול אירועים ופגישות',
      icon: Icons.Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      id: 'stocks',
      title: 'מניות והשקעות',
      description: 'מעקב אחר תיק ההשקעות',
      icon: Icons.TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    {
      id: 'gmail',
      title: 'דואר אלקטרוני',
      description: 'ניהול הודעות ומיילים',
      icon: Icons.Mail,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    },
    {
      id: 'tasks',
      title: 'משימות',
      description: 'ניהול משימות ויעדים',
      icon: Icons.Check,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      id: 'recommendations',
      title: 'המלצות אישיות',
      description: 'המלצות מותאמות אישית',
      icon: Icons.Sparkles,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    {
      id: 'challenges',
      title: 'אתגרים יומיים',
      description: 'מטרות ואתגרים אישיים',
      icon: Icons.TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700'
    },
    {
      id: 'inspiration',
      title: 'השראה וציטוטים',
      description: 'ציטוטים מעוררי השראה',
      icon: Icons.Sparkles,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700'
    },
    {
      id: 'notifications',
      title: 'התראות',
      description: 'כל ההתראות החשובות',
      icon: Icons.Bell,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Zap className="text-white" size={24} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getTimeBasedGreeting()}, {user.name}
                </h1>
                <p className="text-sm text-gray-600">העוזר החכם שלך מוכן לעזור</p>
              </div>
            </div>

            {/* Center Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Calendar className="text-blue-600" size={18} />
                <span className="text-sm font-semibold text-blue-700">{todayEvents} אירועים</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Check className="text-green-600" size={18} />
                <span className="text-sm font-semibold text-green-700">{pendingTasks} משימות</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Bell className="text-orange-600" size={18} />
                <span className="text-sm font-semibold text-orange-700">{unreadNotifications} התראות</span>
              </motion.div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Live Clock */}
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icons.Clock className="text-gray-600" size={18} />
                <span className="text-sm font-bold text-gray-900">
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* AI Assistant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 mb-8 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex-center shadow-lg">
                <Icons.Message className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  עוזר חכם
                </h2>
                <p className="text-gray-600">שאל אותי כל שאלה על כל הפיצ'רים</p>
              </div>
            </div>
          </div>
          <div className="h-96">
            <ChatBot embedded={true} fullHeight={true} />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openFeature(feature.id)}
              className={`
                bg-white rounded-2xl shadow-lg border-2 cursor-pointer
                transition-all duration-300 hover:shadow-2xl
                ${feature.borderColor} hover:border-opacity-100
              `}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex-center shadow-lg`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div className={`p-4 ${feature.bgColor} rounded-xl border ${feature.borderColor}`}>
                  {feature.id === 'calendar' && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {currentTime?.getDate() || '--'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentTime?.toLocaleDateString('he-IL', { month: 'long' })}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {todayEvents} אירועים היום
                      </div>
                    </div>
                  )}

                  {feature.id === 'stocks' && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-1">+2.5%</div>
                      <div className="text-sm text-gray-600">יום טוב בבורסה</div>
                      <div className="text-xs text-gray-500 mt-2">AAPL, MSFT, TSLA</div>
                    </div>
                  )}

                  {feature.id === 'gmail' && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">5</div>
                      <div className="text-sm text-gray-600">הודעות חדשות</div>
                      <div className="text-xs text-gray-500 mt-2">פגישה חשובה, עדכון מערכת</div>
                    </div>
                  )}

                  {feature.id === 'tasks' && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{pendingTasks}</div>
                      <div className="text-sm text-gray-600">משימות פתוחות</div>
                      <div className="text-xs text-gray-500 mt-2">לחץ לניהול מלא</div>
                    </div>
                  )}

                  {feature.id === 'recommendations' && (
                    <div className="text-center">
                      <div className="text-sm text-gray-900 mb-2">
                        "התחל את היום עם תרגיל קצר"
                      </div>
                      <div className="text-xs text-gray-500">המלצה אישית</div>
                    </div>
                  )}

                  {feature.id === 'challenges' && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">3/5</div>
                      <div className="text-sm text-gray-600">אתגרים הושלמו</div>
                      <div className="text-xs text-gray-500 mt-2">10,000 צעדים, 8 כוסות מים</div>
                    </div>
                  )}

                  {feature.id === 'inspiration' && (
                    <div className="text-center">
                      <div className="text-sm text-gray-900 mb-2">
                        "הדרך הטובה ביותר לחזות את העתיד..."
                      </div>
                      <div className="text-xs text-gray-500">פיטר דרוקר</div>
                    </div>
                  )}

                  {feature.id === 'notifications' && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">{unreadNotifications}</div>
                      <div className="text-sm text-gray-600">התראות חדשות</div>
                      <div className="text-xs text-gray-500 mt-2">לחץ לצפייה</div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <div className={`w-full py-2 px-4 bg-gradient-to-r ${feature.color} text-white text-sm font-semibold rounded-lg text-center`}>
                    פתח {feature.title}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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