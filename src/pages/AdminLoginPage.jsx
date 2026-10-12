import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import { isAdminLoginConfigured, signInAdmin } from '../lib/adminAuth'

export default function AdminLoginPage({ session }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const { error: signInError } = await signInAdmin({ username, password })
      if (signInError) setError(signInError.message)
      else navigate('/admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Portfolio administration</p>
            <h1 className="text-4xl font-bold">Sign in</h1>
          </div>
          {!isAdminLoginConfigured && (
            <p className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Admin login is not configured. Please check the site configuration.
            </p>
          )}
          <label className="block text-sm font-bold">
            Username
            <input required type="text" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full border border-gray-300 p-3 font-normal" />
          </label>
          <label className="block text-sm font-bold">
            Password
            <input required type="password" name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border border-gray-300 p-3 font-normal" />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={!isAdminLoginConfigured || isSubmitting} className="w-full bg-black px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    </PageTransition>
  )
}
