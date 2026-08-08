import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getTripItinerary,
  addTripItinerary,
  updateTripItinerary,
  deleteTripItinerary,
} from '../services/tripItineraryService'

import {
  getTrip,
} from '../services/tripService'


function TripItinerary() {
  const navigate = useNavigate()

  const [trip, setTrip] =
    useState(null)

  const [items, setItems] =
    useState([])

  const [form, setForm] =
    useState({
      date: '',
      time: '',
      title: '',
      location: '',
      description: '',
    })

  const [editingId, setEditingId] =
    useState(null)

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
        itineraryData,
      ] = await Promise.all([
        getTrip(tripId),
        getTripItinerary(tripId),
      ])

      setTrip(tripData)
      setItems(
        itineraryData,
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to load itinerary.',
      )
    } finally {
      setLoading(false)
    }
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }


  function resetForm() {
    setForm({
      date: '',
      time: '',
      title: '',
      location: '',
      description: '',
    })

    setEditingId(null)
  }


  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    if (
      !form.date ||
      !form.time ||
      !form.title.trim()
    ) {
      setMessage(
        'Date, time and activity are required.',
      )
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        const updated =
          await updateTripItinerary(
            editingId,
            form,
          )

        setItems((current) =>
          current.map(
            (item) =>
              item.id ===
              editingId
                ? updated
                : item,
          ),
        )

        setMessage(
          'Itinerary updated.',
        )
      } else {
        const item =
          await addTripItinerary({
            tripId,
            ...form,
          })

        setItems((current) => [
          ...current,
          item,
        ])

        setMessage(
          'Activity added.',
        )
      }

      resetForm()
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to save itinerary.',
      )
    } finally {
      setSaving(false)
    }
  }


  function startEditing(item) {
    setEditingId(item.id)

    setForm({
      date: item.date,
      time: item.time,
      title: item.title,
      location:
        item.location || '',
      description:
        item.description || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  async function removeItem(
    itemId,
  ) {
    const confirmed =
      window.confirm(
        'Delete this itinerary item?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteTripItinerary(
        itemId,
      )

      setItems((current) =>
        current.filter(
          (item) =>
            item.id !== itemId,
        ),
      )

      setMessage(
        'Activity removed.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to remove activity.',
      )
    }
  }


  if (loading) {
    return <PageLoading />
  }


  return (
    <div className="mx-auto max-w-6xl">

      <button
        type="button"
        onClick={() =>
          navigate('/tripwise')
        }
        className="mb-7 text-sm font-medium text-[#7c8781] hover:text-[#527d71]"
      >
        ← Back to TripWise
      </button>


      <header className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78968b]">
          {trip?.name}
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843] sm:text-5xl">
          The itinerary
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7c8781]">
          Decide where you're going, what you're
          doing and when you're doing it.
        </p>

      </header>


      {message && (
        <div className="mb-6 rounded-2xl border border-[#cbded6] bg-[#eef6f2] px-4 py-3 text-sm text-[#527d71]">
          {message}
        </div>
      )}


      {/* ADD / EDIT */}

      <section className="rounded-[28px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              {editingId
                ? 'Edit activity'
                : 'New activity'}
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
              {editingId
                ? 'Change the plan'
                : 'Add to the plan'}
            </h2>

          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-[#7c8781]"
            >
              Cancel edit
            </button>
          )}

        </div>


        <form
          onSubmit={handleSubmit}
          className="mt-7 grid gap-5 md:grid-cols-2"
        >

          <Field
            label="Date"
          >
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass()}
            />
          </Field>


          <Field
            label="Time"
          >
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className={inputClass()}
            />
          </Field>


          <Field
            label="What are you doing?"
            className="md:col-span-2"
          >
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Breakfast at the beach"
              className={inputClass()}
            />
          </Field>


          <Field
            label="Where?"
          >
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Baga Beach"
              className={inputClass()}
            />
          </Field>


          <Field
            label="Notes"
          >
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Anything everyone should know..."
              className={inputClass()}
            />
          </Field>


          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#527d71] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#456c61] disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Add activity'}
            </button>

          </div>

        </form>

      </section>


      {/* TIMELINE */}

      <section className="mt-7">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              Your plans
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
              {items.length}{' '}
              {items.length === 1
                ? 'activity'
                : 'activities'}
            </h2>
          </div>

        </div>


        {items.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d8d1c5] bg-[#fffdf8] px-6 py-14 text-center">

            <p className="text-3xl">
              🗺️
            </p>

            <p className="mt-4 font-serif text-xl font-semibold text-[#334843]">
              Your itinerary is empty
            </p>

            <p className="mt-2 text-sm text-[#7f8984]">
              Add your first activity above.
            </p>

          </div>
        ) : (
          <div className="space-y-3">

            {items.map(
              (item) => (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-[#ddd6ca] bg-[#fffdf8] p-5 shadow-sm"
                >

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    <div className="min-w-[120px]">

                      <p className="font-serif text-xl font-semibold text-[#527d71]">
                        {formatTime(
                          item.time,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-[#929b96]">
                        {formatDate(
                          item.date,
                        )}
                      </p>

                    </div>


                    <div className="hidden h-12 w-px bg-[#e3ddd3] sm:block" />


                    <div className="flex-1">

                      <h3 className="font-serif text-xl font-semibold text-[#334843]">
                        {item.title}
                      </h3>

                      {item.location && (
                        <p className="mt-1 text-sm text-[#68746f]">
                          📍 {item.location}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-2 text-sm text-[#8a928e]">
                          {item.description}
                        </p>
                      )}

                    </div>


                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            item,
                          )
                        }
                        className="rounded-xl border border-[#d8d1c5] px-4 py-2 text-xs font-medium text-[#68746f]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id,
                          )
                        }
                        className="rounded-xl border border-[#e3c3bd] px-4 py-2 text-xs font-medium text-[#a65d52]"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>
              ),
            )}

          </div>
        )}

      </section>

    </div>
  )
}


function Field({
  label,
  children,
  className = '',
}) {
  return (
    <label className={className}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d76]">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  )
}


function inputClass() {
  return 'w-full rounded-2xl border border-[#dcd5c9] bg-[#fffdf8] px-4 py-3 text-sm text-[#334843] outline-none placeholder:text-[#a7ada9] focus:border-[#7ca194] focus:ring-4 focus:ring-[#7ca194]/10'
}


function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}


function formatTime(time) {
  if (!time) {
    return ''
  }

  const [
    hour,
    minute,
  ] = time.split(':')

  const date =
    new Date()

  date.setHours(
    Number(hour),
    Number(minute),
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  ).format(date)
}


function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d8e6e0] border-t-[#527d71]" />
    </div>
  )
}


export default TripItinerary