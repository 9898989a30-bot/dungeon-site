import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const eventId = formData.get('eventId') as string

  if (!eventId) {
    return NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
  }

  const supabase = await createClient()

  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Проверяем событие
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('max_participants')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Проверяем, не участвует ли уже
  const { data: existingParticipant } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existingParticipant) {
    revalidatePath(`/events/${eventId}`)
    return NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
  }

  // Проверяем количество участников
  const { count } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (event.max_participants && count !== null && count >= event.max_participants) {
    return NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
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
    return NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
  }

  // Обновляем кэш и перенаправляем
  revalidatePath(`/events/${eventId}`)
  return NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
}