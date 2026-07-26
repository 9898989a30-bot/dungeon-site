import { createClient } from '@/lib/supabase/server'
import { JoinButton } from '@/components/JoinButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('registered_at, profiles(username, game_nickname, guild_name)')
    .eq('event_id', id)
    .order('registered_at', { ascending: true })

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto p-4">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition">
            ← Назад к событиям
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{event.type === 'tournament' ? '⚔️' : '🎁'}</span>
            <div>
              <h1 className="text-3xl font-bold mt-2 text-white">{event.title}</h1>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">{event.description}</p>
          
          {event.start_date && (
            <p className="text-sm text-gray-400 mb-2">
              📅 Старт: {new Date(event.start_date).toLocaleString('ru-RU')}
            </p>
          )}
          
          {event.max_participants && (
            <p className="text-sm text-gray-400 mb-4">
              👥 Мест: {participants?.length || 0} / {event.max_participants}
            </p>
          )}
        </div>

        <JoinButton 
          eventId={event.id} 
          maxParticipants={event.max_participants} 
          currentCount={participants?.length || 0} 
        />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">👥 Участники ({participants?.length || 0})</h2>
          
          {participants && participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-500 w-8 font-mono">#{i + 1}</span>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {p.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{p.profiles?.username || 'Аноним'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Пока никто не зарегистрировался</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}