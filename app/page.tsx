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

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showStockAdvisor, setShowStockAdvisor] = useState(false)
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false)
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    type: 'meeting' as const
  })

  const { 
    user, 
    tasks, 
    events, 
    notifications, 
    financial,
    addEvent,
    addTask,
    addNotification,
    toggleTask,
    deleteTask,
    markNotificationRead
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

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.time.trim()) return
    
    addEvent({
      title: newEvent.title,
      time: newEvent.time,
      date: new Date(),
      type: newEvent.type,
      location: newEvent.location,
      duration: 60
    })
    
    setNewEvent({ title: '', time: '', location: '', type: 'meeting' })
    setShowAddEvent(false)
    
    addNotification({
      title: 'אירוע נוסף! 🎉',
      message: `האירוע "${newEvent.title}" נוסף ליום ${new Date().toLocaleDateString('he-IL')}`,
      type: 'success',
      read: false
    })
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-task':
        const taskTitle = prompt('הקלד כותרת למשימה החדשה:')
        if (taskTitle?.trim()) {
          addTask({
            text: taskTitle,
            done: false,
            priority: 'medium',
            category: 'personal'
          })
          addNotification({
            title: 'משימה נוספה! ✅',
            message: `המשימה "${taskTitle}" נוספה בהצלחה`,
            type: 'success',
            read: false
          })
        }
        break
      case 'new-event':
        setShowAddEvent(true)
        break
      case 'update-finance':
        addNotification({
          title: 'מערכת כספים 💰',
          message: 'מערכת הכספים עודכנה! יתרה חדשה זמינה',
          type: 'info',
          read: false
        })
        break
      case 'reports':
        setShowCalendar(true)
        break
    }
  }

  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      {/* Top Header Bar */}
      <motion.header 
        className="bg-black text-white px-2 md:px-3 lg:px-3 py-1 md:py-2 lg:py-1.5 flex items-center justify-between border-b-2 border-gray-200"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-3">
          {/* Mobile Menu Buttons */}
          <div className="flex lg:hidden space-x-2">
            <button 
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold"
            >
              💰
            </button>
            <button 
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold"
            >
              📋
            </button>
          </div>
          <motion.div 
            className="w-8 h-8 md:w-9 md:h-9 lg:w-7 lg:h-7 bg-white text-black rounded-full flex items-center justify-center text-sm md:text-base lg:text-sm font-bold animate-float"
            whileHover={{ scale: 1.1 }}
          >
            🤖
          </motion.div>
          <div>
            <h1 className="text-sm md:text-base lg:text-sm font-bold">
              {getTimeBasedGreeting()}, {user.name}! 
            </h1>
            <p className="text-xs md:text-sm lg:text-xs text-white/80 hidden md:block">העוזר החכם שלך מוכן לעזור</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-2">
          {/* Current Time */}
          <div className="bg-white text-black px-2 md:px-3 lg:px-2 py-1 md:py-1.5 lg:py-0.5 rounded-full font-bold text-xs md:text-sm lg:text-xs">
            {mounted && currentTime ? currentTime.toLocaleTimeString('he-IL', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }) : '--:--'}
          </div>
          {/* Status Indicators - Hidden on very small screens */}
          <div className="hidden sm:flex space-x-2 lg:space-x-1">
            {pendingTasks > 0 && (
              <div className="bg-red-500 text-white px-2 md:px-3 lg:px-1.5 py-1 md:py-1.5 lg:py-0.5 rounded-full font-bold text-xs md:text-sm lg:text-xs">
                {pendingTasks} משימות
              </div>
            )}
            {unreadNotifications > 0 && (
              <div className="bg-yellow-500 text-black px-2 md:px-3 lg:px-1.5 py-1 md:py-1.5 lg:py-0.5 rounded-full font-bold text-xs md:text-sm lg:text-xs">
                {unreadNotifications} התראות
              </div>
            )}
          </div>
          
          {/* Google Auth Button */}
          <GoogleAuthButton className="hidden md:flex text-xs" />
          
          <div className="flex space-x-1">
            <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-50px)] md:h-[calc(100vh-58px)] lg:h-[calc(100vh-52px)] relative">
        {/* Left Sidebar - Financial & Quick Stats */}
        <motion.div 
          className={`${showLeftSidebar ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} lg:relative lg:flex lg:bg-transparent lg:z-auto`}
          onClick={() => setShowLeftSidebar(false)}
        >
          <motion.div 
            className={`${showLeftSidebar ? 'w-80' : leftSidebarExpanded ? 'w-96' : 'w-60'} md:${leftSidebarExpanded ? 'w-80' : 'w-52'} lg:${leftSidebarExpanded ? 'w-80' : 'w-52'} xl:${leftSidebarExpanded ? 'w-96' : 'w-60'} bg-gray-50 p-1 flex flex-col gap-1 overflow-y-auto border-l-2 border-black transition-all duration-300 ${
              showLeftSidebar ? 'fixed left-0 top-0 h-full z-50' : 'hidden lg:block'
            }`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control Buttons */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <button 
                onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
                className="hidden lg:block w-6 h-6 bg-black/10 hover:bg-black/20 text-black rounded-full flex items-center justify-center text-xs transition-all duration-200"
                title={leftSidebarExpanded ? 'קטן' : 'הגדל'}
              >
                {leftSidebarExpanded ? '←' : '→'}
              </button>
              <button 
                onClick={() => setShowLeftSidebar(false)}
                className="lg:hidden w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Stock Summary Widget */}
            <div className="flex-1 min-h-0">
              <StockSummary 
                className="h-full" 
                onOpenAdvisor={() => setShowStockAdvisor(true)}
              />
            </div>

            {/* Calendar Widget */}
            <div className="flex-1 min-h-0">
              <CalendarWidget 
                className="h-full" 
                onOpenCalendar={() => setShowCalendar(true)}
              />
            </div>

            {/* Inspiration Quotes Widget */}
            <div className="flex-1 min-h-0">
              <InspirationQuotes 
                className="h-full" 
                onOpenDetails={(type) => console.log('Open inspiration:', type)}
              />
            </div>

            {/* Daily Challenges Widget */}
            <div className="flex-1 min-h-0">
              <DailyChallenges 
                className="h-full" 
                onOpenDetails={(type) => console.log('Open challenges:', type)}
              />
            </div>
          </motion.div>
          </motion.div>

        {/* Center Chat Area */}
        <motion.div 
          className="flex-1 p-2 md:p-3 lg:p-2 bg-gray-50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="h-full max-w-3xl md:max-w-4xl lg:max-w-2xl xl:max-w-3xl mx-auto">
            <ChatBot embedded={true} fullHeight={true} />
          </div>
        </motion.div>

        {/* Smart Quick Actions Float */}
        <motion.div 
          className="fixed bottom-4 left-4 z-40 lg:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-full p-2 shadow-2xl">
            <div className="flex space-x-2">
              {[
                { icon: '📝', action: 'new-task', color: 'bg-blue-500' },
                { icon: '📅', action: 'new-event', color: 'bg-green-500' },
                { icon: '💰', action: 'update-finance', color: 'bg-yellow-500' },
                { icon: '📊', action: 'reports', color: 'bg-purple-500' }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center text-lg hover:scale-110 transition-all duration-200 shadow-lg`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  {action.icon}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar - Tasks & Events */}
        <motion.div 
          className={`${showRightSidebar ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} lg:relative lg:flex lg:bg-transparent lg:z-auto`}
          onClick={() => setShowRightSidebar(false)}
        >
          <motion.div 
            className={`${showRightSidebar ? 'w-80' : rightSidebarExpanded ? 'w-96' : 'w-60'} md:${rightSidebarExpanded ? 'w-80' : 'w-52'} lg:${rightSidebarExpanded ? 'w-80' : 'w-52'} xl:${rightSidebarExpanded ? 'w-96' : 'w-60'} bg-gray-50 p-1 flex flex-col gap-1 overflow-y-auto border-r-2 border-black transition-all duration-300 ${
              showRightSidebar ? 'fixed right-0 top-0 h-full z-50' : 'hidden lg:block'
            }`}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control Buttons */}
            <div className="absolute top-2 left-2 flex space-x-1">
              <button 
                onClick={() => setRightSidebarExpanded(!rightSidebarExpanded)}
                className="hidden lg:block w-6 h-6 bg-black/10 hover:bg-black/20 text-black rounded-full flex items-center justify-center text-xs transition-all duration-200"
                title={rightSidebarExpanded ? 'קטן' : 'הגדל'}
              >
                {rightSidebarExpanded ? '→' : '←'}
              </button>
              <button 
                onClick={() => setShowRightSidebar(false)}
                className="lg:hidden w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
              >
                ×
              </button>
          </div>

                        {/* Today's Tasks Card */}
            <div className="flex-1 min-h-0">
              <div className="bg-white rounded p-1 shadow-lg border-2 border-black h-full flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-black text-xs flex items-center">
                    ✅ משימות
            </h3>
                  <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded-full font-bold">
                    {pendingTasks}
                  </span>
                </div>

                {/* Tasks Preview */}
                <div className="flex-1 mb-1 overflow-hidden">
                  {tasks.filter(t => !t.done).slice(0, 2).map((task, index) => (
                    <div 
                      key={task.id} 
                      className="flex items-center space-x-1 p-0.5 bg-gray-50 rounded mb-0.5 text-xs"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                      <span className="flex-1 truncate">{task.text}</span>
                </div>
              ))}
              {pendingTasks === 0 && (
                    <div className="text-center py-1 bg-green-50 rounded">
                      <div className="text-xs">🎉</div>
                      <p className="text-green-600 font-bold text-xs">הושלם!</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-1 mb-1">
                  <div 
                    className="bg-green-500 rounded-full h-1 transition-all duration-300"
                    style={{ width: `${tasks.length > 0 ? ((tasks.filter(t => t.done).length / tasks.length) * 100) : 0}%` }}
                  />
                </div>

                {/* Expand Button */}
                <button className="w-full py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-all duration-200 font-bold">
                  🔍 משימות
                </button>
              </div>
            </div>

                                    {/* Daily Recommendation Widget */}
            <div className="flex-1 min-h-0">
              <DailyRecommendation 
                className="h-full" 
                onOpenDetails={(type) => console.log('Open recommendation:', type)}
              />
          </div>

                        {/* Today's Events Card */}
            <div className="flex-1 min-h-0">
              <div className="bg-white rounded p-1 shadow-lg border-2 border-black h-full flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-black text-xs flex items-center">
                    📅 אירועים
            </h3>
                  <span className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded-full font-bold">
                    {todayEvents}
                  </span>
                </div>

                {/* Events Preview */}
                <div className="flex-1 mb-1 overflow-hidden">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                return eventDate.toDateString() === new Date().toDateString()
                  }).slice(0, 2).map((event, index) => (
                    <div 
                      key={event.id} 
                      className="flex items-center space-x-1 p-0.5 bg-purple-50 rounded mb-0.5"
                    >
                      <div className="bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-bold min-w-[25px] text-center">
                        {event.time.substring(0,2)}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium text-xs truncate block">
                          {event.title}
                        </span>
                      </div>
                      <span className="text-xs">
                        {event.type === 'meeting' ? '👥' : 
                         event.type === 'task' ? '✅' : 
                         event.type === 'payment' ? '💸' : '🎯'}
                      </span>
                </div>
              ))}
              {todayEvents === 0 && (
                    <div className="text-center py-1 bg-purple-50 rounded">
                      <div className="text-xs">📅</div>
                      <p className="text-purple-600 font-bold text-xs">פנוי! 🏖️</p>
                    </div>
                  )}
                </div>

                {/* Expand Button */}
                <button className="w-full py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-all duration-200 font-bold">
                  🔍 אירועים
                </button>
              </div>
            </div>

                        {/* Gmail Widget */}
            <div className="flex-1 min-h-0">
              <GmailWidget 
                className="h-full" 
                onOpenDetails={(type) => console.log('Open Gmail:', type)}
              />
            </div>

            {/* Gmail Calendar Integration Widget */}
            <div className="flex-1 min-h-0">
              <GmailCalendarIntegration 
                className="h-full" 
                onEventCreated={() => {
                  console.log('Event created from Gmail!')
                  // כאן אפשר להוסיף רענון לוח השנה או הצגת הודעה
                }}
              />
            </div>
          </motion.div>
        </motion.div>
          </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  📅 אירוע חדש
            </h3>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">כותרת האירוע</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="פגישה עם לקוח, יום הולדת..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שעה</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="meeting">👥 פגישה</option>
                      <option value="task">✅ משימה</option>
                      <option value="personal">🏃 אישי</option>
                      <option value="payment">💸 תשלום</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="משרד, בית קפה, זום..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title.trim() || !newEvent.time.trim()}
                  className="flex-1 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✅ הוסף אירוע
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAddEvent(false)
                    setNewEvent({ title: '', time: '', location: '', type: 'meeting' })
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ביטול
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Financial Advisor Modal */}
      <AnimatePresence>
        {showStockAdvisor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-6xl h-full max-h-[90vh] shadow-2xl overflow-hidden border border-gray-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <h2 className="text-2xl font-bold">🧠 יועץ פיננסי מתקדם</h2>
                <button
                  onClick={() => setShowStockAdvisor(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  ❌
                </button>
              </div>
              <div className="h-[calc(100%-5rem)] overflow-auto">
                <StockPortfolio />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[90vh] shadow-2xl overflow-hidden border border-gray-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <h2 className="text-2xl font-bold">📅 לוח השנה החכם והצבעוני</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  ❌
                </button>
              </div>
              <div className="h-[calc(100%-5rem)]">
                <Calendar compact={false} />
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 