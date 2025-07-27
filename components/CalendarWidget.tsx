'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { he } from 'date-fns/locale'
import { getTodayEvents, getWeekEvents, generateFallbackCalendarEvents, type CalendarEvent } from '@/services/google-calendar'
import { isAuthenticated } from '@/services/google-auth'

interface CalendarWidgetProps {
  className?: string
  onOpenCalendar: () => void
}

export default function CalendarWidget({ className = '', onOpenCalendar }: CalendarWidgetProps) {
  const { events: storeEvents } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadCalendarEvents()
  }, [])

  const loadCalendarEvents = async () => {
    setLoading(true)
    
    try {
      if (isAuthenticated()) {
        // טעינת אירועים אמיתיים מ-Google Calendar
        const todayEvents = await getTodayEvents()
        setGoogleEvents(todayEvents)
      } else {
        // נתוני fallback
        setGoogleEvents(generateFallbackCalendarEvents())
      }
    } catch (error) {
      console.error('Error loading calendar events:', error)
      // נתוני fallback במקרה של שגיאה
      setGoogleEvents(generateFallbackCalendarEvents())
    }
    
    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className={`bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-lg border-2 border-blue-400 ${className}`}>
        <div className="p-3 text-center text-blue-600">טוען לוח שנה...</div>
      </div>
    )
  }

  // Get today's events - combine Google Calendar events with store events
  const allEvents = [...googleEvents, ...storeEvents]
  const todayEvents = allEvents.filter((event: any) => {
    const eventDate = new Date(event.date || event.start)
    return isSameDay(eventDate, currentDate)
  })

  // Get this week's dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get event colors
  const getEventColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-500',
      personal: 'bg-green-500',
      work: 'bg-orange-500',
      health: 'bg-red-500',
      other: 'bg-purple-500'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  return (
    <div className={`bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-lg border-2 border-blue-400 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-2 border-b border-blue-300 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-blue-800 text-lg flex items-center">
            📅 לוח השנה שלי
          </h3>
          <motion.button
            onClick={onOpenCalendar}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all duration-200 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📆 לוח מלא
          </motion.button>
        </div>
      </div>

      <div className="p-1 flex-1 min-h-0 overflow-hidden">
        {/* Ultra Compact Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded p-1 border border-blue-300 h-full flex flex-col">
          {/* Today's Date */}
          <div className="text-center mb-1">
            <div className="text-lg font-bold text-blue-800">
              {format(currentDate, 'd', { locale: he })}
            </div>
            <div className="text-xs text-blue-600">
              {todayEvents.length} אירועים
            </div>
          </div>

          {/* Today's Event Preview */}
          <div className="flex-1 mb-1">
            {todayEvents.length === 0 ? (
              <div className="bg-blue-50 rounded p-1 text-center">
                <div className="text-xs text-gray-500">😌 פנוי</div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded p-1">
                <div className="text-xs font-bold truncate">{todayEvents[0].title}</div>
                <div className="text-xs text-gray-500">
                  🕐 {(todayEvents[0] as any).time || format(new Date((todayEvents[0] as any).start), 'HH:mm')}
                </div>
                {todayEvents.length > 1 && (
                  <div className="text-xs text-blue-600">+{todayEvents.length - 1}</div>
                )}
              </div>
            )}
          </div>

          {/* Expand Button */}
          <motion.button
            onClick={onOpenCalendar}
            className="w-full py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all duration-200 font-bold mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 לוח שנה
          </motion.button>
        </div>
      </div>
    </div>
  )
} 