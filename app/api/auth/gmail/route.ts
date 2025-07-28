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

    console.log('📧 שולף הודעות מג'ימייל...')

    // שליפת רשימת הודעות לא נקראות
    const messagesResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?` + 
      new URLSearchParams({
        q: 'is:unread',
        maxResults: '10'
      }), {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      console.error('Failed to fetch Gmail messages:', errorText)
      return NextResponse.json({ error: 'Failed to fetch Gmail messages' }, { status: 401 })
    }

    const messagesData = await messagesResponse.json()
    const messageIds = messagesData.messages || []

    // שליפת פרטי ההודעות
    const messages = await Promise.all(
      messageIds.slice(0, 5).map(async (msg: any) => {
        try {
          const messageResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
              },
            }
          )

          if (!messageResponse.ok) return null

          const messageData = await messageResponse.json()
          const headers = messageData.payload?.headers || []
          
          const getHeader = (name: string) => 
            headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

          return {
            id: messageData.id,
            subject: getHeader('Subject'),
            from: getHeader('From'),
            date: getHeader('Date'),
            snippet: messageData.snippet || '',
            unread: messageData.labelIds?.includes('UNREAD') || false
          }
        } catch (error) {
          console.error('Error fetching message details:', error)
          return null
        }
      })
    )

    const validMessages = messages.filter(msg => msg !== null)
    console.log(`✅ קיבלנו ${validMessages.length} הודעות מג'ימייל`)

    return NextResponse.json({ 
      messages: validMessages,
      unreadCount: messageIds.length 
    })

  } catch (error) {
    console.error('Error fetching Gmail messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Gmail messages' },
      { status: 500 }
    )
  }
} 