import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AdminLoginPage({ session }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setIsSubmitting(false)

    if (signInError) setError(signInError.message)
    else navigate('/admin')
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Portfolio administration</p>
            <h1 className="text-4xl font-bold">Sign in</h1>
          </div>
          {!isSupabaseConfigured && (
            <p className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Add the Supabase environment variables before using the admin page.
            </p>
          )}
          <label className="block text-sm font-bold">
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-gray-300 p-3 font-normal" />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border border-gray-300 p-3 font-normal" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={!isSupabaseConfigured || isSubmitting} className="w-full bg-black px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    </PageTransition>
  )
}
