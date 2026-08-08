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
 * MAP MEMBER
 * ============================================================
 */

function mapMember(member) {
  return {
    id: member.id,

    tripId:
      member.trip_id,

    userId:
      member.user_id || null,

    name:
      member.name,

    email:
      member.email || '',

    role:
      member.role || 'Member',

    status:
      member.status || 'invited',

    createdAt:
      member.created_at,
  }
}


/*
 * ============================================================
 * GET TRIP MEMBERS
 *
 * Leader:
 *   Can see all members.
 *
 * Member:
 *   Can see the members of the trip they belong to.
 *
 * RLS handles the actual security.
 * ============================================================
 */

export async function getTripMembers(
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
    .from('trip_members')
    .select('*')
    .eq(
      'trip_id',
      tripId,
    )
    .order(
      'created_at',
      {
        ascending: true,
      },
    )


  if (error) {
    throw error
  }


  return (
    data || []
  ).map(mapMember)
}


/*
 * ============================================================
 * ADD TRIP MEMBER
 *
 * IMPORTANT:
 *
 * The leader supplies:
 *
 * name
 * email
 *
 * We DO NOT use the leader's user.id here.
 *
 * The invited member's user_id remains NULL until we
 * associate them with their actual account.
 * ============================================================
 */

export async function addTripMember({
  tripId,
  name,
  email,
  role = 'Member',
}) {
  const user =
    await getCurrentUser()


  if (!tripId) {
    throw new Error(
      'Trip ID is required.',
    )
  }


  if (!name?.trim()) {
    throw new Error(
      'Member name is required.',
    )
  }


  if (!email?.trim()) {
    throw new Error(
      'Member email is required.',
    )
  }


  const normalizedEmail =
    email
      .trim()
      .toLowerCase()


  /*
   * Only Leader / Member are currently supported.
   */

  const validRole =
    role === 'Leader'
      ? 'Leader'
      : 'Member'


  /*
   * Don't allow the leader to accidentally add
   * the same email twice.
   */

  const {
    data: existingMember,
    error:
      existingError,
  } = await supabase
    .from('trip_members')
    .select('id')
    .eq(
      'trip_id',
      tripId,
    )
    .eq(
      'email',
      normalizedEmail,
    )
    .maybeSingle()


  if (existingError) {
    throw existingError
  }


  if (existingMember) {
    throw new Error(
      'This email is already part of the trip.',
    )
  }


  /*
   * IMPORTANT:
   *
   * user_id is NULL here.
   *
   * The person hasn't necessarily created/logged into
   * their BudgetWise account yet.
   */

  const {
    data,
    error,
  } = await supabase
    .from('trip_members')
    .insert({
      trip_id:
        tripId,

      user_id:
        null,

      name:
        name.trim(),

      email:
        normalizedEmail,

      role:
        validRole,

      status:
        'invited',
    })
    .select()
    .single()


  if (error) {
    throw error
  }


  return mapMember(data)
}


/*
 * ============================================================
 * UPDATE MEMBER
 *
 * Leader can update:
 *
 * - name
 * - email
 * - role
 * - status
 *
 * RLS should make sure only the trip leader can perform
 * these changes.
 * ============================================================
 */

export async function updateTripMember(
  memberId,
  updates,
) {
  await getCurrentUser()


  if (!memberId) {
    throw new Error(
      'Member ID is required.',
    )
  }


  if (
    !updates ||
    typeof updates !==
      'object'
  ) {
    throw new Error(
      'Member updates are required.',
    )
  }


  const databaseUpdates =
    {}


  if (
    updates.name !==
    undefined
  ) {
    if (
      !updates.name?.trim()
    ) {
      throw new Error(
        'Member name is required.',
      )
    }

    databaseUpdates.name =
      updates.name.trim()
  }


  if (
    updates.email !==
    undefined
  ) {
    if (
      !updates.email?.trim()
    ) {
      throw new Error(
        'Member email is required.',
      )
    }

    databaseUpdates.email =
      updates.email
        .trim()
        .toLowerCase()
  }


  if (
    updates.role !==
    undefined
  ) {
    databaseUpdates.role =
      updates.role ===
      'Leader'
        ? 'Leader'
        : 'Member'
  }


  if (
    updates.status !==
    undefined
  ) {
    const validStatuses = [
      'invited',
      'active',
      'removed',
    ]

    databaseUpdates.status =
      validStatuses.includes(
        updates.status,
      )
        ? updates.status
        : 'invited'
  }


  if (
    Object.keys(
      databaseUpdates,
    ).length === 0
  ) {
    throw new Error(
      'No member changes were provided.',
    )
  }


  const {
    data,
    error,
  } = await supabase
    .from('trip_members')
    .update(
      databaseUpdates,
    )
    .eq(
      'id',
      memberId,
    )
    .select()
    .single()


  if (error) {
    throw error
  }


  return mapMember(data)
}


/*
 * ============================================================
 * DELETE / REMOVE MEMBER
 *
 * RLS should restrict this to the trip leader.
 * ============================================================
 */

export async function deleteTripMember(
  memberId,
) {
  await getCurrentUser()


  if (!memberId) {
    throw new Error(
      'Member ID is required.',
    )
  }


  const {
    error,
  } = await supabase
    .from('trip_members')
    .delete()
    .eq(
      'id',
      memberId,
    )


  if (error) {
    throw error
  }
}