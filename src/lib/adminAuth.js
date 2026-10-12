import { supabase } from './supabase'

const adminUsername = import.meta.env.VITE_ADMIN_USERNAME?.trim().toLowerCase()
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim()

export const isAdminLoginConfigured = Boolean(supabase && adminUsername && adminEmail)

export async function signInAdmin({ username, password }) {
  if (!isAdminLoginConfigured) {
    return { error: new Error('Admin login is not configured.') }
  }

  if (username.trim().toLowerCase() !== adminUsername || !password) {
    return { error: new Error('Invalid username or password.') }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password })
    if (!error) return { error: null }

    const unavailable = error.name === 'AuthRetryableFetchError' || error.status === 0 || error.status === 429 || error.status >= 500
    return { error: new Error(unavailable ? 'Sign-in is temporarily unavailable. Please try again later.' : 'Invalid username or password.') }
  } catch {
    return { error: new Error('Sign-in is temporarily unavailable. Please try again later.') }
  }
}
