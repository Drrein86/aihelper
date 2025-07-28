import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { tokenStorage } from '@/services/google-auth'

export function useGoogleData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    updateUserFromGoogle, 
    updateEventsFromGoogle, 
    updateGmailData,
    user 
  } = useStore()

  const loadGoogleData = async () => {
    // בדיקה אם יש טוקנים
    const tokens = tokenStorage.get()
    if (!tokens?.access_token) {
      console.log('🔒 אין טוקני גוגל - מדלג על טעינת נתונים')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 טוען נתונים מגוגל...')

      // טעינת פרטי המשתמש
      const userResponse = await fetch('/api/auth/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        updateUserFromGoogle(userData)
        console.log('✅ פרטי המשתמש עודכנו:', userData.name)
      }

      // טעינת אירועי לוח השנה
      const calendarResponse = await fetch('/api/auth/calendar')
      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        updateEventsFromGoogle(calendarData.events)
        console.log(`✅ ${calendarData.events.length} אירועים נטענו מהלוח שנה`)
      }

      // טעינת הודעות Gmail
      const gmailResponse = await fetch('/api/auth/gmail')
      if (gmailResponse.ok) {
        const gmailData = await gmailResponse.json()
        updateGmailData(gmailData)
        console.log(`✅ ${gmailData.messages.length} הודעות נטענו מג'ימייל`)
      }

    } catch (error) {
      console.error('❌ שגיאה בטעינת נתונים מגוגל:', error)
      setError('שגיאה בטעינת נתונים מגוגל')
    } finally {
      setIsLoading(false)
    }
  }

  // טעינה אוטומטית בטעינת הקומפוננט
  useEffect(() => {
    loadGoogleData()
  }, [])

  // טעינה מחדש כשיש התחברות חדשה
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'success') {
      setTimeout(() => {
        loadGoogleData()
      }, 1000) // המתנה קצרה כדי שהטוקנים יתייצבו
    }
  }, [])

  return {
    isLoading,
    error,
    reload: loadGoogleData,
    isConnected: user.isGoogleConnected
  }
} 