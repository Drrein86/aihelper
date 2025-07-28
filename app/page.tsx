'use client'

import ChatBot from '@/components/ChatBot'
import { motion } from 'framer-motion'
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

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  const { 
    user, 
    tasks, 
    events, 
    notifications
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-center flex-col gap-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-center shadow-lg">
            <Icons.Zap className="text-white" size={32} />
          </div>
          <div className="text-2xl font-bold text-gray-900">טוען עוזר חכם...</div>
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
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                <p className="text-sm text-gray-600">העוזר החכם שלך</p>
              </div>
            </div>

            {/* Center Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Icons.Calendar className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-900">{todayEvents} אירועים</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Icons.Check className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-900">{pendingTasks} משימות</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Icons.Bell className="text-gray-600" size={16} />
                <span className="text-sm font-medium text-gray-900">{unreadNotifications} התראות</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Live Clock */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Screen Layout */}
      <main className="container mx-auto px-4 py-8">
        {/* Top Section - Chat Bot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-center">
                <Icons.Message className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">עוזר חכם</h2>
                <p className="text-sm text-gray-600">שאל אותי כל שאלה</p>
              </div>
            </div>
          </div>
          <div className="h-96">
            <ChatBot embedded={true} fullHeight={true} />
          </div>
        </motion.div>

        {/* Widget Grid - All in One Screen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Calendar className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">לוח השנה</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
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
              {events.slice(0, 2).map((event, index) => (
                <div key={event.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stock Summary Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.TrendingUp className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">מניות</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 mb-1">+2.5%</div>
                <div className="text-sm text-gray-600">יום טוב בבורסה</div>
              </div>
              {['AAPL', 'MSFT', 'TSLA'].map((stock, index) => (
                <div key={stock} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{stock}</span>
                  <span className="text-sm text-gray-600">+1.2%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gmail Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Mail className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">דואר</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 mb-1">5</div>
                <div className="text-sm text-gray-600">הודעות חדשות</div>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 truncate">פגישה חשובה</div>
                  <div className="text-xs text-gray-500">מנהל הפרויקט</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 truncate">עדכון מערכת</div>
                  <div className="text-xs text-gray-500">מחלקת IT</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tasks Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Check className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">משימות</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 mb-1">{pendingTasks}</div>
                <div className="text-sm text-gray-600">משימות פתוחות</div>
              </div>
              {tasks.slice(0, 3).map((task, index) => (
                <div key={task.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-4 h-4 rounded border-2 flex-center ${
                    task.done ? 'bg-gray-600 border-gray-600' : 'border-gray-300'
                  }`}>
                    {task.done && <Icons.Check className="text-white" size={12} />}
                  </div>
                  <span className={`text-sm flex-1 truncate ${
                    task.done ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Sparkles className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">המלצת היום</h3>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-900 mb-2">
                "התחל את היום עם תרגיל קצר של 10 דקות"
              </div>
              <div className="text-xs text-gray-500">המלצה אישית</div>
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.TrendingUp className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">אתגרים</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 mb-1">3/5</div>
                <div className="text-sm text-gray-600">אתגרים הושלמו</div>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-900">שתה 8 כוסות מים</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div className="bg-gray-600 h-1 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-900">10,000 צעדים</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div className="bg-gray-600 h-1 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inspiration Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Sparkles className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">השראה</h3>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-900 mb-2 font-medium">
                "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו"
              </div>
              <div className="text-xs text-gray-500">פיטר דרוקר</div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex-center">
                <Icons.Bell className="text-gray-600" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">התראות</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900 mb-1">{unreadNotifications}</div>
                <div className="text-sm text-gray-600">התראות חדשות</div>
              </div>
              {notifications.slice(0, 2).map((notification, index) => (
                <div key={notification.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 truncate">{notification.title}</div>
                  <div className="text-xs text-gray-500 truncate">{notification.message}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 