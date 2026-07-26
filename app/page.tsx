import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*').order('created_at', { ascending: false })

  return (
    <div className="relative min-h-screen">
      {/* Фоновое изображение с затемнением */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&q=80')`
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/40 via-black/60 to-black/80" />

      {/* Декоративные руны на фоне */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-9xl text-yellow-500/20 animate-pulse">ᚠ</div>
        <div className="absolute top-40 right-20 text-8xl text-purple-500/20 animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 text-7xl text-red-500/20 animate-pulse">ᛉ</div>
        <div className="absolute bottom-20 right-1/3 text-9xl text-blue-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Hero секция */}
        <div className="text-center mb-12 py-12">
          <div className="inline-block mb-4">
            <span className="text-6xl animate-bounce inline-block">️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            Крушители Подземелья
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Участвуй в турнирах, побеждай в розыгрышах и получай легендарные призы!
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <div className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full text-sm">
              🎁 Розыгрыши
            </div>
            <div className="px-4 py-2 bg-red-600/30 border border-red-500/50 rounded-full text-sm">
              ⚔️ Турниры
            </div>
            <div className="px-4 py-2 bg-yellow-600/30 border border-yellow-500/50 rounded-full text-sm">
              🏆 Призы
            </div>
          </div>
        </div>

        {/* События */}
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="text-4xl">🔥</span>
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Активные события
          </span>
          <span className="ml-auto text-lg text-gray-400 font-normal">
            {events?.length || 0} {events?.length === 1 ? 'событие' : 'событий'}
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {events && events.map((event: any) => (
            <Link 
              href={`/events/${event.id}`} 
              key={event.id} 
              className="group relative bg-gradient-to-br from-gray-900/90 to-purple-900/50 border-2 border-purple-500/30 p-6 rounded-2xl hover:border-yellow-400/70 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
            >
              {/* Светящийся эффект при наведении */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-purple-500/0 group-hover:from-yellow-400/10 group-hover:to-purple-500/10 transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {event.type === 'tournament' ? '⚔️' : ''}
                  </span>
                  <span className="text-xs px-3 py-1 bg-green-500/30 text-green-300 rounded-full border border-green-500/50 font-bold uppercase tracking-wide">
                    Регистрация
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-yellow-300 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Информация о событии */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  {event.start_date && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                       {new Date(event.start_date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {event.max_participants && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                      👥 до {event.max_participants}
                    </span>
                  )}
                </div>

                {/* Призы */}
                {event.reward_role && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-200">
                      🏆 <span className="font-bold">Приз:</span> {event.reward_role}
                    </p>
                  </div>
                )}

                {/* Кнопка подробнее */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-6 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 font-bold text-sm group-hover:bg-yellow-500/40 transition-all">
                    Участвовать →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(!events || events.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🏰</div>
            <p className="text-2xl text-gray-400">Подземелье пока пусто...</p>
            <p className="text-gray-500 mt-2">Скоро здесь появятся новые события!</p>
          </div>
        )}

        {/* Футер */}
        <footer className="mt-20 text-center text-gray-500 text-sm border-t border-purple-500/20 pt-8">
          <p>⚔️ Крушители Подземелья © 2026</p>
          <p className="mt-1">Турниры и розыгрыши для настоящих героев</p>
        </footer>
      </div>
    </div>
  )
}