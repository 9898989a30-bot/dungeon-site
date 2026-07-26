'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RaffleDraw } from '@/components/RaffleDraw'

export default function EventAdminPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const eventId = params.id as string
    
    // Загружаем событие
    const { data: eventData } = await supabase
      .from('events')
      .select('*, event_rewards(place, reward_name, reward_description)')
      .eq('id', eventId)
      .single()
    
    // Загружаем участников
    const { data: participantsData } = await supabase
      .from('participants')
      .select('profiles(username, game_nickname, guild_name)')
      .eq('event_id', eventId)

    if (eventData) setEvent(eventData)
    if (participantsData) setParticipants(participantsData)
    setLoading(false)
  }

  async function deleteEvent() {
    if (!confirm('Удалить событие? Все участники тоже удалятся.')) return
    const { error } = await supabase.from('events').delete().eq('id', params.id)
    if (error) alert('Ошибка: ' + error.message)
    else router.push('/admin')
  }

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Загрузка...</div>
  if (!event) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Событие не найдено</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">📋 Управление событием</h1>
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">← В админку</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Информация о событии */}
          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{event.type === 'tournament' ? '⚔️' : ''}</span>
              <h2 className="text-2xl font-bold">{event.title}</h2>
            </div>
            <p className="text-gray-400 mb-4">{event.description}</p>
            
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Статус:</span> <span className="text-green-400">{event.status}</span></p>
              <p><span className="text-gray-500">Участников:</span> {participants.length}{event.max_participants && `/${event.max_participants}`}</p>
              {event.start_date && (
                <p><span className="text-gray-500">Старт:</span> {new Date(event.start_date).toLocaleString('ru-RU')}</p>
              )}
            </div>

            {event.event_rewards && event.event_rewards.length > 0 && (
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 font-bold mb-2">🏆 Призы:</p>
                {event.event_rewards.map((reward: any, i: number) => (
                  <div key={i} className="text-sm mb-1">
                    <span className="text-yellow-300">#{reward.place}:</span> {reward.reward_name}
                    {reward.reward_description && <span className="text-gray-400 text-xs"> ({reward.reward_description})</span>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={deleteEvent}
              className="w-full mt-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold"
            >
              🗑 Удалить событие
            </button>
          </div>

          {/* Розыгрыш */}
          <RaffleDraw eventId={event.id} participants={participants} />
        </div>

        {/* Список участников */}
        <div className="mt-6 bg-black/50 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">👥 Участники ({participants.length})</h3>
          <div className="space-y-2">
            {participants.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-500 w-8">#{i + 1}</span>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {p.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold">{p.profiles?.username || 'Аноним'}</p>
                  {p.profiles?.game_nickname && (
                    <p className="text-xs text-gray-400">{p.profiles.game_nickname}</p>
                  )}
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-center text-gray-500 py-4">Нет участников</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}