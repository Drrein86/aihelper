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

  if (!mounted) {
    return (
      <div className="min-h-screen flex-center" style={{ background: 'linear-gradient(to bottom right, var(--color-background), var(--color-background-secondary), var(--color-background-tertiary))' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-center flex-col gap-6"
        >
          <div className="animate-glow">
            <Icons.Zap className="text-white" size={64} />
          </div>
          <div className="text-gradient text-2xl font-bold">טוען עוזר חכם...</div>
                                     <div className="w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <motion.div
                              className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-light))' }}
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
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0" style={{ background: 'linear-gradient(to bottom right, var(--color-background), var(--color-background-secondary), var(--color-background-tertiary))' }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Modern Header */}
      <motion.header 
        className="relative z-50 glass border-b border-white/10 backdrop-blur-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <div className="container py-4">
          <div className="flex-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <div className="flex lg:hidden gap-2">
                <motion.button 
                  onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                  className="btn-ghost p-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icons.TrendingUp size={20} />
                </motion.button>
                <motion.button 
                  onClick={() => setShowRightSidebar(!showRightSidebar)}
                  className="btn-ghost p-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icons.Calendar size={20} />
                </motion.button>
              </div>

              {/* Logo & Brand */}
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl flex-center shadow-lg animate-glow" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-light))' }}>
                  <Icons.Zap className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gradient leading-tight">
                    {getTimeBasedGreeting()}, {user.name}
                  </h1>
                  <p className="text-sm text-secondary font-medium">העוזר החכם שלך מוכן לעזור</p>
                </div>
              </motion.div>
            </div>

            {/* Center Section */}
            <div className="hidden md:flex items-center gap-4">
              {/* Live Clock */}
              <motion.div
                className="glass-hover px-4 py-2 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xl font-bold text-gradient">
                  {currentTime?.toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) || '--:--'}
                </div>
                <div className="text-xs text-secondary text-center">
                  {currentTime?.toLocaleDateString('he-IL', { weekday: 'short' })}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <div className="flex gap-2">
                {[
                  { icon: Icons.Calendar, value: todayEvents, label: 'אירועים', color: 'text-blue-400' },
                  { icon: Icons.Check, value: pendingTasks, label: 'משימות', color: 'text-green-400' },
                  { icon: Icons.Bell, value: unreadNotifications, label: 'התראות', color: 'text-orange-400' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-hover px-3 py-2 rounded-lg flex items-center gap-2"
                  >
                    <stat.icon className={stat.color} size={16} />
                    <div>
                      <div className="text-sm font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-secondary">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <GoogleAuthButton className="hidden md:flex" />
              
              {/* Status Indicator */}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-400"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Left Sidebar - Enhanced */}
        <AnimatePresence>
          {(showLeftSidebar || window.innerWidth >= 1024) && (
            <motion.div 
              className={`${showLeftSidebar ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block'}`}
              onClick={() => setShowLeftSidebar(false)}
            >
              <motion.div 
                className={`
                  ${leftSidebarExpanded ? 'w-96' : 'w-80'} 
                  ${showLeftSidebar ? 'w-80 fixed left-0 top-0 h-full z-50' : ''}
                  glass border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto
                  transition-all duration-300
                `}
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sidebar Header */}
                <div className="flex-between">
                  <h2 className="text-lg font-bold text-gradient">ניתוח כספי</h2>
                  <div className="flex gap-2">
                    <motion.button 
                      onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
                      className="btn-ghost p-2 hidden lg:flex"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icons.ChevronRight 
                        className={`transition-transform ${leftSidebarExpanded ? 'rotate-180' : ''}`}
                        size={16}
                      />
                    </motion.button>
                    <motion.button 
                      onClick={() => setShowLeftSidebar(false)}
                      className="btn-ghost p-2 lg:hidden"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icons.Close size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Widgets */}
                <motion.div
                  className="flex-1 space-y-6"
                  layout
                >
                  <StockSummary 
                    className="h-64" 
                    onOpenAdvisor={() => setShowStockAdvisor(true)}
                  />
                  <CalendarWidget 
                    className="h-48" 
                    onOpenCalendar={() => setShowCalendar(true)}
                  />
                                     <InspirationQuotes 
                     className="h-40" 
                     onOpenDetails={(type) => console.log('Open inspiration:', type)}
                   />
                   <DailyChallenges 
                     className="h-40" 
                     onOpenDetails={(type) => console.log('Open challenges:', type)}
                   />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content - Enhanced Chat */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="h-full p-6">
            <div className="h-full max-w-4xl mx-auto">
              <ChatBot embedded={true} fullHeight={true} />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quick Actions Float */}
        <motion.div 
          className="fixed bottom-6 left-6 z-40 lg:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="glass rounded-2xl p-3 shadow-2xl">
            <div className="flex gap-3">
              {[
                { icon: Icons.Plus, action: 'new-task', color: 'text-blue-400' },
                { icon: Icons.Calendar, action: 'new-event', color: 'text-green-400' },
                { icon: Icons.DollarSign, action: 'update-finance', color: 'text-yellow-400' },
                { icon: Icons.TrendingUp, action: 'reports', color: 'text-purple-400' }
              ].map((action, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="btn-primary w-12 h-12 rounded-xl flex-center shadow-lg"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <action.icon className={action.color} size={20} />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar - Enhanced */}
        <AnimatePresence>
          {(showRightSidebar || window.innerWidth >= 1024) && (
            <motion.div 
              className={`${showRightSidebar ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block'}`}
              onClick={() => setShowRightSidebar(false)}
            >
              <motion.div 
                className={`
                  ${rightSidebarExpanded ? 'w-96' : 'w-80'} 
                  ${showRightSidebar ? 'w-80 fixed right-0 top-0 h-full z-50' : ''}
                  glass border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto
                  transition-all duration-300
                `}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sidebar Header */}
                <div className="flex-between">
                  <h2 className="text-lg font-bold text-gradient">משימות ואירועים</h2>
                  <div className="flex gap-2">
                    <motion.button 
                      onClick={() => setRightSidebarExpanded(!rightSidebarExpanded)}
                      className="btn-ghost p-2 hidden lg:flex"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icons.ChevronRight 
                        className={`transition-transform ${rightSidebarExpanded ? '' : 'rotate-180'}`}
                        size={16}
                      />
                    </motion.button>
                    <motion.button 
                      onClick={() => setShowRightSidebar(false)}
                      className="btn-ghost p-2 lg:hidden"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icons.Close size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Tasks Card */}
                <motion.div className="card space-y-4">
                  <div className="flex-between">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                      <Icons.Check size={16} />
                      משימות היום
                    </h3>
                    <span className="btn-secondary px-2 py-1 text-xs font-bold">
                      {pendingTasks}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {tasks.filter(t => !t.done).slice(0, 3).map((task, index) => (
                      <motion.div 
                        key={task.id}
                        className="glass-hover p-3 rounded-lg flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-400' : 
                          task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <span className="flex-1 text-sm truncate">{task.text}</span>
                      </motion.div>
                    ))}
                    {pendingTasks === 0 && (
                      <div className="text-center py-4 glass rounded-lg">
                        <Icons.Check className="text-green-400 mx-auto mb-2" size={24} />
                        <p className="text-green-400 font-bold text-sm">כל המשימות הושלמו!</p>
                      </div>
                    )}
                  </div>

                                     <div className="rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${tasks.length > 0 ? ((tasks.filter(t => t.done).length / tasks.length) * 100) : 0}%` 
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </motion.div>

                {/* Enhanced Events Card */}
                <motion.div className="card space-y-4">
                  <div className="flex-between">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                      <Icons.Calendar size={16} />
                      אירועים היום
                    </h3>
                    <span className="btn-secondary px-2 py-1 text-xs font-bold">
                      {todayEvents}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {events.filter(e => {
                      const eventDate = new Date(e.date)
                      return eventDate.toDateString() === new Date().toDateString()
                    }).slice(0, 3).map((event, index) => (
                      <motion.div 
                        key={event.id}
                        className="glass-hover p-3 rounded-lg flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="btn-primary px-2 py-1 text-xs font-bold rounded-lg min-w-[40px] text-center">
                          {event.time.substring(0,5)}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block truncate">{event.title}</span>
                        </div>
                        <span className="text-lg">
                          {event.type === 'meeting' ? '👥' : 
                           event.type === 'task' ? '✅' : 
                           event.type === 'payment' ? '💸' : '🎯'}
                        </span>
                      </motion.div>
                    ))}
                    {todayEvents === 0 && (
                      <div className="text-center py-4 glass rounded-lg">
                        <Icons.Calendar className="text-blue-400 mx-auto mb-2" size={24} />
                        <p className="text-blue-400 font-bold text-sm">יום פנוי!</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                                 {/* Daily Recommendation */}
                 <DailyRecommendation 
                   className="h-48" 
                   onOpenDetails={(type) => console.log('Open recommendation:', type)}
                 />

                                 {/* Gmail & Calendar Integration */}
                 <GmailWidget />
                 <GmailCalendarIntegration />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Modals */}
      <AnimatePresence>
        {/* Add Event Modal */}
        {showAddEvent && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div 
              className="glass w-full max-w-md rounded-2xl p-6 border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between mb-6">
                <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
                  <Icons.Calendar size={20} />
                  אירוע חדש
                </h3>
                <motion.button
                  onClick={() => setShowAddEvent(false)}
                  className="btn-ghost p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.Close size={16} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">כותרת האירוע</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="פגישה עם לקוח, יום הולדת..."
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">שעה</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">סוג</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="input"
                    >
                      <option value="meeting">👥 פגישה</option>
                      <option value="task">✅ משימה</option>
                      <option value="personal">🏃 אישי</option>
                      <option value="payment">💸 תשלום</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">מיקום</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="משרד, בית קפה, זום..."
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title.trim() || !newEvent.time.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icons.Plus size={16} />
                  הוסף אירוע
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAddEvent(false)
                    setNewEvent({ title: '', time: '', location: '', type: 'meeting' })
                  }}
                  className="btn-secondary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ביטול
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stock Advisor Modal */}
        {showStockAdvisor && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStockAdvisor(false)}
          >
            <motion.div 
              className="glass w-full max-w-6xl h-full max-h-[90vh] rounded-2xl overflow-hidden border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-gradient flex items-center gap-3">
                  <Icons.TrendingUp size={24} />
                  יועץ פיננסי מתקדם
                </h2>
                <motion.button
                  onClick={() => setShowStockAdvisor(false)}
                  className="btn-ghost p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.Close size={20} />
                </motion.button>
              </div>
              <div className="h-[calc(100%-5rem)] overflow-auto">
                <StockPortfolio />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCalendar(false)}
          >
            <motion.div 
              className="glass w-full max-w-7xl h-full max-h-[90vh] rounded-2xl overflow-hidden border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-gradient flex items-center gap-3">
                  <Icons.Calendar size={24} />
                  לוח השנה החכם
                </h2>
                <motion.button
                  onClick={() => setShowCalendar(false)}
                  className="btn-ghost p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.Close size={20} />
                </motion.button>
              </div>
              <div className="h-[calc(100%-5rem)]">
                <Calendar compact={false} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 