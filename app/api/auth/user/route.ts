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

    console.log('🔍 שולף פרטי משתמש מגוגל...')

    // שליפת פרטי המשתמש מגוגל
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Failed to fetch user info:', errorText)
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 401 })
    }

    const userInfo = await userResponse.json()
    console.log('✅ קיבלנו פרטי משתמש:', userInfo.name)

    return NextResponse.json({
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name
    })

  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    )
  }
} 