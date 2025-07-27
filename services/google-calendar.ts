'use client'

import { tokenStorage } from './google-auth'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
  attendees?: string[]
  type: 'meeting' | 'task' | 'payment' | 'personal' | 'work'
  color?: string
}

// קבלת אירועים מ-Google Calendar
export async function getCalendarEvents(
  timeMin?: string, 
  timeMax?: string, 
  maxResults: number = 20
): Promise<CalendarEvent[]> {
  const tokens = tokenStorage.get()
  if (!tokens) return []

  try {
    // ברירת מחדל: שבוע קדימה
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const params = new URLSearchParams({
      timeMin: timeMin || now.toISOString(),
      timeMax: timeMax || weekFromNow.toISOString(),
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime'
    })

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }

    const data = await response.json()
    if (!data.items) return []

    const events: CalendarEvent[] = data.items.map((item: any) => {
      // קביעת סוג האירוע לפי הכותרת
      let type: CalendarEvent['type'] = 'personal'
      const title = item.summary?.toLowerCase() || ''
      
      if (title.includes('meeting') || title.includes('פגישה') || title.includes('ישיבה')) {
        type = 'meeting'
      } else if (title.includes('task') || title.includes('משימה') || title.includes('עבודה')) {
        type = 'task'
      } else if (title.includes('payment') || title.includes('תשלום') || title.includes('כסף')) {
        type = 'payment'
      } else if (title.includes('work') || title.includes('עבודה') || title.includes('משרד')) {
        type = 'work'
      }

      return {
        id: item.id,
        title: item.summary || 'אירוע ללא שם',
        description: item.description,
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        location: item.location,
        attendees: item.attendees?.map((a: any) => a.email) || [],
        type,
        color: item.colorId
      }
    })

    return events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

// קבלת אירועי היום
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return getCalendarEvents(today.toISOString(), tomorrow.toISOString())
}

// קבלת אירועי השבוע
export async function getWeekEvents(): Promise<CalendarEvent[]> {
  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return getCalendarEvents(today.toISOString(), weekFromNow.toISOString())
}

// יצירת אירוע חדש
export async function createCalendarEvent(event: Partial<CalendarEvent>): Promise<boolean> {
  const tokens = tokenStorage.get()
  if (!tokens) return false

  try {
    const calendarEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return false
  }
}

// Fallback data למקרה שאין חיבור
export const generateFallbackCalendarEvents = (): CalendarEvent[] => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return [
    {
      id: '1',
      title: 'פגישת צוות שבועית',
      description: 'סקירה שבועית של הפרויקטים והמשימות',
      start: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(), // בעוד שעתיים
      end: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      location: 'חדר ישיבות A',
      type: 'meeting',
      attendees: ['colleague@example.com']
    },
    {
      id: '2',
      title: 'סיום פרויקט חשוב',
      description: 'דדליין לסיום הפרויקט החדש',
      start: new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      end: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      type: 'task'
    },
    {
      id: '3',
      title: 'ארוחת ערב עם המשפחה',
      description: 'זמן איכות עם המשפחה',
      start: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      end: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      location: 'בית',
      type: 'personal'
    },
    {
      id: '4',
      title: 'ספורט בחדר כושר',
      description: 'אימון כושר שבועי',
      start: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      end: new Date(tomorrow.getTime() + 9.5 * 60 * 60 * 1000).toISOString(),
      location: 'חדר כושר מקומי',
      type: 'personal'
    }
  ]
} 