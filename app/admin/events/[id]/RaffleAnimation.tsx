'use client'
import { useState, useEffect, useRef } from 'react'

interface Participant {
  id: string
  user_id: string
  username: string
}

interface RaffleAnimationProps {
  participants: Participant[]
  onRaffleComplete: (winners: string[]) => void
}

export default function RaffleAnimation({ participants, onRaffleComplete }: RaffleAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'slowing' | 'winner' | 'done'>('idle')
  const [winners, setWinners] = useState<string[]>([])
  const [currentPlace, setCurrentPlace] = useState(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startRaffle = async () => {
    if (participants.length === 0) return

    setWinners([])
    setCurrentPlace(1)
    setPhase('spinning')
    
    try {
      const response = await fetch(`/api/admin/events/${participants[0]?.id ? '' : ''}raffle`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert('Ошибка: ' + (data.error || 'Не удалось провести розыгрыш'))
        setPhase('idle')
        return
      }

      const winnerIds = data.winners || []
      await animateForPlace(winnerIds, 1)
      
    } catch (error) {
      console.error('Ошибка розыгрыша:', error)
      alert('Произошла ошибка')
      setPhase('idle')
    }
  }

  const animateForPlace = async (winnerIds: string[], place: number) => {
    if (place > winnerIds.length) {
      setPhase('done')
      onRaffleComplete(winnerIds)
      return
    }

    const winnerId = winnerIds[place - 1]
    const winnerIndex = participants.findIndex(p => p.user_id === winnerId)
    
    if (winnerIndex === -1) return

    setPhase('spinning')
    setCurrentPlace(place)

    let speed = 50
    let elapsed = 0
    const fastDuration = 2000

    await new Promise<void>((resolve) => {
      intervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.length)
        setCurrentIndex(randomIndex)
        elapsed += speed

        if (elapsed >= fastDuration) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          resolve()
        }
      }, speed)
    })

    setPhase('slowing')
    await new Promise<void>((resolve) => {
      let slowSpeed = 100
      const runSlow = () => {
        const randomIndex = Math.floor(Math.random() * participants.length)
        setCurrentIndex(randomIndex)
        
        slowSpeed += 30
        
        if (slowSpeed < 400) {
          timeoutRef.current = setTimeout(runSlow, slowSpeed)
        } else {
          resolve()
        }
      }
      runSlow()
    })

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
          timeoutRef.current = setTimeout(runFinal, finalSpeed)
        } else {
          resolve()
        }
      }
      runFinal()
    })

    setCurrentIndex(winnerIndex)
    setPhase('winner')
    setWinners(prev => [...prev, winnerId])

    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await animateForPlace(winnerIds, place + 1)
  }

  const getMedal = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎲 Розыгрыш
        </h2>
        {phase !== 'idle' && phase !== 'done' && (
          <span className="text-yellow-400 font-bold animate-pulse">
            Разыгрываем {getMedal(currentPlace - 1)} место...
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                    🏆 {getMedal(winnerPlace)} место!
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

      {phase === 'idle' && (
        <button
          onClick={startRaffle}
          className="mt-4 w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition shadow-lg shadow-yellow-500/30 text-lg"
        >
           Начать розыгрыш!
        </button>
      )}

      {phase === 'done' && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
          <p className="text-green-400 font-bold text-lg"> Розыгрыш завершён!</p>
          <p className="text-gray-300 text-sm mt-1">Победители определены</p>
        </div>
      )}
    </div>
  )
}