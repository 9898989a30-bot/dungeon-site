import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  // Проверяем событие
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('max_participants')
    .eq('id', id)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
  }

  // Проверяем, не участвует ли уже
  const { data: existingParticipant } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', id)
    .eq('user_id', user.id)
    .single()

  if (existingParticipant) {
    return NextResponse.json({ error: 'Вы уже участвуете' }, { status: 400 })
  }

  // Проверяем количество участников
  const { count } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  if (event.max_participants && count !== null && count >= event.max_participants) {
    return NextResponse.json({ error: 'Достигнуто максимальное количество участников' }, { status: 400 })
  }

  // Добавляем участника
  const { error: insertError } = await supabase
    .from('event_participants')
    .insert({
      event_id: id,
      user_id: user.id,
      joined_at: new Date().toISOString()
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}