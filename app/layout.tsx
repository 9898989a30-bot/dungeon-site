import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import './globals.css'
import LogoutButton from '@/components/LogoutButton'
export const metadata: Metadata = {
  title: 'Крушители Подземелья',
  description: 'Участвуй в турнирах и розыгрышах',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single() : { data: null }

  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        {/* Навигация */}
        <nav className="border-b border-purple-500/20 backdrop-blur-sm bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Крушители Подземелья
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white hover:text-yellow-400 transition font-medium">
                Главная
              </Link>
              
              {profile?.is_admin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition font-medium flex items-center gap-1">
                  <span>👑</span> Админка
                </Link>
              )}
              
{user ? (
  <div className="flex items-center gap-3">
    <Link href="/profile" className="text-gray-300 hover:text-yellow-400 transition flex items-center gap-2">
      <span>👤</span>
      <span>{profile?.username || 'Пользователь'}</span>
    </Link>
    <LogoutButton />
  </div>
) : (
                <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition font-bold shadow-lg shadow-purple-500/30">
                  Войти
                </Link>
              )}
            </div>
          </div>
        </nav>

        {children}

        {/* Футер */}
        <footer className="border-t border-purple-500/20 backdrop-blur-sm bg-black/20 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">
            <p>️ Крушители Подземелья © 2026</p>
            <p className="text-sm mt-2">Создано с ❤️ для настоящих героев</p>
          </div>
        </footer>
      </body>
    </html>
  )
}