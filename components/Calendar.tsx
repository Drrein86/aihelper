'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { he } from 'date-fns/locale'
import { useStore } from '@/store/useStore'

interface CalendarProps {
  compact?: boolean
}

export default function Calendar({ compact = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('month')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    type: 'meeting' as const,
    description: ''
  })
  
  const { events, addEvent, deleteEvent, updateEvent, addNotification } = useStore()

  // Handle add event
  const handleAddEvent = () => {
    if (newEvent.title && newEvent.time) {
      const event = {
        id: Date.now(),
        title: newEvent.title,
        date: selectedDate,
        time: newEvent.time,
        location: newEvent.location,
        type: newEvent.type,
        description: newEvent.description
      }
      
      addEvent(event)
      addNotification({
        title: 'אירוע נוסף! 📅',
        message: `${newEvent.title} נוסף ב-${format(selectedDate, 'dd/MM/yyyy')} ב-${newEvent.time}`,
        type: 'success',
        read: false
      })
      
      setNewEvent({
        title: '',
        time: '',
        location: '',
        type: 'meeting',
        description: ''
      })
      setShowAddEvent(false)
    }
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return isSameDay(eventDate, date)
    })
  }

  // Navigation helpers
  const navigateMonth = (direction: 1 | -1) => {
    setCurrentDate(direction === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
  }

  const navigateWeek = (direction: 1 | -1) => {
    setCurrentDate(addDays(currentDate, direction * 7))
  }

  const navigateDay = (direction: 1 | -1) => {
    setCurrentDate(addDays(currentDate, direction))
  }
  
  // Filter events for current date
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return isSameDay(eventDate, currentDate)
  })

  // Generate calendar month view
  const generateMonthCalendar = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 41) // 6 weeks

    const days = []
    let day = new Date(startDate)

    while (day <= endDate) {
      days.push(new Date(day))
      day.setDate(day.getDate() + 1)
    }

    return days
  }

  // Render Month View
  const renderMonthView = () => {
    const monthDays = generateMonthCalendar()
    const weekDays = ['ראש', 'שני', 'שלי', 'רבי', 'חמי', 'שיש', 'שבת']
    
    return (
      <div className="p-4">
        {/* Month Calendar Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Week Headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-600 to-purple-600">
            {weekDays.map((day, index) => (
              <div key={index} className="p-4 text-center text-white font-bold text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, index) => {
              const dayEvents = getEventsForDate(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isTodayDay = isToday(day)
              const isSelected = isSameDay(day, selectedDate)
              
              return (
                <motion.div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer transition-all duration-200 ${
                    isCurrentMonth 
                      ? 'bg-white hover:bg-blue-50' 
                      : 'bg-gray-50 text-gray-400'
                  } ${
                    isTodayDay 
                      ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-500' 
                      : ''
                  } ${
                    isSelected 
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-500' 
                      : ''
                  }`}
                  whileHover={{ scale: isCurrentMonth ? 1.02 : 1 }}
                  onClick={() => {
                    setSelectedDate(day)
                    setCurrentDate(day)
                  }}
                  onDoubleClick={() => {
                    setSelectedDate(day)
                    setShowAddEvent(true)
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${
                      isTodayDay 
                        ? 'text-blue-700' 
                        : isCurrentMonth 
                        ? 'text-gray-700' 
                        : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <motion.div
                        key={event.id}
                        className={`p-1 rounded text-xs font-medium truncate ${getEventColor(event.type)} cursor-pointer`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: eventIndex * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEventDetails(event)
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">{getEventIcon(event.type)}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="text-xs opacity-80">
                          {event.time}
                        </div>
                      </motion.div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-center text-gray-500 bg-gray-100 rounded p-1">
                        +{dayEvents.length - 3} עוד
                      </div>
                    )}
                  </div>
                  
                  {/* Add Event Hint */}
                  {dayEvents.length === 0 && isCurrentMonth && (
                    <div className="text-xs text-gray-400 text-center mt-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                      לחץ פעמיים להוספת אירוע
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
        
        {/* Month Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border border-blue-300">
            <div className="text-sm text-blue-700 font-medium">פגישות החודש</div>
            <div className="text-2xl font-bold text-blue-800">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear() &&
                       e.type === 'meeting'
              }).length}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border border-green-300">
            <div className="text-sm text-green-700 font-medium">משימות החודש</div>
            <div className="text-2xl font-bold text-green-800">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear() &&
                       e.type === 'task'
              }).length}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl border border-purple-300">
            <div className="text-sm text-purple-700 font-medium">אירועים אישיים</div>
            <div className="text-2xl font-bold text-purple-800">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear() &&
                       e.type === 'personal'
              }).length}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-100 to-orange-200 p-4 rounded-xl border border-orange-300">
            <div className="text-sm text-orange-700 font-medium">ימים עמוסים</div>
            <div className="text-2xl font-bold text-orange-800">
              {Array.from(new Set(events.filter(e => {
                const eventDate = new Date(e.date)
                return eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear()
              }).map(e => new Date(e.date).getDate()))).length}
            </div>
          </div>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
          <h4 className="font-bold text-indigo-800 mb-2">💡 טיפים מהירים</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-indigo-700">
            <div>• לחץ פעמיים על יום כדי להוסיף אירוע</div>
            <div>• לחץ על אירוע כדי לראות פרטים</div>
            <div>• השתמש בחצים לניווט מהיר</div>
            <div>• צבעים מציינים סוגי אירועים שונים</div>
          </div>
        </div>
      </div>
    )
  }

  const getEventColor = (type: string, priority?: string) => {
    const baseColors = {
      meeting: 'from-blue-400 to-blue-600 border-blue-500 text-white shadow-blue-300',
      task: 'from-green-400 to-green-600 border-green-500 text-white shadow-green-300',
      payment: 'from-red-400 to-red-600 border-red-500 text-white shadow-red-300',
      personal: 'from-purple-400 to-purple-600 border-purple-500 text-white shadow-purple-300',
      work: 'from-orange-400 to-orange-600 border-orange-500 text-white shadow-orange-300',
      health: 'from-pink-400 to-pink-600 border-pink-500 text-white shadow-pink-300',
      travel: 'from-teal-400 to-teal-600 border-teal-500 text-white shadow-teal-300',
      social: 'from-yellow-400 to-yellow-600 border-yellow-500 text-white shadow-yellow-300'
    }
    
    let color = baseColors[type as keyof typeof baseColors] || baseColors.personal
    
    // Add priority styling
    if (priority === 'high') {
      color = color.replace('shadow-', 'shadow-lg shadow-')
    } else if (priority === 'low') {
      color = color.replace('from-', 'from-opacity-70 from-').replace('to-', 'to-opacity-70 to-')
    }
    
    return `bg-gradient-to-r ${color}`
  }

  const getEventIcon = (type: string) => {
    const icons = {
      meeting: '👥',
      task: '✅',
      payment: '💸',
      personal: '🎯',
      work: '💼',
      health: '🏥',
      travel: '✈️',
      social: '🎉',
      food: '🍽️',
      sport: '⚽',
      study: '📚'
    }
    return icons[type as keyof typeof icons] || '📅'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500'
      case 'medium': return 'border-l-4 border-yellow-500'
      case 'low': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-400'
    }
  }

  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 8) // 8:00 to 22:00

  const handleTimeSlotClick = (hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`
    setNewEvent(prev => ({ ...prev, time: timeString }))
    setShowAddEvent(true)
  }

  const renderDayView = () => (
    <div className="flex-1 bg-gray-50/30 rounded-lg">
      <div className="grid grid-cols-1 gap-1 h-full">
        {timeSlots.map(hour => {
          const timeString = `${hour.toString().padStart(2, '0')}:00`
          const eventsAtThisTime = todayEvents.filter(event => 
            event.time.startsWith(hour.toString().padStart(2, '0'))
          )

          return (
            <div key={hour} className="flex border-b border-gray-200/50 min-h-[60px] relative hover:bg-gray-50/50 transition-all duration-200">
              <div className="w-16 flex-shrink-0 text-sm text-gray-600 p-2 text-center border-l border-gray-300/50 bg-gradient-to-r from-gray-50 to-white">
                <div className="font-bold">{hour}</div>
                <div className="text-xs opacity-70">:00</div>
              </div>
              <div className="flex-1 p-2 relative">
                {eventsAtThisTime.map(event => (
                  <motion.div
                    key={event.id}
                    className={`mb-1 p-3 rounded-xl border-2 ${getEventColor(event.type)} cursor-pointer hover:shadow-lg transition-all duration-300 shadow-md`}
                    initial={{ scale: 0.95, opacity: 0, x: -10 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{event.title}</div>
                        <div className="text-xs opacity-80 mt-1">
                          ⏰ {event.time} {event.duration && `(${event.duration} דק')`}
                          {event.location && ` • 📍 ${event.location}`}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEvent(event.id)
                        }}
                        className="text-red-500 hover:text-red-700 opacity-60 hover:opacity-100 transition-all duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
                {eventsAtThisTime.length === 0 && (
                  <motion.div 
                    className="h-full flex items-center justify-center text-gray-400 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-300 cursor-pointer group border-2 border-dashed border-transparent hover:border-blue-300"
                    onClick={() => handleTimeSlotClick(hour)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center opacity-60 group-hover:opacity-100 transition-all duration-200">
                      <div className="text-lg mb-1">➕</div>
                      <div>הוסף אירוע</div>
                  </div>
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="flex-1 bg-gray-50/30 rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-1 h-full">
          {/* Time column */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-r border-gray-300">
            <div className="h-12 border-b border-gray-200 bg-black text-white flex items-center justify-center font-bold text-sm">
              שעה
            </div>
            {timeSlots.map(hour => (
              <div key={hour} className="h-12 border-b border-gray-100 text-xs text-gray-600 p-1 text-center flex items-center justify-center font-medium">
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          {days.map(day => (
            <div key={day.toISOString()} className="border-r border-gray-200/50">
              <div className={`h-12 border-b border-gray-200 p-2 text-center transition-all duration-300 ${
                isToday(day) ? 'bg-gradient-to-r from-black to-gray-800 text-white shadow-lg' : 'bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-purple-50'
              }`}>
                <div className="text-xs font-bold">
                  {format(day, 'EEE', { locale: he })}
                </div>
                <div className={`text-lg font-bold ${isToday(day) ? 'text-white' : 'text-gray-800'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              {timeSlots.map(hour => (
                <div key={`${day.toISOString()}-${hour}`} className="h-12 border-b border-gray-100 p-1 relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  {isSameDay(day, currentDate) && events.filter(event => 
                    event.time.startsWith(hour.toString().padStart(2, '0'))
                  ).map(event => (
                    <motion.div
                      key={event.id}
                      className={`text-xs p-1 rounded-lg ${getEventColor(event.type)} truncate shadow-sm`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {getEventIcon(event.type)} {event.title}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Compact view - this is the widget for the main page
  if (compact) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-xl shadow-lg border border-gray-200"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Compact Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-black to-gray-800 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              📅 {format(currentDate, 'EEEE, d MMMM', { locale: he })}
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDay(-1)}
                className="p-1 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                ◀
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-md"
              >
                היום
              </button>
              <button
                onClick={() => navigateDay(1)}
                className="p-1 hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Compact Events List */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {todayEvents.length > 0 ? (
            todayEvents.slice(0, 3).map(event => (
              <motion.div
                key={event.id}
                className={`p-2 rounded-lg border-2 text-xs ${getEventColor(event.type)} cursor-pointer hover:shadow-md transition-all duration-300`}
                initial={{ scale: 0.9, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEventDetails(event)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <div className="font-bold">{event.title}</div>
                    <div className="opacity-80 text-xs">
                      ⏰ {event.time} {event.location && `• 📍 ${event.location}`}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-3xl mb-2">📅</div>
              <div>אין אירועים היום</div>
              <div className="text-xs text-gray-400 mt-1">זמן מושלם להרגע! 😌</div>
            </div>
          )}
          {todayEvents.length > 3 && (
            <div className="text-center text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-gray-200">
              ✨ +{todayEvents.length - 3} אירועים נוספים
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Full Calendar View - Smart and Interactive
  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 h-full flex flex-col rounded-xl shadow-xl border border-gray-200"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Calendar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">
              🗓️ {format(currentDate, 'MMMM yyyy', { locale: he })}
            </h2>
            <div className="text-sm text-white/80 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {format(currentDate, 'EEEE, d MMMM', { locale: he })}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 ${
                  view === 'day' 
                    ? 'bg-white text-gray-800 shadow-sm font-bold' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                📅 יום
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 ${
                  view === 'week' 
                    ? 'bg-white text-gray-800 shadow-sm font-bold' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                📊 שבוע
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 ${
                  view === 'month' 
                    ? 'bg-white text-gray-800 shadow-sm font-bold' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                📆 חודש
              </button>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
                title="חודש קודם"
              >
                ⏪
              </button>
            <button
                onClick={() => view === 'month' ? navigateMonth(-1) : view === 'week' ? navigateWeek(-1) : navigateDay(-1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-md font-bold"
            >
                🏠 היום
            </button>
            <button
                onClick={() => view === 'month' ? navigateMonth(1) : view === 'week' ? navigateWeek(1) : navigateDay(1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
            >
              ▶
            </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
                title="חודש הבא"
              >
                ⏩
              </button>
            </div>

            {/* Add Event Button */}
            <motion.button
              onClick={() => {
                setSelectedDate(currentDate)
                setShowAddEvent(true)
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ אירוע חדש
            </motion.button>
          </div>
        </div>

        {/* Enhanced Smart Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-sm border border-blue-400/40 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-200">👥 פגישות</div>
            <div className="text-2xl font-bold text-blue-100">
              {events.filter(e => e.type === 'meeting').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 backdrop-blur-sm border border-green-400/40 rounded-lg p-3 text-center">
            <div className="text-xs text-green-200">✅ משימות</div>
            <div className="text-2xl font-bold text-green-100">
              {events.filter(e => e.type === 'task').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-sm border border-purple-400/40 rounded-lg p-3 text-center">
            <div className="text-xs text-purple-200">🎯 אישי</div>
            <div className="text-2xl font-bold text-purple-100">
              {events.filter(e => e.type === 'personal').length}
             </div>
           </div>
          <div className="bg-gradient-to-br from-red-500/30 to-red-600/30 backdrop-blur-sm border border-red-400/40 rounded-lg p-3 text-center">
            <div className="text-xs text-red-200">💸 תשלומים</div>
            <div className="text-2xl font-bold text-red-100">
              {events.filter(e => e.type === 'payment').length}
             </div>
           </div>
          <div className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-sm border border-yellow-400/40 rounded-lg p-3 text-center">
            <div className="text-xs text-yellow-200">📊 השבוע</div>
            <div className="text-2xl font-bold text-yellow-100">
              {events.filter(e => {
                const eventDate = new Date(e.date)
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
                const weekEnd = addDays(weekStart, 6)
                return eventDate >= weekStart && eventDate <= weekEnd
              }).length}
             </div>
           </div>
         </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>

      {/* Enhanced Add Event Modal */}
      <AnimatePresence>
      {showAddEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                ✨ אירוע חדש
                <span className="text-sm font-normal text-gray-500 mr-2">
                  ל-{format(selectedDate, 'dd/MM/yyyy')}
                </span>
              </h3>
            
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">כותרת האירוע</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הקלד כותרת לאירוע"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">שעה</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סוג אירוע</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="meeting">👥 פגישה</option>
                      <option value="task">✅ משימה</option>
                      <option value="personal">🎯 אישי</option>
                      <option value="payment">💸 תשלום</option>
                      <option value="work">💼 עבודה</option>
                      <option value="health">🏥 בריאות</option>
                      <option value="travel">✈️ נסיעה</option>
                      <option value="social">🎉 חברתי</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  

              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מיקום</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="מיקום האירוע (אופציונלי)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">תיאור</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="תיאור האירוע (אופציונלי)"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
                <motion.button
                onClick={handleAddEvent}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!newEvent.title || !newEvent.time}
                >
                  ✅ הוסף אירוע
                </motion.button>
                <motion.button
                onClick={() => {
                  setShowAddEvent(false)
                    setNewEvent({
                      title: '',
                      time: '',
                      location: '',
                      type: 'meeting',
                      description: ''
                    })
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ❌ ביטול
                </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showEventDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  פרטי האירוע
                </h3>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  ❌
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${getEventColor(showEventDetails.type, showEventDetails.priority)}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventIcon(showEventDetails.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{showEventDetails.title}</h4>
                      <div className="text-sm opacity-90">
                        📅 {format(new Date(showEventDetails.date), 'dd/MM/yyyy', { locale: he })} • 
                        ⏰ {showEventDetails.time}
                      </div>
                    </div>
                  </div>
                  {showEventDetails.location && (
                    <div className="mt-2 text-sm opacity-90">
                      📍 {showEventDetails.location}
                    </div>
                  )}
                  {showEventDetails.description && (
                    <div className="mt-2 text-sm opacity-90">
                      📝 {showEventDetails.description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    deleteEvent(showEventDetails.id)
                    setShowEventDetails(null)
                    addNotification({
                      title: 'אירוע נמחק! 🗑️',
                      message: `${showEventDetails.title} נמחק בהצלחה`,
                      type: 'info',
                      read: false
                    })
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🗑️ מחק אירוע
                </motion.button>
                <motion.button
                  onClick={() => setShowEventDetails(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ✅ סגור
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 