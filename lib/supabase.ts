import { createClient } from "@supabase/supabase-js"

// Untuk client-side
export const createClientComponentClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Untuk server-side
export const createServerComponentClient = () => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Singleton pattern untuk client-side
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}
