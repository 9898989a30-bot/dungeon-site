'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
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
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    // Анимация появления кода с задержкой
    const timer = setTimeout(() => setShowCode(true), 500)
    return () => clearTimeout(timer)
  }, [])

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

  // Эффект "выползающего" кода
  const codeLines = [
    'class DemonAuth {',
    '  constructor() {',
    '    this.power = "";',
    '    this.realm = "Dungeon";',
    '  }',
    '  ',
    '  async login(user) {',
    '    await this.summon(user);',
    '    return await this.enterCrush();',
    '  }',
    '}'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Игровой фон с текстурой */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-matter.png')`,
        }}
      />
      
      {/* Магические эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Анимированные руны на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl text-yellow-500/10 animate-spin" style={{ animationDuration: '30s' }}>ᚠ</div>
        <div className="absolute top-40 right-20 text-7xl text-purple-500/10 animate-spin" style={{ animationDuration: '25s' }}>ᚢ</div>
        <div className="absolute bottom-20 left-1/3 text-9xl text-red-500/10 animate-spin" style={{ animationDuration: '35s' }}></div>
        <div className="absolute bottom-40 right-10 text-8xl text-emerald-500/10 animate-spin" style={{ animationDuration: '28s' }}>ᚨ</div>
        <div className="absolute top-1/3 left-1/4 text-6xl text-orange-500/10 animate-spin" style={{ animationDuration: '22s' }}>ᛉ</div>
      </div>

      {/* Частицы магии */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/30 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Основной контейнер */}
      <div className="relative z-10 max-w-6xl w-full flex flex-col md:flex-row items-center gap-8">
        
        {/* Демон слева, который "держит" форму */}
        <div className="md:w-1/3 flex justify-center relative">
          {/* Свечение за демоном */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-red-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Демон с анимацией */}
          <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-full blur-2xl animate-pulse" />
            
            <img 
              src="/character.png"
              alt="Демон"
              className="relative w-80 h-80 object-contain drop-shadow-2xl animate-bounce"
              style={{ 
                animationDuration: '4s',
                filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
              }}
            />
            
            {/* Огненные эффекты вокруг демона */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔥</div>
            </div>
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
              <div className="text-3xl animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>
            <div className="absolute -bottom-4 left-10">
              <div className="text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>💀</div>
            </div>
          </div>

          {/* Название игры */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
              Dungeon Crushers
            </h2>
            <p className="text-gray-400 text-sm mt-1">Турниры и розыгрыши</p>
          </div>
        </div>

        {/* Правая часть - Форма и код */}
        <div className="md:w-2/3 space-y-6">
          {/* "Выползающий" код */}
          <div 
            className={`bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-xl p-4 font-mono text-sm transition-all duration-1000 transform ${
              showCode ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-xs ml-2">auth.js</span>
            </div>
            <div className="space-y-1 overflow-hidden">
              {codeLines.map((line, index) => (
                <div
                  key={index}
                  className="text-emerald-400 whitespace-pre"
                  style={{
                    animation: showCode ? 'slideIn 0.3s ease-out forwards' : 'none',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    transform: 'translateX(-20px)'
                  }}
                >
                  <span className="text-gray-500 select-none">{String(index + 1).padStart(2, '0')} </span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Форма регистрации */}
          <div 
            className={`bg-black/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-1000 delay-300 transform ${
              showCode ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
                {isLogin ? '⚔️ Добро пожаловать!' : '🔥 Создать аккаунт'}
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
                {loading ? 'Загрузка...' : isLogin ? '⚔️ Войти' : '🔥 Зарегистрироваться'}
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

      {/* CSS для анимации */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}