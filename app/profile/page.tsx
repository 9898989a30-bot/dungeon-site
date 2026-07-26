import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">👤 Мой профиль</h1>

        <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-white font-semibold">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Никнейм</label>
            <p className="text-white font-semibold">{profile?.username || 'Не указан'}</p>
          </div>

          {profile?.is_admin && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 font-bold">👑 Ты администратор</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              Здесь скоро можно будет редактировать игровой ник, гильдию и Discord ID.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}