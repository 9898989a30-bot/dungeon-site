import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*').order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">🔥 Активные события</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {events && events.map((event: any) => (
          <Link 
            href={`/events/${event.id}`} 
            key={event.id} 
            className="bg-black/40 border border-purple-500/20 p-5 rounded-xl hover:border-yellow-400/50 transition block"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{event.type === 'tournament' ? '⚔️' : ''}</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30">Регистрация</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{event.description}</p>
            {event.reward_role && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 rounded text-sm text-yellow-300">
                🏆 Приз: <span className="font-bold">{event.reward_role}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
      {(!events || events.length === 0) && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Подземелье пока пусто...</p>
        </div>
      )}
    </div>
  )
}