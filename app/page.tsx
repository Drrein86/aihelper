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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<string>('')
  const [mounted, setMounted] = useState(false)

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

  const navigationItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: Icons.TrendingUp },
    { id: 'calendar', label: 'לוח שנה', icon: Icons.Calendar },
    { id: 'tasks', label: 'משימות', icon: Icons.Check },
    { id: 'stocks', label: 'מניות', icon: Icons.DollarSign },
    { id: 'gmail', label: 'דואר', icon: Icons.Mail },
    { id: 'recommendations', label: 'המלצות', icon: Icons.Sparkles },
  ]

  const openModal = (content: string) => {
    setModalContent(content)
    setShowModal(true)
    setMobileMenuOpen(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex-center" style={{ background: 'var(--color-background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-center flex-col gap-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-center shadow-lg">
            <Icons.Zap className="text-white" size={32} />
          </div>
          <div className="text-2xl font-bold text-primary">טוען עוזר חכם...</div>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 relative z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-center shadow-lg">
                <Icons.Zap className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getTimeBasedGreeting()}, {user.name}
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">העוזר החכם שלך</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dashboard') {
                      setActiveView('dashboard')
                    } else {
                      openModal(item.id)
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${activeView === item.id || modalContent === item.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Quick Stats - Desktop Only */}
              <div className="hidden xl:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Icons.Calendar className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-900">{todayEvents} אירועים</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <Icons.Check className="text-green-600" size={16} />
                  <span className="text-sm font-medium text-green-900">{pendingTasks} משימות</span>
                </div>
              </div>

              {/* Live Clock */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Icons.Clock className="text-gray-600" size={16} />
                <span className="text-sm font-bold text-gray-900">
                  {currentTime?.toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) || '--:--'}
                </span>
              </div>

              <GoogleAuthButton />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-gray-200 bg-white"
              >
                {mobileMenuOpen ? (
                  <Icons.Close className="text-gray-600" size={20} />
                ) : (
                  <Icons.Menu className="text-gray-600" size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'dashboard') {
                          setActiveView('dashboard')
                          setMobileMenuOpen(false)
                        } else {
                          openModal(item.id)
                        }
                      }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className="text-gray-600" size={20} />
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Icons.Calendar className="text-blue-600" size={16} />
                    <div>
                      <div className="text-lg font-bold text-blue-900">{todayEvents}</div>
                      <div className="text-xs text-blue-600">אירועים</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Icons.Check className="text-green-600" size={16} />
                    <div>
                      <div className="text-lg font-bold text-green-900">{pendingTasks}</div>
                      <div className="text-xs text-green-600">משימות</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <Icons.Bell className="text-orange-600" size={16} />
                    <div>
                      <div className="text-lg font-bold text-orange-900">{unreadNotifications}</div>
                      <div className="text-xs text-orange-600">התראות</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        {activeView === 'dashboard' && (
          <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                ברוכים הבאים לעוזר החכם שלכם
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                מקום אחד לכל מה שצריך - לוח שנה, מניות, משימות ועוד
              </p>
            </motion.div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {/* Chat Bot - Full Width */}
              <div className="lg:col-span-2 xl:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-center">
                        <Icons.Message className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">עוזר חכם</h3>
                        <p className="text-sm text-gray-600">שאל אותי כל שאלה</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-96">
                    <ChatBot embedded={true} fullHeight={true} />
                  </div>
                </div>
              </div>

              {/* Widget Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <CalendarWidget 
                  className="h-full" 
                  onOpenCalendar={() => openModal('calendar')} 
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <StockSummary 
                  className="h-full" 
                  onOpenAdvisor={() => openModal('stocks')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <DailyRecommendation 
                  className="h-full" 
                  onOpenDetails={() => openModal('recommendations')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <InspirationQuotes 
                  className="h-full" 
                  onOpenDetails={() => openModal('inspiration')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <DailyChallenges 
                  className="h-full" 
                  onOpenDetails={() => openModal('challenges')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <GmailWidget />
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Modals */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {navigationItems.find(item => item.id === modalContent) && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-center">
                        {React.createElement(navigationItems.find(item => item.id === modalContent)!.icon, {
                          className: "text-white",
                          size: 20
                        })}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {navigationItems.find(item => item.id === modalContent)?.label}
                      </h2>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icons.Close className="text-gray-600" size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="h-[calc(100%-5rem)] overflow-auto">
                {modalContent === 'calendar' && <Calendar />}
                {modalContent === 'stocks' && <StockPortfolio />}
                {modalContent === 'gmail' && (
                  <div className="p-6">
                    <GmailWidget />
                    <div className="mt-6">
                      <GmailCalendarIntegration />
                    </div>
                  </div>
                )}
                {modalContent === 'tasks' && (
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-6">ניהול משימות</h3>
                    {/* Task management content */}
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Icons.Check className={task.done ? "text-green-600" : "text-gray-400"} size={16} />
                            <span className={`flex-1 ${task.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {modalContent === 'recommendations' && (
                  <div className="p-6">
                    <DailyRecommendation 
                      className="h-full" 
                      onOpenDetails={() => {}}
                    />
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