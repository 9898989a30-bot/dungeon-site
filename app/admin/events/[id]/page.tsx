import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) redirect('/admin')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">👑 Админка события</h1>
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">← Назад в админку</Link>
        </div>

        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
          <p className="text-gray-400">{event.description}</p>
          <p className="mt-4 text-sm text-gray-400">Статус: {event.status || 'Регистрация'}</p>
          
          <div className="mt-6">
            <Link
              href={`/admin/events/${id}/edit`}
              className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-center transition"
            >
              ️ Редактировать
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}