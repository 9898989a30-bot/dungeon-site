import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinButton from './JoinButton'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()

  // 1. Получаем событие
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (eventError || !event) {
    redirect('/')
  }

  // 2. Получаем призы
  const { data: rewards } = await supabase
    .from('event_rewards')
    .select('*')
    .eq('event_id', id)
    .order('place', { ascending: true })

  // 3. Получаем участников с данными профиля (исправленный синтаксис связи)
  const { data: participants, error: participantsError } = await supabase
    .from('event_participants')
    .select(`
      id,
      user_id,
      joined_at,
      profiles:user_id (
        username
      )
    `)
    .eq('event_id', id)
    .order('joined_at', { ascending: true })

  if (participantsError) {
    console.error('Ошибка загрузки участников:', participantsError)
  }

  // 4. Проверяем, вошёл ли пользователь
  const { data: { user } } = await supabase.auth.getUser()
  
  // 5. Проверяем, участвует ли уже
  const isParticipant = participants?.some((p: any) => p.user_id === user?.id) || false

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition"
        >
          ← Назад к событиям
        </Link>

        {/* Карточка события */}
        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl">
              {event.type === 'tournament' ? '⚔️' : '🎁'}
            </span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <p className="text-gray-400 text-lg">
                {event.description}
              </p>
            </div>
          </div>

          {/* Информация о событии */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {event.start_date && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-purple-400 mb-1">📅 Дата начала</p>
                <p className="text-white font-semibold">
                  {new Date(event.start_date).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400 mb-1">👥 Участники</p>
              <p className="text-white font-semibold">
                {participants?.length || 0} {event.max_participants ? `/ ${event.max_participants}` : ''}
              </p>
            </div>
          </div>

          {/* Призы */}
          {rewards && rewards.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                🏆 Призы
              </h2>
              <div className="space-y-3">
                {rewards.map((reward: any) => (
                  <div 
                    key={reward.id}
                    className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-4 hover:border-yellow-400/50 transition"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-yellow-500/30">
                      #{reward.place}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {reward.reward_name}
                      </h3>
                      {reward.reward_description && (
                        <p className="text-gray-400 text-sm">
                          {reward.reward_description}
                        </p>
                      )}
                    </div>
                    <div className="text-3xl">
                      {reward.place === 1 ? '🥇' : reward.place === 2 ? '🥈' : reward.place === 3 ? '🥉' : '🏅'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Кнопка участия */}
        {user && !isParticipant ? (
          <JoinButton eventId={id} />
        ) : isParticipant ? (
          <div className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg text-center text-lg shadow-lg shadow-blue-500/20">
            ✅ Ты уже участвуешь!
          </div>
        ) : (
          <Link 
            href="/auth"
            className="block w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-lg text-center text-lg transition shadow-lg shadow-yellow-500/20"
          >
            🔐 Войди чтобы участвовать
          </Link>
        )}

        {/* Список участников */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            👥 Список участников ({participants?.length || 0})
          </h2>
          
          {participants && participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant: any, index: number) => {
                // Безопасное получение имени
                const username = participant.profiles?.username || 'Аноним'
                return (
                  <div 
                    key={participant.id}
                    className="bg-black/40 border border-purple-500/20 rounded-lg p-4 flex items-center gap-3 hover:bg-purple-500/5 transition"
                  >
                    <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-sm font-bold text-purple-300">
                      {index + 1}
                    </div>
                    <span className="text-white font-semibold">
                      {username}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(participant.joined_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-black/20 rounded-xl border border-dashed border-gray-700">
              <p className="text-lg">Пока никто не зарегистрировался</p>
              <p className="text-sm mt-1">Будь первым!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}