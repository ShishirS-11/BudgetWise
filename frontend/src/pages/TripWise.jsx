import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getTrips,
} from '../services/tripService'


function TripWise() {
  const navigate = useNavigate()

  const [trips, setTrips] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  useEffect(() => {
    loadTrips()
  }, [])


  async function loadTrips() {
    try {
      setLoading(true)
      setError('')

      const data =
        await getTrips()

      setTrips(data || [])
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
        'Unable to load trips.',
      )
    } finally {
      setLoading(false)
    }
  }


  const activeTrip =
    trips.length > 0
      ? trips[0]
      : null


  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[500px]
          items-center
          justify-center
          text-[var(--tw-body)]
        "
      >
        Loading your trips...
      </div>
    )
  }


  if (error) {
    return (
      <div
        className="
          rounded-[28px]
          border
          border-[var(--tw-border)]
          bg-[var(--tw-card)]
          p-10
          text-center
          text-[var(--tw-body)]
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[var(--tw-icon-bg)]
            text-2xl
          "
        >
          !
        </div>

        <h2
          className="
            mt-5
            font-serif
            text-2xl
            font-semibold
            text-[var(--tw-heading)]
          "
        >
          Something went wrong
        </h2>

        <p className="mt-3 text-[var(--tw-body)]">
          {error}
        </p>

        <button
          type="button"
          onClick={loadTrips}
          className="
            mt-6
            rounded-xl
            bg-[var(--tw-link)]
            px-6
            py-3
            font-medium
            text-white
            transition
            hover:opacity-90
          "
        >
          Try again
        </button>

      </div>
    )
  }


  if (!activeTrip) {
    return (
      <EmptyTrips
        onCreate={() =>
          navigate('/tripwise/create')
        }
      />
    )
  }


  return (
    <div className="space-y-8">


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-[var(--tw-border)]
          bg-[var(--tw-card)]
          p-8
          shadow-[var(--tw-shadow)]
          transition-all
          duration-300
          lg:p-10
        "
      >

        {/* DECORATION */}

        <div
          className="
            absolute
            -right-10
            -top-16
            h-64
            w-64
            rounded-full
            bg-[var(--tw-decoration)]
            opacity-80
          "
        />

        <div
          className="
            absolute
            bottom-[-90px]
            right-[25%]
            h-48
            w-48
            rounded-full
            bg-[var(--tw-decoration)]
            opacity-45
          "
        />


        <div className="relative z-10">

          <div className="flex items-start justify-between gap-6">

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[var(--tw-link)]
                "
              >

                <span
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[var(--tw-icon-bg)]
                    text-xl
                  "
                >
                  ✨
                </span>

                Your adventure

              </div>


              <h1
                className="
                  mt-7
                  font-serif
                  text-5xl
                  font-semibold
                  tracking-tight
                  text-[var(--tw-heading)]
                  sm:text-6xl
                "
              >
                {activeTrip.name}
              </h1>


              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  items-center
                  gap-x-7
                  gap-y-3
                  text-sm
                  text-[var(--tw-body)]
                "
              >

                <span>
                  📍 {activeTrip.destination}
                </span>

                <span>
                  🗓️ {formatDate(activeTrip.startDate)}
                  {' — '}
                  {formatDate(activeTrip.endDate)}
                </span>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate('/tripwise/create')
              }
              className="
                hidden
                shrink-0
                rounded-xl
                border
                border-[var(--tw-border)]
                bg-[var(--tw-card)]
                px-5
                py-3
                text-sm
                font-medium
                text-[var(--tw-body)]
                shadow-sm
                transition
                hover:border-[var(--tw-link)]
                hover:bg-[var(--tw-icon-bg)]
                hover:text-[var(--tw-heading)]
                sm:block
              "
            >
              + New trip
            </button>

          </div>


          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() =>
              navigate('/tripwise/create')
            }
            className="
              relative
              z-10
              mt-7
              rounded-xl
              border
              border-[var(--tw-border)]
              bg-[var(--tw-card)]
              px-5
              py-3
              text-sm
              font-medium
              text-[var(--tw-body)]
              transition
              hover:border-[var(--tw-link)]
              hover:bg-[var(--tw-icon-bg)]
              hover:text-[var(--tw-heading)]
              sm:hidden
            "
          >
            + New trip
          </button>

        </div>

      </section>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <SummaryCard
          icon="👥"
          label="Members"
          value="0"
          description="people going"
        />

        <SummaryCard
          icon="🗓️"
          label="Activities"
          value="0"
          description="plans added"
        />

        <SummaryCard
          icon="💳"
          label="Trip spending"
          value="₹0"
          description="0 expenses"
        />

        <SummaryCard
          icon="📍"
          label="Destination"
          value={activeTrip.destination}
          description="trip location"
        />

      </div>


      {/* =====================================================
          PLAN EVERYTHING
      ===================================================== */}

      <section>

        <div className="mb-5">

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--tw-link)]
            "
          >
            Plan everything
          </p>

          <h2
            className="
              mt-2
              font-serif
              text-4xl
              font-semibold
              tracking-tight
              text-[var(--tw-heading)]
            "
          >
            Make the trip easy.
          </h2>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
          "
        >

          <FeatureCard
            icon="🗺️"
            title="Itinerary"
            description="Plan where you're going, what you're doing and the exact time for every activity."
            action="Open itinerary"
            onClick={() =>
              navigate('/tripwise/itinerary')
            }
          />


          <FeatureCard
            icon="🗓️"
            title="Calendar"
            description="See your entire trip visually and quickly jump to any day."
            action="Open calendar"
            onClick={() =>
              navigate('/tripwise/calendar')
            }
          />


          <FeatureCard
            icon="👥"
            title="Members"
            description="Keep track of everyone coming and organize the trip group."
            action="Manage members"
            onClick={() =>
              navigate('/tripwise/members')
            }
          />


          <FeatureCard
            icon="💳"
            title="Expenses"
            description="Track shared spending and see how much the group has spent."
            action="Manage expenses"
            onClick={() =>
              navigate('/tripwise/expenses')
            }
          />


          <FeatureCard
            icon="₹"
            title="Payments"
            description="Share the trip leader's UPI and QR code so everyone can pay easily."
            action="Payment details"
            onClick={() =>
              navigate('/tripwise/payments')
            }
          />

        </div>

      </section>


      {/* =====================================================
          TRIP OVERVIEW
      ===================================================== */}

      <section
        className="
          rounded-[28px]
          border
          border-[var(--tw-border)]
          bg-[var(--tw-card)]
          p-7
          shadow-[var(--tw-shadow)]
          transition-all
          duration-300
          lg:p-8
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[var(--tw-link)]
              "
            >
              Trip overview
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-3xl
                font-semibold
                text-[var(--tw-heading)]
              "
            >
              Everything in one place.
            </h2>

          </div>


          <span
            className="
              w-fit
              rounded-full
              bg-[var(--tw-icon-bg)]
              px-3
              py-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[var(--tw-link)]
            "
          >
            Active trip
          </span>

        </div>


        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >

          <OverviewItem
            label="Starts"
            value={formatDate(activeTrip.startDate)}
          />

          <OverviewItem
            label="Ends"
            value={formatDate(activeTrip.endDate)}
          />

          <OverviewItem
            label="Duration"
            value={calculateDuration(
              activeTrip.startDate,
              activeTrip.endDate,
            )}
          />

        </div>

      </section>

    </div>
  )
}


/* ============================================================
   SUMMARY CARD
   ============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div
      className="
        tripwise-card
        rounded-[24px]
        p-6
      "
    >

      <div
        className="
          tripwise-icon
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          text-xl
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-6
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.16em]
          text-[var(--tw-muted)]
        "
      >
        {label}
      </p>


      <p
        className="
          mt-2
          truncate
          font-serif
          text-2xl
          font-semibold
          text-[var(--tw-heading)]
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-sm
          text-[var(--tw-body)]
        "
      >
        {description}
      </p>

    </div>
  )
}


/* ============================================================
   FEATURE CARD
   ============================================================ */

function FeatureCard({
  icon,
  title,
  description,
  action,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        tripwise-card
        group
        w-full
        rounded-[28px]
        p-8
        text-left
      "
    >

      {/* DECORATION */}

      <div
        className="
          tripwise-decoration
          absolute
          right-0
          top-0
          h-28
          w-28
          rounded-bl-full
          opacity-60
        "
      />


      <div
        className="
          relative
          z-10
          flex
          min-h-[280px]
          flex-col
        "
      >

        <div
          className="
            tripwise-icon
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-2xl
          "
        >
          {icon}
        </div>


        <h3
          className="
            tripwise-card-title
            mt-8
            text-3xl
            font-semibold
            tracking-tight
          "
        >
          {title}
        </h3>


        <p
          className="
            tripwise-card-description
            mt-4
            max-w-xl
            text-base
            leading-7
          "
        >
          {description}
        </p>


        <span
          className="
            tripwise-card-link
            mt-auto
            w-fit
            pt-8
            text-sm
            font-semibold
          "
        >
          {action} →
        </span>

      </div>

    </button>
  )
}


/* ============================================================
   OVERVIEW ITEM
   ============================================================ */

function OverviewItem({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--tw-border)]
        bg-[var(--tw-card-hover)]
        p-5
        transition-colors
        duration-300
      "
    >

      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-[var(--tw-muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-serif
          text-xl
          font-semibold
          text-[var(--tw-heading)]
        "
      >
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   EMPTY TRIPS
   ============================================================ */

function EmptyTrips({
  onCreate,
}) {
  return (
    <div className="space-y-8">


      {/* HERO */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-[var(--tw-border)]
          bg-[var(--tw-card)]
          p-8
          shadow-[var(--tw-shadow)]
          lg:p-10
        "
      >

        <div
          className="
            absolute
            right-0
            top-0
            h-56
            w-56
            rounded-bl-full
            bg-[var(--tw-decoration)]
          "
        />


        <div className="relative z-10">

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--tw-link)]
            "
          >
            Your travel workspace
          </p>


          <h1
            className="
              mt-4
              max-w-3xl
              font-serif
              text-5xl
              font-semibold
              leading-[0.95]
              tracking-tight
              text-[var(--tw-heading)]
              sm:text-6xl
            "
          >
            Plan the trip.
            <br />
            Enjoy the journey.
          </h1>


          <p
            className="
              mt-7
              max-w-2xl
              text-base
              leading-7
              text-[var(--tw-body)]
            "
          >
            Organize your itinerary,
            coordinate everyone going,
            keep track of costs,
            and make sure nobody
            misses a thing.
          </p>


          <button
            type="button"
            onClick={onCreate}
            className="
              mt-7
              rounded-xl
              bg-[var(--tw-link)]
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[var(--tw-link-hover)]
            "
          >
            + Create a trip
          </button>

        </div>

      </section>


      {/* EMPTY STATE */}

      <section
        className="
          rounded-[28px]
          border
          border-dashed
          border-[var(--tw-border-strong)]
          bg-[var(--tw-card)]
          px-6
          py-16
          text-center
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[var(--tw-icon-bg)]
            text-2xl
          "
        >
          ✈️
        </div>


        <h2
          className="
            mt-6
            font-serif
            text-3xl
            font-semibold
            text-[var(--tw-heading)]
          "
        >
          Your next adventure starts here.
        </h2>


        <p
          className="
            mx-auto
            mt-3
            max-w-xl
            text-[var(--tw-body)]
          "
        >
          Create a trip and start adding
          members, places, activities,
          timings and expenses.
        </p>


        <button
          type="button"
          onClick={onCreate}
          className="
            mt-7
            rounded-xl
            bg-[var(--tw-link)]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[var(--tw-link-hover)]
          "
        >
          Create your first trip
        </button>

      </section>

    </div>
  )
}


/* ============================================================
   DATE FORMAT
   ============================================================ */

function formatDate(date) {
  if (!date) {
    return '—'
  }

  const parsed =
    new Date(date)

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(parsed)
}


/* ============================================================
   DURATION
   ============================================================ */

function calculateDuration(
  startDate,
  endDate,
) {
  if (!startDate || !endDate) {
    return '—'
  }

  const start =
    new Date(startDate)

  const end =
    new Date(endDate)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return '—'
  }

  const difference =
    Math.round(
      (
        end.getTime() -
        start.getTime()
      ) /
        (1000 * 60 * 60 * 24),
    )

  return `${difference + 1} days`
}


export default TripWise