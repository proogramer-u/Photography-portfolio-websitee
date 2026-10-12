import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

let client = null
let configurationError = null

if (!supabaseUrl || !supabaseAnonKey) {
  configurationError = 'Gallery service configuration is missing.'
} else {
  try {
    const url = new URL(supabaseUrl)
    if (!['https:', 'http:'].includes(url.protocol) || url.pathname.replace(/\/$/, '') || url.search || url.hash || url.username || url.password) {
      configurationError = 'Gallery service configuration requires a valid project base URL.'
    } else {
      client = createClient(supabaseUrl, supabaseAnonKey)
    }
  } catch {
    configurationError = 'Gallery service configuration is invalid.'
  }
}

export const supabase = client
export const isSupabaseConfigured = Boolean(client)
export const supabaseConfigurationError = configurationError
