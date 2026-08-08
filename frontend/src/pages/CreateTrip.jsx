import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createTrip } from '../services/tripService'
import { addTripMember } from '../services/tripMemberService'


function CreateTrip() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    leader: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] =
    useState('')

  const [creating, setCreating] =
    useState(false)


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))

    setErrorMessage('')
  }


  function validate() {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name =
        'Give your trip a name.'
    }

    if (!form.destination.trim()) {
      nextErrors.destination =
        'Add a destination.'
    }

    if (!form.startDate) {
      nextErrors.startDate =
        'Choose a start date.'
    }

    if (!form.endDate) {
      nextErrors.endDate =
        'Choose an end date.'
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      nextErrors.endDate =
        'End date cannot be before the start date.'
    }

    if (!form.leader.trim()) {
      nextErrors.leader =
        'Add the trip leader.'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors).length === 0
    )
  }


  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setCreating(true)
    setErrorMessage('')

    try {
      /*
       * Create the actual trip
       * inside Supabase.
       */
      const trip =
        await createTrip({
          name: form.name,
          destination:
            form.destination,
          startDate:
            form.startDate,
          endDate:
            form.endDate,
          leader:
            form.leader,
          description:
            form.description,
        })


      /*
       * Add the creator as
       * the trip leader.
       */
      try {
        await addTripMember({
          tripId: trip.id,
          name: form.leader,
          role: 'Leader',
        })
      } catch (memberError) {
        /*
         * The trip already exists,
         * so don't delete it just because
         * the member insert failed.
         */
        console.error(
          'Unable to create leader member:',
          memberError,
        )
      }


      /*
       * Keep the selected trip ID
       * locally only for navigation.
       *
       * The actual data lives in Supabase.
       */
      localStorage.setItem(
        'tripwise-current-trip-id',
        trip.id,
      )

      navigate('/tripwise')
    } catch (error) {
      console.error(
        'Trip creation failed:',
        error,
      )

      setErrorMessage(
        error?.message ||
          'Unable to create the trip. Please try again.',
      )
    } finally {
      setCreating(false)
    }
  }


  return (
    <div className="mx-auto max-w-5xl">

      <div className="mb-8">

        <button
          type="button"
          onClick={() =>
            navigate('/tripwise')
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7c8781] hover:text-[#527d71]"
        >
          ← Back to TripWise
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78968b]">
          New adventure
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843] sm:text-5xl">
          Create your trip.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#78827d]">
          Start with the basics. You can add
          members, activities, expenses and
          payment details later.
        </p>

      </div>


      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-[#e1b7b0] bg-[#fff4f1] px-5 py-4">

          <p className="text-sm font-medium text-[#9c554b]">
            {errorMessage}
          </p>

        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[30px] border border-[#ddd6ca] bg-[#fffdf8] shadow-[0_12px_40px_rgba(72,68,55,0.06)]"
      >

        {/* TRIP DETAILS */}

        <section className="border-b border-[#e8e1d6] px-6 py-8 sm:px-9">

          <SectionHeading
            icon="✈"
            title="Trip details"
            description="Tell everyone where you're headed."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            <Field
              label="Trip name"
              required
              error={errors.name}
              className="md:col-span-2"
            >
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Goa Escape"
                className={inputClass(
                  errors.name,
                )}
              />
            </Field>


            <Field
              label="Destination"
              required
              error={errors.destination}
            >
              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="Goa, India"
                className={inputClass(
                  errors.destination,
                )}
              />
            </Field>


            <Field
              label="Trip leader"
              required
              error={errors.leader}
            >
              <input
                type="text"
                name="leader"
                value={form.leader}
                onChange={handleChange}
                placeholder="Your name"
                className={inputClass(
                  errors.leader,
                )}
              />
            </Field>

          </div>

        </section>


        {/* DATES */}

        <section className="border-b border-[#e8e1d6] px-6 py-8 sm:px-9">

          <SectionHeading
            title="When are you going?"
            description="Set the dates for your adventure."
          />

          <div className="mt-7 grid gap-6 md:grid-cols-2">

            <Field
              label="Start date"
              required
              error={errors.startDate}
            >
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className={inputClass(
                  errors.startDate,
                )}
              />
            </Field>


            <Field
              label="End date"
              required
              error={errors.endDate}
            >
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                min={
                  form.startDate ||
                  undefined
                }
                onChange={handleChange}
                className={inputClass(
                  errors.endDate,
                )}
              />
            </Field>

          </div>

        </section>


        {/* DESCRIPTION */}

        <section className="px-6 py-8 sm:px-9">

          <SectionHeading
            title="Give the trip a little context."
            description="Optional, but useful for everyone joining."
          />

          <div className="mt-7">

            <Field label="Description">

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="A weekend beach trip with friends..."
                className={`${inputClass()} resize-none`}
              />

            </Field>

          </div>

        </section>


        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 border-t border-[#e8e1d6] bg-[#faf8f2] px-6 py-5 sm:flex-row sm:justify-end sm:px-9">

          <button
            type="button"
            onClick={() =>
              navigate('/tripwise')
            }
            disabled={creating}
            className="rounded-xl border border-[#d8d1c5] px-5 py-3 text-sm font-medium text-[#68746f] hover:bg-[#f5f2eb] disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-[#527d71] px-6 py-3 text-sm font-semibold text-white hover:bg-[#456c61] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating
              ? 'Creating trip...'
              : 'Create trip →'}
          </button>

        </div>

      </form>

    </div>
  )
}


function SectionHeading({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">

      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dfeee8] text-xl">
          {icon}
        </div>
      )}

      <div>

        <h2 className="font-serif text-2xl font-semibold text-[#334843]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#89918d]">
          {description}
        </p>

      </div>

    </div>
  )
}


function Field({
  label,
  required,
  error,
  children,
  className = '',
}) {
  return (
    <div className={className}>

      <label className="block">

        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d76]">
          {label}

          {required && (
            <span className="ml-1 text-[#78968b]">
              *
            </span>
          )}
        </span>

        <div className="mt-2">
          {children}
        </div>

      </label>

      {error && (
        <p className="mt-2 text-xs font-medium text-[#b9685d]">
          {error}
        </p>
      )}

    </div>
  )
}


function inputClass(error = false) {
  return [
    'w-full rounded-2xl border bg-[#fffdf8] px-4 py-3.5 text-sm text-[#334843] outline-none placeholder:text-[#a7ada9]',
    error
      ? 'border-[#c98379]'
      : 'border-[#dcd5c9]',
    'focus:border-[#7ca194] focus:ring-4 focus:ring-[#7ca194]/10',
  ].join(' ')
}


export default CreateTrip