'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JoinButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    
    try {
      console.log('Отправка запроса на участие, eventId:', eventId)
      
      const response = await fetch('/api/join-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      })

      console.log('Ответ сервера:', response.status)
      
      const data = await response.json()
      console.log('Данные ответа:', data)

      if (response.ok) {
        alert('✅ Вы успешно зарегистрировались!')
        // Перезагружаем страницу чтобы обновить данные
        window.location.reload()
      } else {
        alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'))
      }
    } catch (error) {
      console.error('Ошибка при участии:', error)
      alert('Произошла ошибка при регистрации. Попробуйте снова.')
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