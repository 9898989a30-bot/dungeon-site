'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function JoinButton({ eventId, maxParticipants, currentCount }: {
  eventId: string
  maxParticipants: number | null
  currentCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const isFull = maxParticipants && currentCount >= maxParticipants

  async function handleJoin() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    const { error } = await supabase
      .from('participants')
      .insert({ event_id: eventId, user_id: user.id })

    if (error) {
      alert('Ошибка: ' + error.message)
    } else {
      router.refresh() // Обновляем страницу
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isFull || loading}
      className={`w-full py-4 text-lg font-bold rounded-lg transition ${
        isFull
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50'
      }`}
    >
      {loading ? (
        'Регистрация...'
      ) : isFull ? (
        '❌ Мест нет'
      ) : (
        '⚔️ Участвовать в событии'
      )}
    </button>
  )
}