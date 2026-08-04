import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single() : { data: null }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Навигация */}
      <nav className="relative z-10 border-b border-purple-500/20 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">️</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Крушители Подземелья
            </h1>
          </div>
          
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
                <span className="text-gray-300">👤 {profile?.username || 'Пользователь'}</span>
                <Link href="/api/auth/logout" className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition font-medium">
                  Выйти
                </Link>
              </div>
            ) : (
              <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition font-bold shadow-lg shadow-purple-500/30">
                Войти
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Герой секция */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient">
          Добро пожаловать, герой!
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Участвуй в эпических турнирах и розыгрышах. Побеждай и получай легендарные призы!
        </p>
        
        {user ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Ты в игре! Готов к битве?
          </div>
        ) : (
          <Link href="/auth" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition transform hover:scale-105 shadow-2xl shadow-orange-500/50 text-lg">
            ️ Начать приключение
          </Link>
        )}
      </section>

      {/* События */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Активные события
          </h3>
          <span className="text-gray-400">
            {events?.length || 0} {events?.length === 1 ? 'событие' : events?.length < 5 ? 'события' : 'событий'}
          </span>
        </div>

        {events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any, index: number) => {
              const isCompleted = event.status === 'completed'
              const hasParticipants = (event.max_participants || 0) > 0
              
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Градиентный эффект при наведении */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all duration-300" />
                  
                  <div className="relative z-10">
                    {/* Заголовок карточки */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">
                          {event.type === 'tournament' ? '️' : '🎁'}
                        </span>
                        <div>
                          <h4 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">
                            {event.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {event.type === 'tournament' ? 'Турнир' : 'Розыгрыш'}
                          </span>
                        </div>
                      </div>
                      
                      {isCompleted && (
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          Завершено
                        </span>
                      )}
                    </div>

                    {/* Описание */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Информация */}
                    <div className="space-y-2 mb-4">
                      {event.start_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-purple-400">📅</span>
                          <span className="text-gray-300">
                            {new Date(event.start_date).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {hasParticipants && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-400">👥</span>
                          <span className="text-gray-300">
                            {event.max_participants} мест
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Кнопка */}
                    <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                      <span className={`text-sm font-medium ${
                        isCompleted ? 'text-gray-500' : 'text-green-400'
                      }`}>
                        {isCompleted ? 'Завершено' : 'Активно'}
                      </span>
                      <span className="text-yellow-400 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-black/20 border-2 border-dashed border-purple-500/30 rounded-2xl">
            <span className="text-6xl mb-4 block">🏰</span>
            <h4 className="text-2xl font-bold text-white mb-2">Пока нет событий</h4>
            <p className="text-gray-400">Следи за обновлениями — скоро начнутся эпические битвы!</p>
          </div>
        )}
      </section>

      {/* Футер */}
      <footer className="relative z-10 border-t border-purple-500/20 backdrop-blur-sm bg-black/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">
          <p>⚔️ Крушители Подземелья © 2026</p>
          <p className="text-sm mt-2">Создано с ❤️ для настоящих героев</p>
        </div>
      </footer>
    </main>
  )
}