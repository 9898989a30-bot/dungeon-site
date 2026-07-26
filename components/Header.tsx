import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Header() {
  const supabase = await createClient()
  
  // Получаем текущего пользователя
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile: any = null
  let isAdmin = false
  
  if (user) {
    // Получаем профиль
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
    isAdmin = data?.is_admin || false
  }

  return (
    <header className="border-b border-purple-500/20 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Логотип */}
        <Link href="/" className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition">
          ️ Крушители Подземелья
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-gray-300 hover:text-yellow-400 transition text-sm">
            Главная
          </Link>

          {user ? (
            <>
              {/* Ссылка на админку - только для админов */}
              {isAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition text-sm font-bold">
                  👑 Админка
                </Link>
              )}

              {/* Ссылка на профиль */}
              <Link href="/profile" className="text-gray-300 hover:text-yellow-400 transition text-sm">
                👤 {profile?.username || user.email?.split('@')[0] || 'Профиль'}
              </Link>

              {/* Кнопка выхода */}
              <form action="/auth/signout" method="post">
                <button 
                  type="submit" 
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm font-bold transition"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            /* Если не вошёл - кнопка Войти */
            <Link href="/auth" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold transition text-sm">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}