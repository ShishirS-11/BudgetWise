import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'

import {
  claimTripMemberships,
} from '../services/tripMembershipService'


const AuthContext =
  createContext(null)


export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null)

  const [session, setSession] =
    useState(null)

  const [loading, setLoading] =
    useState(true)


  /*
   * ============================================================
   * CLAIM TRIP INVITATIONS
   *
   * Whenever a user has a valid Supabase session, check whether
   * their email has been invited to any TripWise trips.
   * ============================================================
   */

  async function claimInvitedTrips() {
    try {
      await claimTripMemberships()
    } catch (error) {
      /*
       * Do not prevent the user from logging into BudgetWise
       * just because TripWise membership claiming failed.
       */

      console.error(
        'TripWise membership claim failed:',
        error,
      )
    }
  }


  useEffect(() => {
    let active = true


    /*
     * ==========================================================
     * INITIALIZE AUTH
     * ==========================================================
     */

    async function initializeAuth() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession()


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


        setSession(
          currentSession,
        )

        setUser(
          currentSession?.user ??
            null,
        )


        /*
         * If a user is already logged in when the application
         * starts, claim their TripWise invitations.
         */

        if (
          currentSession?.user
        ) {
          await claimInvitedTrips()
        }

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


    /*
     * ==========================================================
     * AUTH STATE LISTENER
     * ==========================================================
     */

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          currentSession,
        ) => {

          if (!active) {
            return
          }


          setSession(
            currentSession ??
              null,
          )

          setUser(
            currentSession?.user ??
              null,
          )


          /*
           * Only attempt membership claiming when there is
           * an authenticated user.
           */

          if (
            currentSession?.user
          ) {
            await claimInvitedTrips()
          }


          setLoading(false)
        },
      )


    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    return () => {
      active = false

      authListener
        ?.subscription
        ?.unsubscribe()
    }

  }, [])


  /*
   * ============================================================
   * SIGN OUT
   * ============================================================
   */

  async function signOut() {
    const {
      error,
    } =
      await supabase.auth.signOut()


    if (error) {
      throw error
    }


    setUser(null)

    setSession(null)
  }


  /*
   * ============================================================
   * CONTEXT
   * ============================================================
   */

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,

        isAuthenticated:
          Boolean(user),

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


/*
 * ============================================================
 * USE AUTH
 * ============================================================
 */

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    )


  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }


  return context
}