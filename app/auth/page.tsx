   'use client'
   import { createClient } from '@/lib/supabase/client'
   import { useState } from 'react'
   import { useRouter } from 'next/navigation'

   export default function AuthPage() {
     const [isLogin, setIsLogin] = useState(true)
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [username, setUsername] = useState('')
     const [loading, setLoading] = useState(false)
     const router = useRouter()
     const supabase = createClient()

     async function handleSubmit(e: React.FormEvent) {
       e.preventDefault()
       setLoading(true)
       if (isLogin) {
         const { error } = await supabase.auth.signInWithPassword({ email, password })
         if (error) alert('Ошибка: ' + error.message)
         else router.push('/')
       } else {
         const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
         if (error) alert('Ошибка: ' + error.message)
         else alert('Герой создан! Теперь войди в аккаунт.')
       }
       setLoading(false)
     }

     return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 text-white">
         <form onSubmit={handleSubmit} className="bg-black/60 border border-purple-500/30 p-8 rounded-xl w-full max-w-md shadow-2xl">
           <h1 className="text-3xl font-bold mb-2 text-center text-yellow-400">⚔️ Крушители</h1>
           <p className="text-center text-gray-400 mb-6 text-sm">Вход в подземелье</p>
           {!isLogin && (
             <input type="text" placeholder="Имя героя (никнейм)" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-3 mb-3 rounded bg-gray-800 border border-gray-700 focus:border-yellow-400 outline-none" />
           )}
           <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-3 rounded bg-gray-800 border border-gray-700 focus:border-yellow-400 outline-none" />
           <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full p-3 mb-4 rounded bg-gray-800 border border-gray-700 focus:border-yellow-400 outline-none" />
           <button type="submit" disabled={loading} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition disabled:opacity-50">
             {loading ? 'Загрузка...' : isLogin ? '🔓 Войти' : '🛡️ Создать героя'}
           </button>
           <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-gray-400 hover:text-yellow-400 transition">
             {isLogin ? 'Нет аккаунта? Создать героя' : 'Уже есть аккаунт? Войти'}
           </button>
         </form>
       </div>
     )
   }