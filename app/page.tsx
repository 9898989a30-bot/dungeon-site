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

  const eventsCount = events?.length || 0

  return (
    <main className="relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Герой секция */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
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
            ⚔️ Начать приключение
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
            {eventsCount} {
              eventsCount === 0 ? 'событий' :
              eventsCount === 1 ? 'событие' : 
              eventsCount < 5 ? 'события' : 'событий'
            }
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
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all duration-300" />
                  
                  <div className="relative z-10">
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

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

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
                          <span className="text-blue-400"></span>
                          <span className="text-gray-300">
                            {event.max_participants} мест
                          </span>
                        </div>
                      )}
                    </div>

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
    </main>
  )
}