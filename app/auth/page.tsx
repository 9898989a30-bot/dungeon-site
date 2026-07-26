'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
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
  const characterRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Загружаем GSAP для анимации
    const loadGSAP = async () => {
      const gsapScript = document.createElement('script')
      gsapScript.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js'
      gsapScript.async = true
      gsapScript.onload = () => {
        if ((window as any).gsap && characterRef.current) {
          const gsap = (window as any).gsap
          
          // Анимация персонажа
          gsap.to(characterRef.current, {
            y: -10,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })

          // Анимация руки (если есть)
          const arm = characterRef.current.querySelector('.arm')
          if (arm) {
            gsap.to(arm, {
              rotation: 5,
              duration: 1.5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              transformOrigin: 'center center'
            })
          }
        }
      }
      document.body.appendChild(gsapScript)

      return () => {
        document.body.removeChild(gsapScript)
      }
    }
    loadGSAP()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Руны на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-8xl text-yellow-500/20 animate-spin" style={{ animationDuration: '30s' }}></div>
        <div className="absolute top-40 right-20 text-7xl text-purple-500/20 animate-spin" style={{ animationDuration: '25s' }}>ᚢ</div>
        <div className="absolute bottom-20 left-1/3 text-9xl text-red-500/20 animate-spin" style={{ animationDuration: '35s' }}></div>
        <div className="absolute bottom-40 right-10 text-8xl text-emerald-500/20 animate-spin" style={{ animationDuration: '28s' }}></div>
      </div>

      {/* Основной контейнер */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8">
        
        {/* Анимированный персонаж слева */}
        <div className="md:w-1/3 flex justify-center">
          <svg 
            ref={characterRef}
            viewBox="0 0 400 600" 
            className="w-64 h-auto drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }}
          >
            <defs>
              <linearGradient id="charGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Тень */}
            <ellipse cx="200" cy="580" rx="80" ry="15" fill="rgba(0,0,0,0.3)" />

            {/* Тело персонажа */}
            <g>
              {/* Ноги */}
              <rect x="170" y="400" width="25" height="120" rx="5" fill="url(#charGradient)" />
              <rect x="205" y="400" width="25" height="120" rx="5" fill="url(#charGradient)" />

              {/* Туловище */}
              <rect x="150" y="280" width="100" height="130" rx="10" fill="url(#charGradient)" />
              
              {/* Броня на груди */}
              <path d="M160 300 Q200 320 240 300 L240 380 Q200 400 160 380 Z" fill="url(#armorGradient)" />

              {/* Голова */}
              <circle cx="200" cy="220" r="50" fill="url(#charGradient)" />
              
              {/* Лицо */}
              <circle cx="185" cy="215" r="5" fill="#fbbf24" />
              <circle cx="215" cy="215" r="5" fill="#fbbf24" />
              <path d="M190 240 Q200 250 210 240" stroke="#fbbf24" strokeWidth="3" fill="none" />

              {/* Шлем/рога */}
              <path d="M170 190 L160 160 L180 180 Z" fill="url(#armorGradient)" />
              <path d="M230 190 L240 160 L220 180 Z" fill="url(#armorGradient)" />
              <circle cx="200" cy="175" r="8" fill="url(#armorGradient)" />

              {/* Рука держащая форму */}
              <g className="arm">
                <rect x="250" y="300" width="20" height="80" rx="5" fill="url(#charGradient)" transform="rotate(20 260 340)" />
                <circle cx="270" cy="385" r="15" fill="url(#armorGradient)" />
              </g>

              {/* Меч за спиной */}
              <rect x="130" y="250" width="10" height="100" rx="2" fill="#94a3b8" transform="rotate(-10 135 300)" />
              <rect x="125" y="240" width="20" height="15" rx="2" fill="url(#armorGradient)" />
            </g>
          </svg>
        </div>

        {/* Контейнер с формой справа */}
        <div className="md:w-2/3">
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
    </div>
  )
}