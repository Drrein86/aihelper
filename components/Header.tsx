'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'

interface HeaderProps {
  userName?: string
  greeting?: string
}

export default function Header({ userName, greeting }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, tasks, events, notifications } = useStore()
  
  // Use store data if no props provided
  const displayName = userName || user.name
  const unreadNotifications = notifications.filter(n => !n.read).length
  const pendingTasks = tasks.filter(t => !t.done).length
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate.toDateString() === new Date().toDateString()
  }).length

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'בוקר טוב'
    if (hour < 18) return 'אחר הצהריים טובים'
    return 'ערב טוב'
  }

  return (
    <motion.header 
      className="header-gradient h-20 flex items-center justify-between px-6 shadow-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Right Side - Greeting and Info */}
      <div className="flex items-center space-x-6">
        <motion.div 
          className="text-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold">
            {greeting || getTimeBasedGreeting()}, {displayName}! 🌟
          </h1>
          <p className="text-white/80 text-sm">
            הנה היום שלך + סיכום מהיר
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-white/20 backdrop-blur-sm rounded-full p-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="text-3xl">🤖</span>
        </motion.div>
      </div>

      {/* Center - Quick Stats */}
      <motion.div 
        className="flex items-center space-x-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
          <div className="text-xs text-white/80">שעה נוכחית</div>
        </div>
        
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="text-lg font-semibold">{pendingTasks}</div>
          <div className="text-xs text-white/80">משימות ממתינות</div>
        </div>
        
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="text-lg font-semibold">{todayEvents}</div>
          <div className="text-xs text-white/80">אירועים היום</div>
        </div>
        
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="text-lg font-semibold">{unreadNotifications}</div>
          <div className="text-xs text-white/80">התראות חדשות</div>
        </div>
      </motion.div>

      {/* Left Side - Date and Settings */}
      <motion.div 
        className="flex items-center space-x-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="text-left">
          <div className="text-sm font-medium">{formatDate(currentTime)}</div>
          <div className="text-xs text-white/80">
            📅 פגישה עם משי ב-14:00
          </div>
        </div>
        
        <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300">
          <span className="text-xl">🔔</span>
        </button>
        
        <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300">
          <span className="text-xl">⚙️</span>
        </button>
      </motion.div>
    </motion.header>
  )
} 