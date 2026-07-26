'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Популярные призы
const POPULAR_REWARDS = [
  'Легенда Подземелья',
  'Чемпион Арены',
  'Покоритель Бездны',
  'Хранитель Реликвий',
  'Герой Гильдии',
  'Мастер Рейдов',
  'Коллекционер Кристаллов',
  '500 кристаллов',
  '1000 кристаллов',
  'Уникальный аватар',
  'Золотая рамка',
  'Титул "Победитель"',
]

interface Reward {
  place: number
  reward_name: string
  reward_description: string
}

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  
  // Форма
  const [type, setType] = useState('giveaway')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [rewards, setRewards] = useState<Reward[]>([{ place: 1, reward_name: '', reward_description: '' }])

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    console.log('🔄 Загрузка событий из базы...')
    const { data, error } = await supabase
      .from('events')
      .select('*, event_rewards(place, reward_name, reward_description)')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Ошибка загрузки:', error)
    } else {
      console.log('✅ Загружено событий:', data?.length || 0)
      setEvents(data || [])
    }
  }

  function addReward() {
    setRewards([...rewards, { place: rewards.length + 1, reward_name: '', reward_description: '' }])
  }

  function removeReward(index: number) {
    const newRewards = rewards.filter((_, i) => i !== index)
    setRewards(newRewards.map((r, i) => ({ ...r, place: i + 1 })))
  }

  function updateReward(index: number, field: keyof Reward, value: string | number) {
    const newRewards = [...rewards]
    newRewards[index] = { ...newRewards[index], [field]: value }
    setRewards(newRewards)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
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

    if (eventError) {
      alert('Ошибка создания события: ' + eventError.message)
      setLoading(false)
      return
    }

    const validRewards = rewards.filter(r => r.reward_name.trim() !== '')
    if (validRewards.length > 0) {
      await supabase.from('event_rewards').insert(
        validRewards.map(r => ({
          event_id: event.id,
          place: r.place,
          reward_name: r.reward_name,
          reward_description: r.reward_description
        }))
      )
    }

    alert('✅ Событие создано!')
    setTitle('')
    setDescription('')
    setStartDate('')
    setMaxParticipants('')
    setRewards([{ place: 1, reward_name: '', reward_description: '' }])
    await loadEvents()
    setLoading(false)
  }

  async function deleteEvent(id: string) {
    if (!confirm('Удалить событие? Все участники и призы тоже удалятся.')) return
    
    console.log('🗑 Удаление события:', id)
    const { error } = await supabase.from('events').delete().eq('id', id)
    
    if (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления: ' + error.message)
    } else {
      console.log('✅ Успешно удалено, обновляем список...')
      await loadEvents() // Ждём обновления списка
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">👑 Админка</h1>
          <button onClick={() => router.push('/')} className="text-yellow-400 hover:text-yellow-300">← На сайт</button>
        </div>

        {/* Форма создания */}
        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">✨ Создать событие</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Тип</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded">
                  <option value="giveaway">🎁 Розыгрыш</option>
                  <option value="tournament">⚔️ Турнир</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-gray-800 border border-gray-700 rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Описание *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full p-3 bg-gray-800 border border-gray-700 rounded" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Дата и время</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Макс. участников</label>
                <input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded" />
              </div>
            </div>

            {/* Призовые места */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-400">🏆 Призовые места</label>
                <button type="button" onClick={addReward} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-bold">
                  + Добавить место
                </button>
              </div>
              
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-yellow-400 font-bold text-lg">#{reward.place}</span>
                      <span className="text-gray-400 text-sm">место</span>
                      {rewards.length > 1 && (
                        <button type="button" onClick={() => removeReward(index)} className="ml-auto text-red-400 hover:text-red-300 text-sm">
                          Удалить
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Название приза</label>
                        <input
                          type="text"
                          value={reward.reward_name}
                          onChange={e => updateReward(index, 'reward_name', e.target.value)}
                          placeholder="Например: Легенда Подземелья"
                          className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm"
                          list={`rewards-${index}`}
                        />
                        <datalist id={`rewards-${index}`}>
                          {POPULAR_REWARDS.map(r => <option key={r} value={r} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Описание (что даёт)</label>
                        <input
                          type="text"
                          value={reward.reward_description}
                          onChange={e => updateReward(index, 'reward_description', e.target.value)}
                          placeholder="Например: +500 кристаллов"
                          className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:opacity-50">
              {loading ? 'Создание...' : '🛡️ Создать событие'}
            </button>
          </form>
        </div>

        {/* Список событий */}
        <div>
          <h2 className="text-xl font-bold mb-4">📋 События ({events.length})</h2>
          <div className="space-y-3">
            {events.map(event => (
              <div 
                key={event.id} 
                onClick={() => router.push(`/admin/events/${event.id}`)}
                className="bg-black/40 border border-purple-500/20 p-4 rounded-lg hover:border-yellow-400/50 transition cursor-pointer relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{event.type === 'tournament' ? '⚔️' : '🎁'}</span>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">{event.status}</span>
                  </div>
                  
                  {/* Кнопка удаления теперь НЕ внутри Link, а с stopPropagation */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation() // Останавливаем всплытие, чтобы не сработал клик по карточке
                      deleteEvent(event.id)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold z-10 relative"
                  >
                    🗑 Удалить
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                
                {event.event_rewards && event.event_rewards.length > 0 && (
                  <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 font-bold mb-2">🏆 Призы:</p>
                    <div className="space-y-1">
                      {event.event_rewards.map((reward: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="text-yellow-300 font-bold">#{reward.place} место:</span>
                          <span className="text-white ml-2">{reward.reward_name}</span>
                          {reward.reward_description && (
                            <span className="text-gray-400 ml-2 text-xs">({reward.reward_description})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2 group-hover:text-yellow-400/70 transition">⚙️ Кликни для управления и розыгрыша</p>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-gray-500 py-8">Нет событий</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}