'use client'

import { getGmailMessages, type GmailMessage } from './gmail'
import { createCalendarEvent, type CalendarEvent } from './google-calendar'

// ממשק לתוצאות ניתוח הודעות
export interface EmailAnalysis {
  hasEvent: boolean
  suggestedEvent?: {
    title: string
    description: string
    date?: string
    time?: string
    location?: string
    type: CalendarEvent['type']
  }
  confidence: number // רמת ביטחון בניתוח (0-1)
}

// זיהוי תאריכים בטקסט (תאריכים עבריים ואנגליים)
function extractDatesFromText(text: string): string[] {
  const dates: string[] = []
  
  // תבניות תאריכים שונות
  const datePatterns = [
    // תאריכים עבריים
    /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g, // 15/12/2024
    /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, // 15.12.2024
    /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g,  // 15-12-2024
    
    // ימים וחודשים בעברית
    /\b(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\b/g,
    /\b(ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)\b/gi,
    /\b(מחר|היום|אתמול|השבוע|בשבוע הבא)\b/gi,
    
    // תאריכים באנגלית
    /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
    /\b(tomorrow|today|yesterday|next week|this week)\b/gi
  ]
  
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      dates.push(...matches)
    }
  })
  
  return dates
}

// זיהוי שעות בטקסט
function extractTimesFromText(text: string): string[] {
  const times: string[] = []
  
  const timePatterns = [
    /\b(\d{1,2}):(\d{2})\b/g, // 14:30
    /\b(\d{1,2})\.(\d{2})\b/g, // 14.30
    /\b(בשעה\s+\d{1,2}:\d{2})\b/gi, // בשעה 14:30
    /\b(at\s+\d{1,2}:\d{2})\b/gi, // at 14:30
    /\b(\d{1,2}\s*(am|pm))\b/gi // 2 pm, 3pm
  ]
  
  timePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      times.push(...matches)
    }
  })
  
  return times
}

// זיהוי מיקומים בטקסט
function extractLocationsFromText(text: string): string[] {
  const locations: string[] = []
  
  const locationPatterns = [
    /\b(במשרד|בבית|בחדר\s+\w+|במסעדה|בבית קפה)\b/gi,
    /\b(zoom|teams|meet|skype|office|home|restaurant|cafe)\b/gi,
    /\b(ברחוב\s+[\w\s]+)/gi,
    /\b(בכתובת:?\s*[\w\s,]+)/gi
  ]
  
  locationPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      locations.push(...matches)
    }
  })
  
  return locations
}

// קביעת סוג האירוע לפי תוכן ההודעה
function determineEventType(subject: string, snippet: string): CalendarEvent['type'] {
  const content = (subject + ' ' + snippet).toLowerCase()
  
  if (content.includes('פגישה') || content.includes('ישיבה') || content.includes('meeting') || content.includes('conference')) {
    return 'meeting'
  }
  if (content.includes('משימה') || content.includes('task') || content.includes('עבודה') || content.includes('deadline')) {
    return 'task'
  }
  if (content.includes('תשלום') || content.includes('כסף') || content.includes('payment') || content.includes('invoice')) {
    return 'payment'
  }
  if (content.includes('עבודה') || content.includes('work') || content.includes('משרד') || content.includes('office')) {
    return 'work'
  }
  
  return 'personal'
}

// ניתוח הודעת Gmail וזיהוי אירועים פוטנציאליים
export function analyzeEmailForEvents(message: GmailMessage): EmailAnalysis {
  const fullText = `${message.subject} ${message.snippet}`
  
  // חיפוש תאריכים ושעות
  const dates = extractDatesFromText(fullText)
  const times = extractTimesFromText(fullText)
  const locations = extractLocationsFromText(fullText)
  
  // מילות מפתח המעידות על אירוע
  const eventKeywords = [
    'פגישה', 'ישיבה', 'אירוע', 'מפגש', 'דחוף', 'תזכורת',
    'meeting', 'appointment', 'event', 'reminder', 'urgent',
    'לוח זמנים', 'schedule', 'calendar', 'במועד', 'תאריך',
    'השבוע', 'מחר', 'היום', 'בשעה'
  ]
  
  const hasEventKeywords = eventKeywords.some(keyword => 
    fullText.toLowerCase().includes(keyword.toLowerCase())
  )
  
  // חישוב רמת ביטחון
  let confidence = 0
  if (dates.length > 0) confidence += 0.4
  if (times.length > 0) confidence += 0.3
  if (hasEventKeywords) confidence += 0.2
  if (locations.length > 0) confidence += 0.1
  
  const hasEvent = confidence >= 0.5
  
  let suggestedEvent
  if (hasEvent) {
    suggestedEvent = {
      title: message.subject || 'אירוע מ-Gmail',
      description: `יוצר מההודעה: ${message.snippet}${message.from ? `\nמאת: ${message.from}` : ''}`,
      date: dates.length > 0 ? dates[0] : undefined,
      time: times.length > 0 ? times[0] : undefined,
      location: locations.length > 0 ? locations[0] : undefined,
      type: determineEventType(message.subject, message.snippet)
    }
  }
  
  return {
    hasEvent,
    suggestedEvent,
    confidence
  }
}

// ניתוח כל ההודעות האחרונות וזיהוי אירועים
export async function analyzeLatestEmails(maxEmails: number = 10): Promise<{
  emailsWithEvents: Array<GmailMessage & { analysis: EmailAnalysis }>
  suggestedEvents: EmailAnalysis['suggestedEvent'][]
}> {
  try {
    const messages = await getGmailMessages(maxEmails)
    const emailsWithEvents: Array<GmailMessage & { analysis: EmailAnalysis }> = []
    const suggestedEvents: EmailAnalysis['suggestedEvent'][] = []
    
    for (const message of messages) {
      const analysis = analyzeEmailForEvents(message)
      
      if (analysis.hasEvent && analysis.suggestedEvent) {
        emailsWithEvents.push({ ...message, analysis })
        suggestedEvents.push(analysis.suggestedEvent)
      }
    }
    
    return {
      emailsWithEvents,
      suggestedEvents
    }
  } catch (error) {
    console.error('Error analyzing emails:', error)
    return {
      emailsWithEvents: [],
      suggestedEvents: []
    }
  }
}

// יצירת אירוע ללוח שנה מהודעת Gmail
export async function createEventFromEmail(
  message: GmailMessage, 
  eventDetails?: Partial<CalendarEvent>
): Promise<boolean> {
  try {
    const analysis = analyzeEmailForEvents(message)
    
    if (!analysis.hasEvent || !analysis.suggestedEvent) {
      console.warn('No event detected in email')
      return false
    }
    
    // הכנת תאריך ושעה
    let startDate = new Date()
    if (analysis.suggestedEvent.date) {
      // נסיון לפרש את התאריך
      const parsedDate = new Date(analysis.suggestedEvent.date)
      if (!isNaN(parsedDate.getTime())) {
        startDate = parsedDate
      }
    }
    
    // הוספת שעה אם זמינה
    if (analysis.suggestedEvent.time) {
      const timeMatch = analysis.suggestedEvent.time.match(/(\d{1,2}):(\d{2})/)
      if (timeMatch) {
        startDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]))
      }
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // שעה של אירוע
    
    const calendarEvent: Partial<CalendarEvent> = {
      title: eventDetails?.title || analysis.suggestedEvent.title,
      description: eventDetails?.description || analysis.suggestedEvent.description,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location: eventDetails?.location || analysis.suggestedEvent.location,
      type: eventDetails?.type || analysis.suggestedEvent.type,
      ...eventDetails
    }
    
    return await createCalendarEvent(calendarEvent)
  } catch (error) {
    console.error('Error creating event from email:', error)
    return false
  }
}

// קבלת ההודעה האחרונה עם ניתוח
export async function getLatestEmailWithAnalysis(): Promise<{
  message: GmailMessage | null
  analysis: EmailAnalysis | null
  canCreateEvent: boolean
}> {
  try {
    const messages = await getGmailMessages(1)
    
    if (messages.length === 0) {
      return {
        message: null,
        analysis: null,
        canCreateEvent: false
      }
    }
    
    const latestMessage = messages[0]
    const analysis = analyzeEmailForEvents(latestMessage)
    
    return {
      message: latestMessage,
      analysis,
      canCreateEvent: analysis.hasEvent && analysis.confidence >= 0.6
    }
  } catch (error) {
    console.error('Error getting latest email with analysis:', error)
    return {
      message: null,
      analysis: null,
      canCreateEvent: false
    }
  }
} 