'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Вход
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          console.error('Ошибка входа:', signInError)
          setError('Неверный email или пароль')
          setLoading(false)
          return
        }

        // Убрали alert - просто переходим
        router.push('/')
        router.refresh()
        
      } else {
        // Регистрация
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        })

        if (signUpError) {
          console.error('Ошибка регистрации:', signUpError)
          setError(signUpError.message)
          setLoading(false)
          return
        }

// Создаём профиль
if (authData.user) {
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      username: username || email.split('@')[0],  // ✅ НИК игрока
      game_nickname: null,  // или можно тоже username
      is_admin: false
    })

  if (profileError) {
    console.error('Ошибка создания профиля:', profileError)
  }
}

        // Убрали alert - просто переходим на главную
        router.push('/')
        router.refresh()
      }
      
    } catch (error: any) {
      console.error('Ошибка:', error)
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="text-center text-gray-400 mb-8">
            {isLogin ? 'С возвращением, герой!' : 'Создай аккаунт для участия'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Имя пользователя</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Придумай никнейм"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              {loading ? '⏳ Обработка...' : (isLogin ? '🔐 Войти' : '✨ Зарегистрироваться')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/20 text-center">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}