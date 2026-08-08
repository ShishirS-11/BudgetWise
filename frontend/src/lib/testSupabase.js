import { supabase } from './supabaseClient'

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from('expenses')
    .select('*')
    .limit(1)

  if (error) {
    console.error(
      'Supabase connection error:',
      error,
    )

    return false
  }

  console.log(
    'Supabase connection successful.',
  )

  return true
}