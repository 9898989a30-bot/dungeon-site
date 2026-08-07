'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setUsername(data.username || '')
    }

    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setError('Ник не может быть пустым')
      setSaving(false)
      return
    }

    if (trimmedUsername.length < 3) {
      setError('Ник должен быть минимум 3 символа')
      setSaving(false)
      return
    }

    if (trimmedUsername.length > 20) {
      setError('Ник должен быть максимум 20 символов')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: trimmedUsername,
        game_nickname: trimmedUsername
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Ошибка обновления:', updateError)
      setError('Не удалось сохранить: ' + updateError.message)
    } else {
      setMessage('✅ Ник успешно обновлён!')
      setProfile({ ...profile, username: trimmedUsername })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Загрузка...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            👤 Мой профиль
          </h1>
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition">
            ← На главную
          </Link>
        </div>

        <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-8">
          {/* Информация о пользователе */}
          <div className="mb-8 pb-6 border-b border-purple-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
                {username ? username[0].toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{username || 'Пользователь'}</h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Форма изменения ника */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Имя пользователя (ник)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Введи новый ник"
                minLength={3}
                maxLength={20}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                От 3 до 20 символов. Этот ник будут видеть другие игроки.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              {saving ? '⏳ Сохранение...' : '💾 Сохранить ник'}
            </button>
          </form>

          {/* Дополнительная информация */}
          <div className="mt-8 pt-6 border-t border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-3">📊 Информация</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Дата регистрации:</span>
                <span className="text-white">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Администратор:</span>
                <span className={profile?.is_admin ? 'text-yellow-400 font-bold' : 'text-gray-400'}>
                  {profile?.is_admin ? ' Да' : 'Нет'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}