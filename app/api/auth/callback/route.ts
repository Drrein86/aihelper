import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // אם יש שגיאה מגוגל
    if (error) {
      console.error('Google OAuth Error:', error)
      return NextResponse.redirect(new URL('/?auth=error', request.url))
    }

    // אם אין קוד
    if (!code) {
      console.error('No authorization code received')
      return NextResponse.redirect(new URL('/?auth=error', request.url))
    }

    console.log('📱 קיבלנו קוד מגוגל, מחליפים לטוקנים...')

    // החלפת הקוד לטוקנים
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Failed to exchange code for tokens:', errorData)
      return NextResponse.redirect(new URL('/?auth=error', request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('✅ קיבלנו טוקנים מגוגל!')

    // יצירת response עם redirect לעמוד הראשי
    const response = NextResponse.redirect(new URL('/?auth=success', request.url))
    
    // שמירת הטוקנים בקוקיז (כדי שהקליינט יוכל לגשת אליהם)
    response.cookies.set('google_tokens', JSON.stringify(tokens), {
      httpOnly: false, // כדי שגם הקליינט יוכל לגשת
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // שבוע
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/?auth=error', request.url))
  }
} 