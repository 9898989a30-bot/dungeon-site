import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventId = body.eventId

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Добавляем участника
    const { error: insertError } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: user.id,
        joined_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Ошибка базы данных:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Очищаем кэш этой страницы
    revalidatePath(`/events/${eventId}`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}