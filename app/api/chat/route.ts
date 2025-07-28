import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client בצד השרת בלבד
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    let body
    try {
      body = await req.json()
    } catch (jsonError) {
      console.error('❌ שגיאה בפענוח JSON:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const { message, userData, conversationHistory = [] } = body

    // ווליד צ'יה של הנתונים
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('🚀 מתחבר ל-OpenAI עם gpt-3.5-turbo (המודל הזול ביותר)...')

    const systemPrompt = buildSystemPrompt(userData)
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    console.log('שולח ל-OpenAI:', { messageCount: messages.length })

    // בדיקה שיש API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key לא הוגדר')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    let completion
    try {
      // timeout של 8 שניות (פחות מ-10 של Vercel)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      }, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)
    } catch (openaiError: any) {
      console.error('❌ שגיאת OpenAI:', openaiError)
      
      if (openaiError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - OpenAI לקח יותר מדי זמן' },
          { status: 408 }
        )
      }
      
      return NextResponse.json(
        { error: 'OpenAI service temporarily unavailable' },
        { status: 503 }
      )
    }

    const response = completion.choices[0]?.message?.content || 'מצטער, לא הצלחתי להבין. נסה שוב.'
    console.log('✅ תגובה מ-OpenAI התקבלה בהצלחה!')
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('❌ שגיאת OpenAI API:', error)
    return NextResponse.json(
      { error: 'שגיאה בחיבור ל-OpenAI: ' + (error as Error).message }, 
      { status: 500 }
    )
  }
}

// System prompt function
function buildSystemPrompt(userData?: {
  tasks: any[]
  events: any[]
  financial: any
  notifications: any[]
  userName: string
  gmail?: {
    latestMessage?: {
      subject: string
      from: string
      snippet: string
      date: string
    }
    suggestedEvent?: {
      title: string
      confidence: number
      time?: string
      date?: string
      type: string
    }
    unreadCount: number
  }
}) {
  const currentTime = new Date()
  const timeString = currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const dateString = currentTime.toLocaleDateString('he-IL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // ברירת מחדל אם אין userData
  if (!userData) {
    return `אתה עוזר אישי חכם ודידותי בשם "העוזר החכם".
    
הזמן הנוכחי: ${dateString}, ${timeString}

אתה יכול לעזור עם:
- משפטי השראה ומוטיבציה
- אתגרים יומיים לשיפור חיים
- עצות כלליות
- מידע ותמיכה

תענה בעברית בצורה חמה ותומכת.`
  }

  const pendingTasks = userData.tasks.filter(t => !t.done)
  const todayEvents = userData.events.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate.toDateString() === currentTime.toDateString()
  })
  const unreadNotifications = userData.notifications.filter(n => !n.read)

  return `אתה עוזר אישי חכם ודידותי בשם "העוזר החכם" לבעל השם ${userData.userName}.

הנתונים הנוכחיים של המשתמש (${dateString}, ${timeString}):

📅 **אירועי היום (${todayEvents.length}):**
${todayEvents.map(e => `- ${e.time}: ${e.title} ${e.location ? `ב${e.location}` : ''}`).join('\n') || '- אין אירועים היום'}

✅ **משימות ממתינות (${pendingTasks.length}):**
${pendingTasks.map(t => `- ${t.text} (${t.priority === 'high' ? 'דחוף' : t.priority === 'medium' ? 'בינוני' : 'נמוך'})`).join('\n') || '- אין משימות ממתינות'}

💰 **מצב כספי:**
- יתרה: ₪${userData.financial.balance.toLocaleString()}
- השקעות: ₪${userData.financial.investments.toLocaleString()} (${userData.financial.investmentChange > 0 ? '+' : ''}${userData.financial.investmentChange}%)
- תקציב חודשי: ₪${userData.financial.monthlyBudget.toLocaleString()}
- תשלומים קרובים: ${userData.financial.upcomingPayments.length}

🔔 **התראות לא נקראו: ${unreadNotifications.length}**

📧 **Gmail:**
- הודעות לא נקראות: ${userData.gmail?.unreadCount || 0}
${userData.gmail?.latestMessage ? `- הודעה אחרונה: "${userData.gmail.latestMessage.subject}" מאת ${userData.gmail.latestMessage.from.split('@')[0]}` : '- אין הודעות אחרונות'}
${userData.gmail?.suggestedEvent ? `- 🤖 אירוע מוצע מההודעה האחרונה: "${userData.gmail.suggestedEvent.title}" (${Math.round(userData.gmail.suggestedEvent.confidence * 100)}% ביטחון)` : ''}

**הוראות:**
1. תן תשובות בעברית, חכמות ומועילות
2. השתמש במידע הנוכחי של המשתמש לתת תשובות מותאמות אישית  
3. הצע פעולות קונקרטיות כשזה רלוונטי
4. היה ידידותי אבל מקצועי
5. השתמש באמוג'י בצורה מתונה
6. אם המשתמש שואל על נתונים ספציפיים, תן מספרים מדויקים מהמידע שלמעלה
7. אם יש משימות דחופות או אירועים קרובים, הזכר אותם
8. הצע המלצות חכמות בהתבסס על הנתונים
9. אם המשתמש מבקש לבצע פעולה (הוספת משימה, עדכון וכו'), הסבר שהוא יכול לעשות זאת בממשק
10. אם יש אירוע מוצע מהודעת Gmail, הזכר אותו והצע ליצור אותו בלוח השנה
11. תן תשומת לב מיוחדת להודעה האחרונה ב-Gmail - אם היא מכילה מידע רלוונטי לשאלת המשתמש
12. הסבר למשתמש שהמערכת יכולה לזהות אירועים בהודעות Gmail אוטומטית וליצור אותם בלוח השנה

זכור: אתה לא רק בוט - אתה עוזר אישי חכם שמכיר את ${userData.userName} ואת הנתונים שלו! המערכת שלך כוללת אינטגרציה חכמה בין Gmail ללוח השנה שמזהה אירועים פוטנציאליים מהודעות אוטומטית.`
} 