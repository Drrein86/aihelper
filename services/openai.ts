// ⚠️ הוסרה יצירת OpenAI client בצד הלקוח מסיבות אבטחה
// החיבור ל-OpenAI עבר ל-API route: /api/chat

export async function sendChatMessage(
  message: string, 
  userData: any,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
): Promise<string> {
  try {
    console.log('שולח הודעה ל-API route')
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userData,
        conversationHistory
      }),
    })

    if (!response.ok) {
      throw new Error(`שגיאת שרת: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    console.log('תגובה התקבלה מ-API:', data.response.slice(0, 100) + '...')
    return data.response
  } catch (error) {
    console.error('שגיאה בשליחת הודעה:', error)
    // נחזור ל-fallback במקרה של שגיאה (כולל קוטה חרגה)
    console.log('🔄 עובר למצב fallback - תשובות מקומיות')
    return generateSmartLocalResponse(message, userData)
  }
}

// Fallback function for when OpenAI API is not available
function generateSmartLocalResponse(message: string, userData: any): string {
  const lowerMessage = message.toLowerCase()
  const currentHour = new Date().getHours()
  const userName = userData.userName || 'אליאור'
  
  // Get current data
  const pendingTasks = userData.tasks?.filter((t: any) => !t.done) || []
  const todayEvents = userData.events?.filter((e: any) => {
    const eventDate = new Date(e.date)
    return eventDate.toDateString() === new Date().toDateString()
  }) || []
  const urgentTasks = pendingTasks.filter((t: any) => t.priority === 'high')
  
  // Context-aware responses
  if (lowerMessage.includes('מה אני צריך') || lowerMessage.includes('היום') || lowerMessage.includes('לעשות')) {
    const greeting = currentHour < 12 ? 'בוקר טוב' : currentHour < 18 ? 'אחר הצהריים טובים' : 'ערב טוב'
    
    let response = `${greeting} ${userName}!\n\n`
    
    if (todayEvents.length > 0) {
      response += `האירועים שלך היום:\n${todayEvents.map((e: any) => `- ${e.time} - ${e.title}${e.location ? ` (${e.location})` : ''}`).join('\n')}\n\n`
    }
    
    if (urgentTasks.length > 0) {
      response += `משימות דחופות:\n${urgentTasks.map((t: any) => `- ${t.text}`).join('\n')}\n\n`
    }
    
    response += `יש לך ${pendingTasks.length} משימות ממתינות ו-${todayEvents.length} אירועים היום. איך אפשר לעזור?`
    
    return response
  }
  
  if (lowerMessage.includes('כסף') || lowerMessage.includes('תקציב') || lowerMessage.includes('השקע')) {
    const financial = userData.financial
    return `המצב הכספי שלך:

יתרה זמינה: ₪${financial?.balance?.toLocaleString() || '3,500'}
השקעות: ₪${financial?.investments?.toLocaleString() || '12,400'} (${financial?.investmentChange > 0 ? '+' : ''}${financial?.investmentChange || 2.4}%)
תקציב חודשי: ₪${financial?.monthlyBudget?.toLocaleString() || '8,000'}

${financial?.upcomingPayments?.length > 0 ? `תשלומים קרובים: ${financial.upcomingPayments.length}` : ''}

המצב נראה טוב! יש עוד שאלות כספיות?`
  }
  
  if (lowerMessage.includes('משימ') || lowerMessage.includes('TODO') || lowerMessage.includes('עבוד')) {
    if (pendingTasks.length === 0) {
      return 'כל הכבוד! אין לך משימות ממתינות. היום שלך נקי! רוצה להוסיף משימה חדשה?'
    }
    
    return `המשימות שלך (${pendingTasks.length}):

${pendingTasks.map((t: any) => {
      const priorityLabel = t.priority === 'high' ? 'דחוף' : t.priority === 'medium' ? 'בינוני' : 'נמוך'
      return `- ${t.text} (${priorityLabel})`
    }).join('\n')}

איזו משימה תרצה להתחיל?`
  }
  
  // Default response
  return `שלום ${userName}!

הערה: הצ'אט כרגע פועל במצב מוגבל כי אין חיבור ל-OpenAI.

אני יכול לעזור עם:
- מידע על לוח הזמנים
- ניהול משימות  
- מעקב פיננסי
- תזכורות

נסה לשאול: "מה יש לי היום?" או "הראה משימות"`
}

// Function to analyze user intent and suggest actions
export function analyzeUserIntent(message: string): {
  intent: string
  confidence: number
  suggestedActions?: string[]
} {
  const lowerMessage = message.toLowerCase()
  
  const intents = [
    {
      intent: 'schedule_query',
      keywords: ['מה יש', 'היום', 'מתי', 'פגישה', 'לוח זמנים'],
      confidence: 0
    },
    {
      intent: 'task_management', 
      keywords: ['משימה', 'עבודה', 'TODO', 'להשלים', 'לעשות'],
      confidence: 0
    },
    {
      intent: 'financial_query',
      keywords: ['כסף', 'תקציב', 'השקעה', 'תשלום', 'בנק'],
      confidence: 0
    },
    {
      intent: 'add_item',
      keywords: ['הוסף', 'צור', 'חדש', 'קבע'],
      confidence: 0
    }
  ]
  
  // Calculate confidence scores
  intents.forEach(intent => {
    intent.confidence = intent.keywords.reduce((score, keyword) => {
      return lowerMessage.includes(keyword) ? score + 1 : score
    }, 0) / intent.keywords.length
  })
  
  const bestMatch = intents.reduce((prev, current) => 
    prev.confidence > current.confidence ? prev : current
  )
  
  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    suggestedActions: bestMatch.confidence > 0.3 ? getSuggestedActions(bestMatch.intent) : undefined
  }
}

function getSuggestedActions(intent: string): string[] {
  switch (intent) {
    case 'schedule_query':
      return ['הצג לוח זמנים', 'פגישות היום', 'אירועים השבוע']
    case 'task_management':
      return ['הצג משימות', 'הוסף משימה', 'סמן כהושלם']
    case 'financial_query':
      return ['הצג מצב כספי', 'דוח השקעות', 'תשלומים קרובים']
    case 'add_item':
      return ['הוסף משימה', 'קבע פגישה', 'רשום הוצאה']
    default:
      return []
  }
} 