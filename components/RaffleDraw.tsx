'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Participant {
  id: string
  profiles: {
    username: string
    game_nickname?: string
    guild_name?: string
  }
}

export function RaffleDraw({ eventId, participants }: { 
  eventId: string
  participants: Participant[]
}) {
  const supabase = createClient()
  const [rolling, setRolling] = useState(false)
  const [winner, setWinner] = useState<Participant | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  async function drawWinner() {
    if (participants.length === 0) {
      alert('Нет участников для розыгрыша!')
      return
    }

    setRolling(true)
    setWinner(null)

    // Эффект рулетки - 3 секунды показываем случайных участников
    let count = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length)
      setSelectedIndex(randomIndex)
      count++
      
      if (count > 25) { // Останавливаемся через ~3 секунды
        clearInterval(interval)
        finalizeWinner()
      }
    }, 120)
  }

  async function finalizeWinner() {
    // Выбираем случайного победителя
    const finalWinner = participants[Math.floor(Math.random() * participants.length)]
    setWinner(finalWinner)
    setRolling(false)

    // Сохраняем победителя в базу
    const { error } = await supabase
      .from('events')
      .update({ 
        winner_id: finalWinner.id,
        status: 'finished'
      })
      .eq('id', eventId)

    if (error) {
      alert('Ошибка сохранения победителя: ' + error.message)
    } else {
      alert(`🎉 Победитель: ${finalWinner.profiles.username}!`)
    }
  }

  if (participants.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
        <p>Нет участников для розыгрыша</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
        🎲 Розыгрыш победителя
      </h3>

      {/* Анимация рулетки */}
      {rolling && (
        <div className="mb-6 bg-black/40 rounded-lg p-4">
          <p className="text-center text-gray-400 mb-2">Выбираем победителя...</p>
          {participants[selectedIndex] && (
            <div className="flex items-center justify-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                {participants[selectedIndex].profiles.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-lg">
                  {participants[selectedIndex].profiles.username}
                </p>
                {participants[selectedIndex].profiles.game_nickname && (
                  <p className="text-sm text-gray-300">
                    {participants[selectedIndex].profiles.game_nickname}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Победитель */}
      {winner && !rolling && (
        <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-lg p-6 text-center">
          <p className="text-yellow-400 font-bold mb-2 text-lg">🏆 Победитель розыгрыша!</p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
              {winner.profiles.username[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-xl">{winner.profiles.username}</p>
              {winner.profiles.game_nickname && (
                <p className="text-gray-300">Игра: {winner.profiles.game_nickname}</p>
              )}
              {winner.profiles.guild_name && (
                <p className="text-gray-400 text-sm">Гильдия: {winner.profiles.guild_name}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка розыгрыша */}
      <button
        onClick={drawWinner}
        disabled={rolling}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/50"
      >
        {rolling ? '🎲 Крутим рулетку...' : '🎁 Разыграть победителя'}
      </button>

      <p className="text-center text-sm text-gray-400 mt-3">
        Участники: {participants.length}
      </p>
    </div>
  )
}