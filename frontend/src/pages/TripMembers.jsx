import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getTripMembers,
  addTripMember,
  updateTripMember,
  deleteTripMember,
} from '../services/tripMemberService'

import {
  getTrip,
} from '../services/tripService'


function TripMembers() {
  const navigate = useNavigate()

  const [trip, setTrip] =
    useState(null)

  const [members, setMembers] =
    useState([])

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState('Member')

  const [editingId, setEditingId] =
    useState(null)

  const [editName, setEditName] =
    useState('')

  const [editEmail, setEditEmail] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const tripId =
    localStorage.getItem(
      'tripwise-current-trip-id',
    )


  useEffect(() => {
    if (!tripId) {
      navigate('/tripwise')
      return
    }

    loadData()
  }, [tripId])


  async function loadData() {
    setLoading(true)

    try {
      const [
        tripData,
        memberData,
      ] = await Promise.all([
        getTrip(tripId),
        getTripMembers(tripId),
      ])

      setTrip(tripData)
      setMembers(memberData)
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to load members.',
      )
    } finally {
      setLoading(false)
    }
  }


  async function handleAddMember(
    event,
  ) {
    event.preventDefault()

    if (!name.trim()) {
      setMessage(
        'Please enter a member name.',
      )
      return
    }

    if (!email.trim()) {
      setMessage(
        'Please enter the member email.',
      )
      return
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailPattern.test(
        email.trim(),
      )
    ) {
      setMessage(
        'Please enter a valid email address.',
      )
      return
    }

    setSaving(true)

    try {
      const member =
        await addTripMember({
          tripId,
          name,
          email,
          role,
        })

      setMembers((current) => [
        ...current,
        member,
      ])

      setName('')
      setEmail('')
      setRole('Member')

      setMessage(
        'Member invited successfully.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to add member.',
      )
    } finally {
      setSaving(false)
    }
  }


  function startEditing(member) {
    setEditingId(member.id)

    setEditName(
      member.name || '',
    )

    setEditEmail(
      member.email || '',
    )
  }


  function cancelEditing() {
    setEditingId(null)
    setEditName('')
    setEditEmail('')
  }


  async function saveMember(
    memberId,
  ) {
    if (!editName.trim()) {
      setMessage(
        'Member name cannot be empty.',
      )
      return
    }

    if (!editEmail.trim()) {
      setMessage(
        'Member email cannot be empty.',
      )
      return
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailPattern.test(
        editEmail.trim(),
      )
    ) {
      setMessage(
        'Please enter a valid email address.',
      )
      return
    }

    try {
      const updated =
        await updateTripMember(
          memberId,
          {
            name: editName,
            email: editEmail,
          },
        )

      setMembers((current) =>
        current.map(
          (member) =>
            member.id === memberId
              ? updated
              : member,
        ),
      )

      cancelEditing()

      setMessage(
        'Member updated.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to update member.',
      )
    }
  }


  async function removeMember(
    memberId,
  ) {
    const confirmed =
      window.confirm(
        'Remove this member from the trip?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteTripMember(
        memberId,
      )

      setMembers((current) =>
        current.filter(
          (member) =>
            member.id !== memberId,
        ),
      )

      setMessage(
        'Member removed.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to remove member.',
      )
    }
  }


  if (loading) {
    return (
      <PageLoading />
    )
  }


  return (
    <div className="mx-auto max-w-5xl">

      <BackButton
        onClick={() =>
          navigate('/tripwise')
        }
      />

      <header className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78968b]">
          {trip?.name}
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843]">
          Who's coming?
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-[#7c8781]">
          Add everyone joining the adventure.
          Add their email so they can
          automatically access this trip
          when they sign in to BudgetWise.
        </p>

      </header>


      {message && (
        <Message
          message={message}
          onClose={() =>
            setMessage('')
          }
        />
      )}


      {/* ADD MEMBER */}

      <section className="rounded-[28px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-8">

        <h2 className="font-serif text-2xl font-semibold text-[#334843]">
          Add a member
        </h2>

        <p className="mt-2 text-sm text-[#7c8781]">
          Enter their email to give them
          access to this trip when they
          log in.
        </p>

        <form
          onSubmit={
            handleAddMember
          }
          className="mt-6 grid gap-4"
        >

          <div className="grid gap-4 md:grid-cols-2">

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Member name"
              className={inputClass()}
            />

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Member email"
              className={inputClass()}
            />

          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value,
                )
              }
              className={inputClass()}
            >
              <option value="Member">
                Member
              </option>

              <option value="Leader">
                Leader
              </option>
            </select>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#527d71] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#456c61] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Adding...'
                : 'Add member'}
            </button>

          </div>

        </form>

      </section>


      {/* MEMBERS */}

      <section className="mt-6 rounded-[28px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              Trip group
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
              {members.length}{' '}
              {members.length === 1
                ? 'person'
                : 'people'}
            </h2>

          </div>

        </div>


        <div className="mt-6 space-y-3">

          {members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8d1c5] px-6 py-10 text-center">

              <p className="text-2xl">
                👥
              </p>

              <p className="mt-3 text-sm text-[#7f8984]">
                No members added yet.
              </p>

            </div>
          ) : (
            members.map(
              (member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#e4ded4] bg-[#faf8f2] p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  {editingId ===
                  member.id ? (
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row">

                      <input
                        value={
                          editName
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Member name"
                        className={inputClass()}
                      />

                      <input
                        type="email"
                        value={
                          editEmail
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditEmail(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Member email"
                        className={inputClass()}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          saveMember(
                            member.id,
                          )
                        }
                        className="rounded-xl bg-[#527d71] px-4 py-2 text-xs font-semibold text-white"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEditing
                        }
                        className="rounded-xl border border-[#d8d1c5] px-4 py-2 text-xs font-medium text-[#68746f]"
                      >
                        Cancel
                      </button>

                    </div>
                  ) : (
                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dfeee8] font-serif font-semibold text-[#527d71]">
                        {member.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-medium text-[#334843]">
                            {member.name}
                          </p>

                          <span className="rounded-full bg-[#e4f0eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#527d71]">
                            {member.role}
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-[#8b948f]">
                          {member.email ||
                            'No email added'}
                        </p>

                        {member.status && (
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a0a7a3]">
                            {member.status ===
                            'active'
                              ? 'Account connected'
                              : 'Invitation pending'}
                          </p>
                        )}

                      </div>

                    </div>
                  )}


                  {editingId !==
                    member.id && (
                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            member,
                          )
                        }
                        className="rounded-xl border border-[#d8d1c5] px-4 py-2 text-xs font-medium text-[#68746f] transition hover:bg-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeMember(
                            member.id,
                          )
                        }
                        className="rounded-xl border border-[#e3c3bd] px-4 py-2 text-xs font-medium text-[#a65d52] transition hover:bg-[#fff3f0]"
                      >
                        Remove
                      </button>

                    </div>
                  )}

                </div>
              ),
            )
          )}

        </div>

      </section>

    </div>
  )
}


/*
 * ============================================================
 * LOADING
 * ============================================================
 */

function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d8e6e0] border-t-[#527d71]" />
    </div>
  )
}


/*
 * ============================================================
 * BACK BUTTON
 * ============================================================
 */

function BackButton({
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-7 text-sm font-medium text-[#7c8781] transition hover:text-[#527d71]"
    >
      ← Back to TripWise
    </button>
  )
}


/*
 * ============================================================
 * MESSAGE
 * ============================================================
 */

function Message({
  message,
  onClose,
}) {
  return (
    <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#cbded6] bg-[#eef6f2] px-4 py-3">

      <p className="text-sm text-[#527d71]">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="ml-4 text-[#78968b] transition hover:text-[#527d71]"
      >
        ×
      </button>

    </div>
  )
}


/*
 * ============================================================
 * INPUT STYLE
 * ============================================================
 */

function inputClass() {
  return 'w-full rounded-2xl border border-[#dcd5c9] bg-[#fffdf8] px-4 py-3 text-sm text-[#334843] outline-none placeholder:text-[#a7ada9] focus:border-[#7ca194] focus:ring-4 focus:ring-[#7ca194]/10'
}


export default TripMembers