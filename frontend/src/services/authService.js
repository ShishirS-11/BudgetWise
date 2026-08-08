import { supabase } from '../lib/supabaseClient'

export async function signUp(
  email,
  password,
  fullName,
) {
  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signIn(
  email,
  password,
) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const {
    error,
  } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const {
    data,
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user
}

export async function getSession() {
  const {
    data,
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return data.session
}