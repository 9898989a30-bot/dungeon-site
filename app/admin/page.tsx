'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  type: string
  title: string
  description: string
  status: string
  max_participants: number
  created_at: string
}

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  
  const [type, setType] = useState('giveaway')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [rewards, setRewards] = useState([
    { place: 1, reward_name: '', reward_description: '' }
  ])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
      
      setEvents(data || [])
    } catch (error) {
      console.error('Ошибка загрузки событий:', error)
    } finally {
      setLoading(false)
    }
  }

  function addReward() {
    setRewards([...rewards, { place: rewards.length + 1, reward_name: '', reward_description: '' }])
  }

  function removeReward(index: number) {
    if (rewards.length <= 1) return
    const newRewards = rewards.filter((_, i) => i !== index)
    setRewards(newRewards.map((r, i) => ({ ...r, place: i + 1 })))
  }

  function updateReward(index: number, field: string, value: string) {
    const newRewards = [...rewards]
    newRewards[index] = { ...newRewards[index], [field]: value }
    setRewards(newRewards)
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          type,
          title,
          description,
          start_date: startDate || null,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          status: 'registration'
        })
        .select()
        .single()

      if (eventError) throw eventError

      const validRewards = rewards.filter(r => r.reward_name.trim() !== '')
      if (validRewards.length > 0 && event) {
        await supabase.from('event_rewards').insert(
          validRewards.map(r => ({
            event_id: event.id,
            place: r.place,
            reward_name: r.reward_name,
            reward_description: r.reward_description
          }))
        )
      }

      // Сброс формы
      setTitle('')
      setDescription('')
      setStartDate('')
      setMaxParticipants('')
      setRewards([{ place: 1, reward_name: '', reward_description: '' }])
      
      // Перезагрузка списка
      loadEvents()
      
    } catch (error: any) {
      console.error('Ошибка создания события:', error)
    } finally {
      setCreating(false)
    }
  }

  async function deleteEvent(id: string) {
    try {
      await supabase.from('events').delete().eq('id', id)
      loadEvents()
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            👑 Админка
          </h1>
          <Link href="/" className="text-yellow-400 hover:text-yellow-300">← На сайт</Link>
        </div>

        {/* Форма создания события */}
        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            ✨ Создать событие
          </h2>

          <form onSubmit={createEvent} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Тип</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <option value="giveaway">🎁 Розыгрыш</option>
                  <option value="tournament">⚔️ Турнир</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Описание *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Дата и время</label>
                <input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Макс. участников</label>
                <input 
                  type="number" 
                  value={maxParticipants} 
                  onChange={e => setMaxParticipants(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* Призовые места */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-bold text-yellow-400"> Призовые места</label>
                <button 
                  type="button"
                  onClick={addReward}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition"
                >
                  + Добавить место
                </button>
              </div>
              
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <div key={index} className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl font-bold text-black">
                        #{reward.place}
                      </div>
                      <span className="text-gray-300 font-medium">место</span>
                      {rewards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Название приза *</label>
                        <input
                          type="text"
                          value={reward.reward_name}
                          onChange={e => updateReward(index, 'reward_name', e.target.value)}
                          placeholder="Например: Легенда Подземелья"
                          required
                          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Описание (что даёт)</label>
                        <input
                          type="text"
                          value={reward.reward_description}
                          onChange={e => updateReward(index, 'reward_description', e.target.value)}
                          placeholder="Например: +500 кристаллов"
                          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={creating}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition disabled:opacity-50 text-lg"
            >
              {creating ? 'Создание...' : '✨ Создать событие'}
            </button>
          </form>
        </div>

        {/* Список событий */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            📋 События ({events.length})
          </h2>

          {loading ? (
            <p className="text-center text-gray-400 py-12">Загрузка...</p>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{event.type === 'tournament' ? '⚔️' : '🎁'}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{event.title}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs mt-1 ${
                          event.status === 'completed' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {event.status === 'completed' ? 'Завершено' : 'Регистрация'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition font-medium"
                    >
                       Удалить
                    </button>
                  </div>

                  <p className="text-gray-400 mb-4">{event.description}</p>

                  <Link
                    href={`/admin/events/${event.id}`}
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition"
                  >
                    ️ Клики для управления и розыгрыша →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-black/20 rounded-xl border border-dashed border-gray-700">
              <p className="text-lg">Нет событий</p>
              <p className="text-sm mt-1">Создай первое событие выше!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}