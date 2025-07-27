'use client'

import { tokenStorage } from './google-auth'

export interface GmailMessage {
  id: string
  subject: string
  from: string
  snippet: string
  date: string
  read: boolean
  labels: string[]
}

export interface UserProfile {
  email: string
  name: string
  picture: string
}

// קבלת פרופיל המשתמש
export async function getUserProfile(): Promise<UserProfile | null> {
  const tokens = tokenStorage.get()
  if (!tokens) return null

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    const data = await response.json()
    return {
      email: data.email,
      name: data.name,
      picture: data.picture
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// קבלת הודעות Gmail
export async function getGmailMessages(maxResults: number = 10): Promise<GmailMessage[]> {
  const tokens = tokenStorage.get()
  if (!tokens) return []

  try {
    // קבלת רשימת הודעות
    const listResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!listResponse.ok) {
      throw new Error('Failed to fetch Gmail messages list')
    }

    const listData = await listResponse.json()
    if (!listData.messages) return []

    // קבלת פרטי כל הודעה
    const messages: GmailMessage[] = []
    for (const message of listData.messages.slice(0, maxResults)) {
      try {
        const messageResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
            },
          }
        )

        if (messageResponse.ok) {
          const messageData = await messageResponse.json()
          const headers = messageData.payload.headers
          
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'ללא נושא'
          const from = headers.find((h: any) => h.name === 'From')?.value || 'לא ידוע'
          const date = headers.find((h: any) => h.name === 'Date')?.value || ''
          
          messages.push({
            id: messageData.id,
            subject,
            from,
            snippet: messageData.snippet || '',
            date: new Date(date).toISOString(),
            read: !messageData.labelIds?.includes('UNREAD'),
            labels: messageData.labelIds || []
          })
        }
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error)
      }
    }

    return messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching Gmail messages:', error)
    return []
  }
}

// קבלת הודעות לא נקראות
export async function getUnreadCount(): Promise<number> {
  const tokens = tokenStorage.get()
  if (!tokens) return 0

  try {
    const response = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox is:unread',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch unread count')
    }

    const data = await response.json()
    return data.resultSizeEstimate || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

// Fallback data למקרה שאין חיבור
export const generateFallbackGmail = (): GmailMessage[] => [
  {
    id: '1',
    subject: 'פגישה דחופה מחר בשעה 14:00',
    from: 'manager@company.com',
    snippet: 'שלום, אני צריך לקבוע איתך פגישה דחופה מחר (יום שני) בשעה 14:00 במשרד. נושא הפגישה: סקירת פרויקט חדש...',
    date: new Date().toISOString(),
    read: false,
    labels: ['INBOX', 'UNREAD']
  },
  {
    id: '2',
    subject: 'תזכורת תשלום - חשבון חשמל',
    from: 'billing@electric-company.co.il',
    snippet: 'שלום, התשלום עבור חשבון החשמל לחודש נובמבר יגיע למועד ב-15/12/2024. אנא הסדר את התשלום בזמן...',
    date: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    labels: ['INBOX', 'UNREAD']
  },
  {
    id: '3',
    subject: 'אירוע רשת - כנס טכנולוגיה בחמישי',
    from: 'events@techconference.org',
    snippet: 'מוזמן להשתתף בכנס הטכנולוגיה השנתי ביום חמישי הקרוב בשעה 09:00 במרכז הכנסים בתל אביב. ההרשמה עד מחר...',
    date: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    labels: ['INBOX']
  },
  {
    id: '4',
    subject: 'ברוכים הבאים למערכת החדשה! 🎉',
    from: 'system@example.com',
    snippet: 'תודה שהצטרפת למערכת העוזר החכם. אנחנו מתרגשים לעזור לך לנהל את היום שלך...',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    labels: ['INBOX']
  },
  {
    id: '5',
    subject: 'ישיבת צוות בזום ביום ראשון',
    from: 'team@workspace.com',
    snippet: 'ישיבת הצוות השבועית תתקיים ביום ראשון הבא בשעה 10:30 בזום. קישור למפגש: https://zoom.us/meeting...',
    date: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    labels: ['INBOX']
  }
] 