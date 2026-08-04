'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
  id?: string
  place: number
  reward_name: string
  reward_description: string
}

export default function EditEventPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('giveaway')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [rewards, setRewards] = useState<Reward[]>([])

  useEffect(() => {
    loadEvent()
  }, [eventId])

  async function loadEvent() {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (event) {
      setType(event.type || 'giveaway')
      setTitle(event.title || '')
      setDescription(event.description || '')
      setStartDate(event.start_date ? event.start_date.slice(0, 16) : '')
      setMaxParticipants(event.max_participants?.toString() || '')

      const { data: rewardsData } = await supabase
        .from('event_rewards')
        .select('*')
        .eq('event_id', eventId)
        .order('place', { ascending: true })

      if (rewardsData && rewardsData.length > 0) {
        setRewards(rewardsData)
      } else {
        setRewards([{ place: 1, reward_name: '', reward_description: '' }])
      }
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

    const { error: eventError } = await supabase
      .from('events')
      .update({
        type,
        title,
        description,
        start_date: startDate || null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      })
      .eq('id', eventId)

    if (eventError) {
      alert('Ошибка обновления: ' + eventError.message)
      setLoading(false)
      return
    }

    await supabase.from('event_rewards').delete().eq('event_id', eventId)

    const validRewards = rewards.filter(r => r.reward_name.trim() !== '')
    if (validRewards.length > 0) {
      await supabase.from('event_rewards').insert(
        validRewards.map(r => ({
          event_id: eventId,
          place: r.place,
          reward_name: r.reward_name,
          reward_description: r.reward_description
        }))
      )
    }

    alert('✅ Событие обновлено!')
    router.push('/admin')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">️ Редактировать событие</h1>
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">← Назад</Link>
        </div>

        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Тип</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
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
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
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
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Дата и время</label>
                <input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Макс. участников</label>
                <input 
                  type="number" 
                  value={maxParticipants} 
                  onChange={e => setMaxParticipants(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-400">🏆 Призовые места</label>
                <button 
                  type="button"
                  onClick={addReward}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-bold"
                >
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
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="ml-auto text-red-400 hover:text-red-300 text-sm"
                        >
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
                          {POPULAR_REWARDS.map(r => (
                            <option key={r} value={r} />
                          ))}
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : '💾 Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}