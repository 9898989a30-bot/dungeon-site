'use client'
import { useState } from 'react'

export default function JoinButton({ eventId }: { eventId: string }) {
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

      const data = await response.json()

      if (response.ok) {
        alert('✅ Вы успешно зарегистрировались!')
        // Полная перезагрузка страницы, чтобы сервер заново запросил список участников
        window.location.reload()
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось зарегистрироваться'))
      }
    } catch (error) {
      console.error('Ошибка при участии:', error)
      alert('Произошла ошибка. Попробуйте обновить страницу.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition shadow-lg shadow-green-500/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '⏳ Обработка...' : '⚔️ Участвовать в событии'}
    </button>
  )
}