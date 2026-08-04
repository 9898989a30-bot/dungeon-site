import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) redirect('/admin')

  const { data: rewards } = await supabase
    .from('event_rewards')
    .select('*')
    .eq('event_id', id)
    .order('place', { ascending: true })

  const { data: participants } = await supabase
    .from('event_participants')
    .select('id, user_id, joined_at')
    .eq('event_id', id)
    .order('joined_at', { ascending: true })

  // Получаем ники участников
  let usernames: Record<string, string> = {}
  if (participants && participants.length > 0) {
    const userIds = participants.map((p: any) => p.user_id)
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

  const participantsWithNames = participants?.map(p => ({
    ...p,
    username: usernames[p.user_id] || p.user_id.slice(0, 8) + '...'
  })) || []

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">👑 Админка события</h1>
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">← Назад в админку</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
                  {participants?.length || 0} / {event.max_participants || '∞'}
                </span>
              </p>
            </div>

            {rewards && rewards.length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">🏆 Призы:</h3>
                <div className="space-y-1">
                  {rewards.map((r: any) => (
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
                href={`/admin/events/${id}/edit`}
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-center transition"
              >
                ✏️ Редактировать
              </Link>
              
              {participants && participants.length > 0 && event.status !== 'completed' && (
                <form action={`/api/admin/events/${id}/raffle`} method="POST">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition shadow-lg shadow-yellow-500/30"
                    onClick={(e) => {
                      if (!confirm('⚠️ Провести розыгрыш среди участников?')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    🎲 Разыграть призы
                  </button>
                </form>
              )}
              
              {event.status === 'completed' && (
                <div className="w-full py-3 bg-gray-700 text-gray-300 font-bold rounded-lg text-center border border-gray-600">
                  ✅ Розыгрыш уже проведён
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              👥 Участники ({participants?.length || 0})
            </h2>

            {participantsWithNames.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {participantsWithNames.map((participant: any, index: number) => (
                  <div 
                    key={participant.id}
                    className="bg-black/40 border border-purple-500/20 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {participant.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(participant.joined_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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