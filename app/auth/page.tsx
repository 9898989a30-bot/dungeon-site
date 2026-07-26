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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Руны на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-8xl text-yellow-500/20 animate-spin" style={{ animationDuration: '30s' }}>ᚠ</div>
        <div className="absolute top-40 right-20 text-7xl text-purple-500/20 animate-spin" style={{ animationDuration: '25s' }}>ᚢ</div>
        <div className="absolute bottom-20 left-1/3 text-9xl text-red-500/20 animate-spin" style={{ animationDuration: '35s' }}></div>
        <div className="absolute bottom-40 right-10 text-8xl text-emerald-500/20 animate-spin" style={{ animationDuration: '28s' }}>ᚨ</div>
      </div>

      {/* Контейнер с формой */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-black/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
              ⚔️ {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
            </h3>
            <p className="text-gray-400 text-center text-sm">
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
                  className="w-full p-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
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
                className="w-full p-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
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
                className="w-full p-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white focus:border-yellow-400 focus:outline-none transition"
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
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              {loading ? 'Загрузка...' : isLogin ? '⚔️ Войти' : ' Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-yellow-400 transition text-sm"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
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