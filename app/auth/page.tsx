'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })
      if (error) {
        setError(error.message)
      } else {
        alert('✅ Регистрация успешна! Теперь войди.')
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Анимированные руны */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-8xl text-yellow-500/10 animate-spin" style={{ animationDuration: '20s' }}>ᚠ</div>
        <div className="absolute top-40 right-20 text-7xl text-purple-500/10 animate-spin" style={{ animationDuration: '25s' }}>ᚢ</div>
        <div className="absolute bottom-20 left-1/3 text-9xl text-red-500/10 animate-spin" style={{ animationDuration: '30s' }}>ᚦ</div>
        <div className="absolute bottom-40 right-1/3 text-8xl text-blue-500/10 animate-spin" style={{ animationDuration: '22s' }}>ᚨ</div>
      </div>

      <div className="relative z-10 max-w-5xl w-full bg-black/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Левая часть - Персонаж */}
        <div className="md:w-1/2 bg-gradient-to-br from-purple-900/80 to-red-900/80 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Светящийся круг за персонажем */}
          <div className="absolute w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
          
          {/* Персонаж с анимацией */}
          <div className="relative z-10 mb-6">
            <div className="relative">
              {/* Свечение за персонажем */}
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl animate-pulse" />
              
              {/* Изображение персонажа */}
              <img 
                src="/character.png"
                alt="Демон"
                className="relative w-64 h-64 object-cover rounded-full border-4 border-red-500/50 shadow-2xl shadow-red-500/50 animate-bounce"
                style={{ animationDuration: '3s' }}
              />
              
              {/* Огненные частицы вокруг */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-ping" />
              <div className="absolute -top-4 right-10 w-3 h-3 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-0 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 -left-4 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-yellow-400 mb-2 text-center drop-shadow-lg">
            Крушители Подземелья
          </h2>
          <p className="text-gray-300 text-center text-lg">
            Войди и начни своё приключение!
          </p>

          {/* Декоративные элементы */}
          <div className="absolute bottom-4 left-4 text-6xl text-yellow-500/20">⚔️</div>
          <div className="absolute top-4 right-4 text-6xl text-purple-500/20">🛡️</div>
        </div>

        {/* Правая часть - Форма */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
            </h3>
            <p className="text-gray-400">
              {isLogin ? 'Войди чтобы участвовать в турнирах' : 'Зарегистрируйся и стань героем'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Никнейм</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
                  placeholder="Твой игровой ник"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition disabled:opacity-50 shadow-lg shadow-yellow-500/30"
            >
              {loading ? 'Загрузка...' : isLogin ? '⚔️ Войти' : '🔥 Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-yellow-400 transition text-sm"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-300 transition text-sm"
            >
              ← Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}