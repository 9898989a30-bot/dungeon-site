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
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Анимированные частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-yellow-300 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-red-400 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-purple-400 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Основной контейнер */}
      <div className="relative z-10 max-w-5xl w-full bg-white/10 backdrop-blur-xl border-2 border-emerald-300/30 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Персонаж демон */}
          <div className="md:w-1/3 p-8 flex items-center justify-center relative">
            {/* Анимация "выноса" */}
            <div className="absolute -right-12 md:-right-24 top-1/2 transform -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10 w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl animate-pulse" />
              
              {/* Демон */}
              <img 
                src="/character.png"
                alt="Демон"
                className="relative w-full h-full object-contain rounded-full border-4 border-emerald-300/50 shadow-2xl shadow-emerald-500/50 animate-bounce"
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {/* Форма регистрации */}
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white mb-2 text-center">
                {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
              </h3>
              <p className="text-emerald-200 text-center">
                {isLogin ? 'Войди чтобы участвовать в турнирах' : 'Зарегистрируйся и стань героем'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm text-emerald-200 mb-2">Никнейм</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="w-full p-3 bg-black/30 border border-emerald-300/50 rounded-lg text-white focus:border-emerald-300 focus:outline-none transition"
                    placeholder="Твой игровой ник"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-emerald-200 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-black/30 border border-emerald-300/50 rounded-lg text-white focus:border-emerald-300 focus:outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm text-emerald-200 mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-black/30 border border-emerald-300/50 rounded-lg text-white focus:border-emerald-300 focus:outline-none transition"
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
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-lg shadow-emerald-500/30"
              >
                {loading ? 'Загрузка...' : isLogin ? '⚔️ Войти' : '🔥 Зарегистрироваться'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-200 hover:text-white transition text-sm"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-300/20 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-emerald-200 hover:text-white transition text-sm"
              >
                ← Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}