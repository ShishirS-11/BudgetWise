import { supabase } from '../lib/supabaseClient'


/*
 * ============================================================
 * CLAIM INVITED TRIPS
 *
 * When a user logs in, this connects their Supabase account
 * to any TripWise invitations that were created using their
 * email address.
 * ============================================================
 */

export async function claimTripMemberships() {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()


  if (userError) {
    throw userError
  }


  if (!user) {
    return
  }


  const {
    error,
  } = await supabase.rpc(
    'claim_trip_memberships',
  )


  if (error) {
    throw error
  }
}