'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinButton({ eventId }: { eventId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        })

      if (error) {
        console.error('Ошибка участия:', error)
        return
      }

      // Убрали alert - просто обновляем состояние
      setJoined(true)
      router.refresh()
      
    } catch (error) {
      console.error('Ошибка:', error)
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <div className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg text-center text-lg">
        ✅ Ты уже участвуешь!
      </div>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg text-lg transition shadow-lg shadow-green-500/30 disabled:opacity-50"
    >
      {loading ? '⏳ Обработка...' : '✅ Участвовать'}
    </button>
  )
}