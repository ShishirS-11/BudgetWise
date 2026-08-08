import { supabase } from '../lib/supabaseClient'


/*
 * ============================================================
 * GET CURRENT USER
 * ============================================================
 */

async function getCurrentUser() {
  const {
    data: {
      user,
    },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  return user
}


/*
 * ============================================================
 * MAP DATABASE TRIP
 * ============================================================
 */

function mapTrip(trip) {
  return {
    id: trip.id,

    name:
      trip.name,

    destination:
      trip.destination,

    startDate:
      trip.start_date,

    endDate:
      trip.end_date,

    leader:
      trip.leader,

    description:
      trip.description || '',

    createdAt:
      trip.created_at,

    userId:
      trip.user_id,
  }
}


/*
 * ============================================================
 * GET ALL ACCESSIBLE TRIPS
 *
 * This is intentionally NOT filtered with:
 *
 * .eq('user_id', user.id)
 *
 * because Supabase RLS now decides whether the logged-in
 * user is:
 *
 * 1. The trip leader
 * OR
 * 2. An invited trip member
 * ============================================================
 */

export async function getTrips() {
  await getCurrentUser()

  const {
    data,
    error,
  } = await supabase
    .from('trips')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    )

  if (error) {
    throw error
  }

  return (
    data || []
  ).map(mapTrip)
}


/*
 * ============================================================
 * GET ONE ACCESSIBLE TRIP
 *
 * RLS determines whether the user is allowed to see it.
 * This works for both leaders and invited members.
 * ============================================================
 */

export async function getTrip(
  tripId,
) {
  await getCurrentUser()

  if (!tripId) {
    throw new Error(
      'Trip ID is required.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('trips')
    .select('*')
    .eq(
      'id',
      tripId,
    )
    .single()

  if (error) {
    throw error
  }

  return mapTrip(data)
}


/*
 * ============================================================
 * CREATE NEW TRIP
 *
 * The logged-in user becomes the trip leader/owner.
 * ============================================================
 */

export async function createTrip({
  name,
  destination,
  startDate,
  endDate,
  leader,
  description,
}) {
  const user =
    await getCurrentUser()


  if (
    !name?.trim() ||
    !destination?.trim() ||
    !startDate ||
    !endDate ||
    !leader?.trim()
  ) {
    throw new Error(
      'Please complete all required trip details.',
    )
  }


  if (
    endDate <
    startDate
  ) {
    throw new Error(
      'End date cannot be before the start date.',
    )
  }


  const {
    data,
    error,
  } = await supabase
    .from('trips')
    .insert({
      user_id:
        user.id,

      name:
        name.trim(),

      destination:
        destination.trim(),

      start_date:
        startDate,

      end_date:
        endDate,

      leader:
        leader.trim(),

      description:
        description?.trim() ||
        null,
    })
    .select()
    .single()


  if (error) {
    throw error
  }


  return mapTrip(data)
}


/*
 * ============================================================
 * UPDATE TRIP
 *
 * Only the leader can update the trip.
 *
 * Supabase RLS is responsible for enforcing this.
 * ============================================================
 */

export async function updateTrip(
  tripId,
  updates,
) {
  const user =
    await getCurrentUser()


  if (!tripId) {
    throw new Error(
      'Trip ID is required.',
    )
  }


  if (
    !updates ||
    typeof updates !==
      'object'
  ) {
    throw new Error(
      'Trip updates are required.',
    )
  }


  const databaseUpdates =
    {}


  if (
    updates.name !==
    undefined
  ) {
    databaseUpdates.name =
      updates.name.trim()
  }


  if (
    updates.destination !==
    undefined
  ) {
    databaseUpdates.destination =
      updates.destination.trim()
  }


  if (
    updates.startDate !==
    undefined
  ) {
    databaseUpdates.start_date =
      updates.startDate
  }


  if (
    updates.endDate !==
    undefined
  ) {
    databaseUpdates.end_date =
      updates.endDate
  }


  if (
    updates.leader !==
    undefined
  ) {
    databaseUpdates.leader =
      updates.leader.trim()
  }


  if (
    updates.description !==
    undefined
  ) {
    databaseUpdates.description =
      updates.description?.trim() ||
      null
  }


  /*
   * Don't send an empty update.
   */

  if (
    Object.keys(
      databaseUpdates,
    ).length === 0
  ) {
    throw new Error(
      'No trip changes were provided.',
    )
  }


  const {
    data,
    error,
  } = await supabase
    .from('trips')
    .update(
      databaseUpdates,
    )
    .eq(
      'id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .select()
    .single()


  if (error) {
    throw error
  }


  return mapTrip(data)
}


/*
 * ============================================================
 * DELETE TRIP
 *
 * Only the leader can delete a trip.
 *
 * ON DELETE CASCADE should remove related:
 *
 * - members
 * - itinerary
 * - expenses
 * - payment details
 * ============================================================
 */

export async function deleteTrip(
  tripId,
) {
  const user =
    await getCurrentUser()


  if (!tripId) {
    throw new Error(
      'Trip ID is required.',
    )
  }


  const {
    error,
  } = await supabase
    .from('trips')
    .delete()
    .eq(
      'id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )


  if (error) {
    throw error
  }
}