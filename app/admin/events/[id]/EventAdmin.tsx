'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Participant {
  id: string
  user_id: string
  joined_at: string
  username?: string
}

interface Reward {
  id: string
  place: number
  reward_name: string
  reward_description?: string
}

export default function EventAdmin() {
  const params = useParams()
  const eventId = params.id as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [raffling, setRaffling] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'slowing' | 'winner' | 'done'>('idle')
  const [winners, setWinners] = useState<string[]>([])
  const [currentPlace, setCurrentPlace] = useState(1)

  useEffect(() => {
    loadData()
  }, [eventId])

  async function loadData() {
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      const { data: rewardsData } = await supabase
        .from('event_rewards')
        .select('*')
        .eq('event_id', eventId)
        .order('place', { ascending: true })

      const { data: participantsData } = await supabase
        .from('event_participants')
        .select('id, user_id, joined_at')
        .eq('event_id', eventId)
        .order('joined_at', { ascending: true })

      // Получаем ники
      let usernames: Record<string, string> = {}
      if (participantsData && participantsData.length > 0) {
        const userIds = participantsData.map(p => p.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)
        
        if (profiles) {
          profiles.forEach((p: any) => {
            usernames[p.id] = p.username || 'Аноним'
          })
        }
      }

      setEvent(eventData)
      setRewards(rewardsData || [])
      setParticipants(participantsData?.map(p => ({
        ...p,
        username: usernames[p.user_id] || p.user_id.slice(0, 8) + '...'
      })) || [])
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startRaffle() {
    if (participants.length === 0) return
    if (!confirm('⚠️ Провести розыгрыш среди участников?')) return

    setRaffling(true)
    setPhase('spinning')
    setWinners([])
    setCurrentPlace(1)

    try {
      const response = await fetch(`/api/admin/events/${eventId}/raffle`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Ошибка: ' + (data.error || 'Не удалось провести розыгрыш'))
        setPhase('idle')
        setRaffling(false)
        return
      }

      const winnerIds = data.winners || []
      await animateForPlace(winnerIds, 1)

    } catch (error) {
      console.error('Ошибка розыгрыша:', error)
      alert('Произошла ошибка')
      setPhase('idle')
      setRaffling(false)
    }
  }

  const animateForPlace = async (winnerIds: string[], place: number) => {
    if (place > winnerIds.length) {
      setPhase('done')
      setTimeout(() => {
        loadData()
      }, 2000)
      return
    }

    const winnerId = winnerIds[place - 1]
    const winnerIndex = participants.findIndex(p => p.user_id === winnerId)
    
    if (winnerIndex === -1) return

    setPhase('spinning')
    setCurrentPlace(place)

    // Фаза 1: Быстрое мелькание (2 секунды)
    let speed = 50
    let elapsed = 0
    const fastDuration = 2000

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.length)
        setCurrentIndex(randomIndex)
        elapsed += speed

        if (elapsed >= fastDuration) {
          clearInterval(interval)
          resolve()
        }
      }, speed)
    })

    // Фаза 2: Замедление
    setPhase('slowing')
    await new Promise<void>((resolve) => {
      let slowSpeed = 100
      const runSlow = () => {
        const randomIndex = Math.floor(Math.random() * participants.length)
        setCurrentIndex(randomIndex)
        
        slowSpeed += 30
        
        if (slowSpeed < 400) {
          setTimeout(runSlow, slowSpeed)
        } else {
          resolve()
        }
      }
      runSlow()
    })

    // Фаза 3: Финальное замедление к победителю
    await new Promise<void>((resolve) => {
      let finalSpeed = 400
      let steps = 0
      const maxSteps = 5
      
      const runFinal = () => {
        if (steps < maxSteps) {
          const offset = Math.floor(Math.random() * 3) - 1
          const nearWinner = (winnerIndex + offset + participants.length) % participants.length
          setCurrentIndex(nearWinner)
          steps++
          finalSpeed += 200
          setTimeout(runFinal, finalSpeed)
        } else {
          resolve()
        }
      }
      runFinal()
    })

    // Фаза 4: Показываем победителя
    setCurrentIndex(winnerIndex)
    setPhase('winner')
    setWinners(prev => [...prev, winnerId])

    // Ждём 2 секунды и переходим к следующему месту
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await animateForPlace(winnerIds, place + 1)
  }

  const getMedal = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-400">Загрузка...</p>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-400">Событие не найдено</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">👑 Админка события</h1>
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">← Назад в админку</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Информация о событии */}
          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
            <p className="text-gray-400 mb-4">{event.description}</p>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-400">Статус:</span>{' '}
                <span className={event.status === 'completed' ? 'text-red-400' : 'text-green-400'}>
                  {event.status === 'completed' ? 'Завершено' : 'Регистрация'}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Участников:</span>{' '}
                <span className="text-white font-bold">
                  {participants.length} / {event.max_participants || '∞'}
                </span>
              </p>
            </div>

            {rewards.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-2"> Призы:</h3>
                <div className="space-y-1">
                  {rewards.map((r) => (
                    <p key={r.id} className="text-sm text-white">
                      <span className="text-yellow-400 font-bold">#{r.place}:</span> {r.reward_name}
                      {r.reward_description && <span className="text-gray-400"> ({r.reward_description})</span>}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Link
                href={`/admin/events/${eventId}/edit`}
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-center transition"
              >
                ✏️ Редактировать
              </Link>
              
              {participants.length > 0 && event.status !== 'completed' && !raffling && (
                <button
                  onClick={startRaffle}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition shadow-lg shadow-yellow-500/30"
                >
                  🎲 Разыграть призы
                </button>
              )}
              
              {event.status === 'completed' && (
                <div className="w-full py-3 bg-gray-700 text-gray-300 font-bold rounded-lg text-center border border-gray-600">
                  ✅ Розыгрыш уже проведён
                </div>
              )}
            </div>
          </div>

          {/* Участники и анимация */}
          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                👥 Участники ({participants.length})
              </h2>
              {phase !== 'idle' && phase !== 'done' && (
                <span className="text-yellow-400 font-bold animate-pulse">
                  Разыгрываем {getMedal(currentPlace - 1)} место...
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {participants.map((participant, index) => {
                const isCurrent = index === currentIndex
                const isWinner = winners.includes(participant.user_id)
                const winnerPlace = winners.indexOf(participant.user_id)
                
                return (
                  <div
                    key={participant.id}
                    className={`
                      relative rounded-lg p-3 flex items-center gap-3 transition-all duration-150
                      ${isWinner 
                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50 scale-105' 
                        : isCurrent && phase !== 'idle' && phase !== 'done'
                          ? 'bg-purple-500/40 border-2 border-purple-400 shadow-lg shadow-purple-500/50 scale-105'
                          : 'bg-black/40 border border-purple-500/20'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                      ${isWinner
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black text-lg'
                        : isCurrent && phase !== 'idle' && phase !== 'done'
                          ? 'bg-purple-500 text-white animate-pulse'
                          : 'bg-purple-500/30 text-purple-300'
                      }
                    `}>
                      {isWinner ? getMedal(winnerPlace) : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`
                        font-semibold truncate transition-all
                        ${isWinner 
                          ? 'text-yellow-300 text-lg' 
                          : isCurrent && phase !== 'idle' && phase !== 'done'
                            ? 'text-white text-lg'
                            : 'text-white'
                        }
                      `}>
                        {participant.username}
                      </p>
                      {isWinner && (
                        <p className="text-xs text-yellow-400 font-bold">
                           {getMedal(winnerPlace)} место!
                        </p>
                      )}
                      {!isWinner && (
                        <p className="text-xs text-gray-500">
                          {new Date(participant.joined_at).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>

                    {isCurrent && phase !== 'idle' && phase !== 'done' && !isWinner && (
                      <div className="absolute inset-0 rounded-lg bg-purple-400/20 animate-ping" />
                    )}
                  </div>
                )
              })}
            </div>

            {phase === 'done' && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                <p className="text-green-400 font-bold text-lg">🎉 Розыгрыш завершён!</p>
                <p className="text-gray-300 text-sm mt-1">Победители определены</p>
              </div>
            )}

            {participants.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-black/20 rounded-xl border border-dashed border-gray-700">
                <p>Нет участников</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}