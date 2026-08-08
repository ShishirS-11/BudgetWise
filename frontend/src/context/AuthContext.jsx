import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error(
            'Supabase session error:',
            error,
          )
        }

        if (!active) {
          return
        }

        const currentSession =
          data?.session ?? null

        setSession(currentSession)
        setUser(
          currentSession?.user ?? null,
        )
      } catch (error) {
        console.error(
          'Authentication initialization failed:',
          error,
        )

        if (active) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          if (!active) {
            return
          }

          setSession(
            currentSession ?? null,
          )

          setUser(
            currentSession?.user ?? null,
          )

          setLoading(false)
        },
      )

    return () => {
      active = false

      authListener?.subscription?.unsubscribe()
    }
  }, [])

  async function signOut() {
    const {
      error,
    } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}