'use client'
import { useState } from 'react'

export default function RaffleButton({ eventId, hasParticipants, status }: { 
  eventId: string
  hasParticipants: boolean
  status: string | null
}) {
  const [loading, setLoading] = useState(false)

  async function handleRaffle() {
    if (!confirm('⚠️ Провести розыгрыш среди участников? Это действие нельзя отменить!')) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}/raffle`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(`✅ Розыгрыш проведён! Победителей: ${data.winners || 0}`)
        window.location.reload()
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось провести розыгрыш'))
      }
    } catch (error) {
      alert('Произошла ошибка при розыгрыше')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'completed') {
    return (
      <div className="w-full py-3 bg-gray-700 text-gray-300 font-bold rounded-lg text-center border border-gray-600">
        ✅ Розыгрыш уже проведён
      </div>
    )
  }

  if (!hasParticipants) {
    return null
  }

  return (
    <button
      onClick={handleRaffle}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition shadow-lg shadow-yellow-500/30 disabled:opacity-50"
    >
      {loading ? '⏳ Проводим розыгрыш...' : '🎲 Разыграть призы'}
    </button>
  )
}