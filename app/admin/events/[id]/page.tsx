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

  const { data: participants } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', id)

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
            <p className="text-sm text-gray-400">Участников: {participants?.length || 0}</p>

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
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition"
                  >
                    🎲 Разыграть призы
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">👥 Участники</h2>
            <p className="text-gray-400">Всего: {participants?.length || 0}</p>
          </div>
        </div>
      </div>
    </main>
  )
}