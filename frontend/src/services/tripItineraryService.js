import { supabase } from '../lib/supabaseClient'


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


function mapItinerary(item) {
  return {
    id: item.id,
    tripId: item.trip_id,
    date: item.itinerary_date,
    time: item.itinerary_time,
    title: item.title,
    location:
      item.location || '',
    description:
      item.description || '',
    createdAt:
      item.created_at,
  }
}


/*
 * Get all itinerary items
 * for a trip.
 */
export async function getTripItinerary(
  tripId,
) {
  const user =
    await getCurrentUser()

  const {
    data,
    error,
  } = await supabase
    .from('trip_itinerary')
    .select('*')
    .eq(
      'trip_id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .order(
      'itinerary_date',
      {
        ascending: true,
      },
    )
    .order(
      'itinerary_time',
      {
        ascending: true,
      },
    )

  if (error) {
    throw error
  }

  return (
    data || []
  ).map(mapItinerary)
}


/*
 * Add an itinerary item.
 */
export async function addTripItinerary(
  {
    tripId,
    date,
    time,
    title,
    location,
    description,
  },
) {
  const user =
    await getCurrentUser()

  if (!date) {
    throw new Error(
      'Please select a date.',
    )
  }

  if (!time) {
    throw new Error(
      'Please select a time.',
    )
  }

  if (!title?.trim()) {
    throw new Error(
      'Activity title is required.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('trip_itinerary')
    .insert({
      trip_id:
        tripId,

      user_id:
        user.id,

      itinerary_date:
        date,

      itinerary_time:
        time,

      title:
        title.trim(),

      location:
        location?.trim() ||
        null,

      description:
        description?.trim() ||
        null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapItinerary(data)
}


/*
 * Update itinerary item.
 */
export async function updateTripItinerary(
  itemId,
  updates,
) {
  const user =
    await getCurrentUser()

  const databaseUpdates = {}

  if (
    updates.date !==
    undefined
  ) {
    databaseUpdates.itinerary_date =
      updates.date
  }

  if (
    updates.time !==
    undefined
  ) {
    databaseUpdates.itinerary_time =
      updates.time
  }

  if (
    updates.title !==
    undefined
  ) {
    databaseUpdates.title =
      updates.title.trim()
  }

  if (
    updates.location !==
    undefined
  ) {
    databaseUpdates.location =
      updates.location?.trim() ||
      null
  }

  if (
    updates.description !==
    undefined
  ) {
    databaseUpdates.description =
      updates.description?.trim() ||
      null
  }

  const {
    data,
    error,
  } = await supabase
    .from('trip_itinerary')
    .update(
      databaseUpdates,
    )
    .eq(
      'id',
      itemId,
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

  return mapItinerary(data)
}


/*
 * Delete itinerary item.
 */
export async function deleteTripItinerary(
  itemId,
) {
  const user =
    await getCurrentUser()

  const {
    error,
  } = await supabase
    .from('trip_itinerary')
    .delete()
    .eq(
      'id',
      itemId,
    )
    .eq(
      'user_id',
      user.id,
    )

  if (error) {
    throw error
  }
}