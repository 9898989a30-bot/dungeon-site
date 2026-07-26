'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JoinButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    
    try {
      const response = await fetch('/api/join-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      })

      if (response.ok) {
        // Перезагружаем страницу чтобы обновить данные
        router.refresh()
      } else {
        const error = await response.json()
        alert('Ошибка: ' + error.error)
      }
    } catch (error) {
      alert('Ошибка при участии')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition shadow-lg shadow-green-500/30 text-lg disabled:opacity-50"
    >
      {loading ? '⏳ Обработка...' : '⚔️ Участвовать в событии'}
    </button>
  )
}