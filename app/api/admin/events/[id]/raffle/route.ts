import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Нет прав' }, { status: 403 })
    }

    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    if (event.status === 'completed') {
      return NextResponse.json({ error: 'Розыгрыш уже проведён' }, { status: 400 })
    }

    const { data: participants } = await supabase
      .from('event_participants')
      .select('id, user_id')
      .eq('event_id', id)

    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: 'Нет участников' }, { status: 400 })
    }

    const { data: rewards } = await supabase
      .from('event_rewards')
      .select('*')
      .eq('event_id', id)
      .order('place', { ascending: true })

    if (!rewards || rewards.length === 0) {
      return NextResponse.json({ error: 'Нет призов' }, { status: 400 })
    }

    //  РАНДОМ
    const shuffled = [...participants].sort(() => Math.random() - 0.5)

    const winners = []
    for (let i = 0; i < rewards.length && i < shuffled.length; i++) {
      winners.push({
        participant_id: shuffled[i].id,
        user_id: shuffled[i].user_id,
        reward_id: rewards[i].id,
        place: rewards[i].place,
        won_at: new Date().toISOString()
      })
    }

    const { error: insertError } = await supabase
      .from('event_winners')
      .insert(winners)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', id)

    revalidatePath(`/events/${id}`)
    revalidatePath(`/admin/events/${id}`)
    
    // Возвращаем ID победителей по порядку мест
    const winnerIds = winners
      .sort((a, b) => a.place - b.place)
      .map(w => w.user_id)
    
    return NextResponse.json({ 
      success: true, 
      winners: winnerIds,
      count: winners.length
    })
    
  } catch (error) {
    console.error('Ошибка:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}