import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // קבלת הטוקן מהקוקיז
    const tokensCookie = request.cookies.get('google_tokens')
    
    if (!tokensCookie) {
      return NextResponse.json({ error: 'No tokens found' }, { status: 401 })
    }

    const tokens = JSON.parse(tokensCookie.value)
    
    if (!tokens.access_token) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    console.log('📅 שולף אירועים מגוגל קלנדר...')

    // תאריך היום
    const today = new Date()
    const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString()

    // שליפת אירועים מגוגל קלנדר
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` + 
      new URLSearchParams({
        timeMin,
        timeMax,
        maxResults: '20',
        singleEvents: 'true',
        orderBy: 'startTime'
      }), {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text()
      console.error('Failed to fetch calendar events:', errorText)
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 401 })
    }

    const calendarData = await calendarResponse.json()
    console.log(`✅ קיבלנו ${calendarData.items?.length || 0} אירועים מהלוח שנה`)

    // המרה לפורמט שלנו
    const events = calendarData.items?.map((event: any) => {
      const startTime = event.start?.dateTime || event.start?.date
      const endTime = event.end?.dateTime || event.end?.date
      
      return {
        id: event.id,
        title: event.summary || 'ללא כותרת',
        description: event.description || '',
        date: startTime,
        time: startTime ? new Date(startTime).toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'כל היום',
        endTime: endTime,
        location: event.location || '',
        attendees: event.attendees?.map((a: any) => a.email) || [],
        isAllDay: !event.start?.dateTime,
        link: event.htmlLink
      }
    }) || []

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
} 