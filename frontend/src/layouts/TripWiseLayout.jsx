import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useTheme } from '../hooks/useTheme'


function TripWiseLayout() {
  const navigate = useNavigate()

  const {
    theme,
    toggleTheme,
  } = useTheme()


  const navigation = [
    {
      label: 'My Trips',
      path: '/tripwise',
      icon: TripsIcon,
      end: true,
    },
    {
      label: 'Itinerary',
      path: '/tripwise/itinerary',
      icon: ItineraryIcon,
    },
    {
      label: 'Calendar',
      path: '/tripwise/calendar',
      icon: CalendarIcon,
    },
    {
      label: 'Expenses',
      path: '/tripwise/expenses',
      icon: ExpensesIcon,
    },
    {
      label: 'Members',
      path: '/tripwise/members',
      icon: MembersIcon,
    },
    {
      label: 'Payments',
      path: '/tripwise/payments',
      icon: PaymentsIcon,
    },
  ]


  return (
    <div className="tripwise-root min-h-screen">

      <div className="flex min-h-screen">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className="
            hidden
            w-[270px]
            shrink-0
            border-r
            border-[var(--tw-border)]
            bg-[var(--tw-sidebar)]
            transition-colors
            duration-300
            lg:flex
            lg:flex-col
          "
        >

          {/* BRAND */}

          <div
            className="
              border-b
              border-[var(--tw-border)]
              px-6
              py-7
            "
          >

            <button
              type="button"
              onClick={() =>
                navigate('/tripwise')
              }
              className="flex items-center gap-3 text-left"
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--tw-icon-bg)]
                  text-xl
                  shadow-sm
                "
              >
                ✈️
              </div>


              <div>

                <p
                  className="
                    font-serif
                    text-xl
                    font-semibold
                    tracking-tight
                    text-[var(--tw-heading)]
                  "
                >
                  TripWise
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-[var(--tw-muted)]
                  "
                >
                  Travel together
                </p>

              </div>

            </button>

          </div>


          {/* NAVIGATION */}

          <nav className="flex-1 px-4 py-7">

            <p
              className="
                mb-4
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[var(--tw-muted)]
              "
            >
              Trip workspace
            </p>


            <div className="space-y-1.5">

              {navigation.map(
                (item) => {

                  const Icon =
                    item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}

                      className={({
                        isActive,
                      }) =>
                        [
                          'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',

                          isActive
                            ? 'bg-[var(--tw-icon-bg)] text-[var(--tw-link)]'
                            : 'text-[var(--tw-body)] hover:bg-[var(--tw-card-hover)] hover:text-[var(--tw-heading)]',
                        ].join(' ')
                      }
                    >

                      {({
                        isActive,
                      }) => (
                        <>
                          <span
                            className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              transition
                              ${
                                isActive
                                  ? 'bg-[var(--tw-decoration)] text-[var(--tw-link)]'
                                  : 'bg-transparent text-[var(--tw-muted)] group-hover:text-[var(--tw-link)]'
                              }
                            `}
                          >
                            <Icon />
                          </span>


                          <span>
                            {item.label}
                          </span>


                          {isActive && (
                            <span
                              className="
                                ml-auto
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[var(--tw-link)]
                              "
                            />
                          )}

                        </>
                      )}

                    </NavLink>
                  )
                },
              )}

            </div>

          </nav>


          {/* THEME */}

          <div
            className="
              border-t
              border-[var(--tw-border)]
              p-4
            "
          >

            <button
              type="button"
              onClick={toggleTheme}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                text-[var(--tw-body)]
                transition
                hover:bg-[var(--tw-card-hover)]
                hover:text-[var(--tw-heading)]
              "
            >

              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--tw-icon-bg)]
                "
              >
                {theme === 'dark'
                  ? '☀️'
                  : '🌙'}
              </span>

              <span>
                {theme === 'dark'
                  ? 'Light mode'
                  : 'Dark mode'}
              </span>

            </button>


            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                navigate('/')
              }
              className="
                mt-2
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                text-[var(--tw-body)]
                transition
                hover:bg-[var(--tw-card-hover)]
                hover:text-[var(--tw-heading)]
              "
            >

              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--tw-icon-bg)]
                "
              >
                ←
              </span>

              <span>
                BudgetWise
              </span>

            </button>

          </div>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            bg-[var(--tw-bg)]
            transition-colors
            duration-300
          "
        >


          {/* TOP BAR */}

          <header
            className="
              sticky
              top-0
              z-40
              flex
              h-[74px]
              items-center
              justify-between
              border-b
              border-[var(--tw-border)]
              bg-[var(--tw-header)]
              px-5
              backdrop-blur-md
              transition-colors
              duration-300
              sm:px-8
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-[var(--tw-heading)]
                "
              >
                {getCurrentDate()}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--tw-muted)]
                "
              >
                Make memories, not spreadsheets.
              </p>

            </div>


            <div className="flex items-center gap-2">


              {/* BACK TO BUDGETWISE */}

              <button
                type="button"
                onClick={() =>
                  navigate('/')
                }
                className="
                  hidden
                  rounded-xl
                  border
                  border-[var(--tw-border)]
                  bg-[var(--tw-card)]
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-[var(--tw-body)]
                  transition
                  hover:border-[var(--tw-link)]
                  hover:bg-[var(--tw-icon-bg)]
                  hover:text-[var(--tw-heading)]
                  sm:block
                "
              >
                ← BudgetWise
              </button>


              {/* THEME BUTTON */}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--tw-border)]
                  bg-[var(--tw-card)]
                  text-lg
                  text-[var(--tw-body)]
                  transition-all
                  duration-200
                  hover:bg-[var(--tw-icon-bg)]
                  hover:text-[var(--tw-heading)]
                "
              >
                {theme === 'dark'
                  ? '☀️'
                  : '🌙'}
              </button>


              {/* NOTIFICATION */}

              <button
                type="button"
                aria-label="Notifications"
                className="
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--tw-border)]
                  bg-[var(--tw-card)]
                  text-lg
                  text-[var(--tw-body)]
                  transition
                  hover:bg-[var(--tw-icon-bg)]
                "
              >
                🔔

                <span
                  className="
                    absolute
                    right-2
                    top-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#79b59f]
                  "
                />
              </button>


              {/* PROFILE */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--tw-icon-bg)]
                  text-sm
                  font-semibold
                  text-[var(--tw-link)]
                "
              >
                S
              </div>

            </div>

          </header>


          {/* PAGE */}

          <main
            className="
              min-w-0
              flex-1
              bg-[var(--tw-bg)]
              px-5
              py-7
              transition-colors
              duration-300
              sm:px-8
              lg:px-10
              lg:py-9
            "
          >
            <Outlet />
          </main>

        </div>

      </div>

    </div>
  )
}


/* ============================================================
   DATE
   ============================================================ */

function getCurrentDate() {
  return new Intl.DateTimeFormat(
    'en-IN',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    },
  ).format(new Date())
}


/* ============================================================
   ICON WRAPPER
   ============================================================ */

function Icon({
  children,
}) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}


/* ============================================================
   TRIPS ICON
   ============================================================ */

function TripsIcon() {
  return (
    <Icon>
      <path d="M7 3v3" />
      <path d="M17 3v3" />

      <rect
        x="4"
        y="5"
        width="16"
        height="16"
        rx="2"
      />

      <path d="M4 10h16" />

      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />

      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </Icon>
  )
}


/* ============================================================
   ITINERARY ICON
   ============================================================ */

function ItineraryIcon() {
  return (
    <Icon>
      <path d="M5 4h14" />
      <path d="M5 8h14" />
      <path d="M5 12h8" />
      <path d="M5 16h6" />
      <path d="M5 20h10" />

      <circle
        cx="17"
        cy="16"
        r="3"
      />

      <path d="M17 14v2l1 1" />
    </Icon>
  )
}


/* ============================================================
   CALENDAR ICON
   ============================================================ */

function CalendarIcon() {
  return (
    <Icon>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4" />
      <path d="M8 3v4" />

      <path d="M3 10h18" />

      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />

      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </Icon>
  )
}


/* ============================================================
   EXPENSES ICON
   ============================================================ */

function ExpensesIcon() {
  return (
    <Icon>
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
      />

      <path d="M3 10h18" />

      <path d="M16 15h2" />

      <path d="M7 4h10" />
    </Icon>
  )
}


/* ============================================================
   MEMBERS ICON
   ============================================================ */

function MembersIcon() {
  return (
    <Icon>
      <circle
        cx="9"
        cy="8"
        r="3"
      />

      <circle
        cx="17"
        cy="9"
        r="2.5"
      />

      <path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5" />

      <path d="M14 15c3-.2 5 1.4 5 4" />
    </Icon>
  )
}


/* ============================================================
   PAYMENTS ICON
   ============================================================ */

function PaymentsIcon() {
  return (
    <Icon>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="M3 9h18" />

      <path d="M7 14h4" />

      <path d="M15 14h2" />
    </Icon>
  )
}


export default TripWiseLayout