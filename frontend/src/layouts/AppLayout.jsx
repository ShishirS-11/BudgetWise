import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'


/* ============================================================
   NAVIGATION
============================================================ */

const navigation = [
  {
    label: 'Overview',
    path: '/',
    icon: OverviewIcon,
    end: true,
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: ExpensesIcon,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarIcon,
  },
  {
    label: 'Budget',
    path: '/budget',
    icon: BudgetIcon,
  },
  {
    label: 'Goals',
    path: '/goals',
    icon: GoalsIcon,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ReportsIcon,
  },
  {
    label: 'Insights',
    path: '/insights',
    icon: InsightsIcon,
  },
]


/* ============================================================
   APP LAYOUT
============================================================ */

function AppLayout() {
  const {
    user,
    signOut,
  } = useAuth()

  const {
    currency,
    setCurrency,
    currencies,
  } = useCurrency()

  const navigate = useNavigate()

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false)

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false)

  const [
    currencyOpen,
    setCurrencyOpen,
  ] = useState(false)

  const [
    currencySearch,
    setCurrencySearch,
  ] = useState('')

  const [
    theme,
    setTheme,
  ] = useState(() => {
    return (
      localStorage.getItem(
        'budgetwise-theme',
      ) || 'light'
    )
  })

  const menuRef = useRef(null)
  const notificationRef = useRef(null)
  const currencyRef = useRef(null)


  /* ==========================================================
     USER
  ========================================================== */

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'

  const firstName =
    name
      .split(' ')[0]
      .trim() || 'User'

  const avatarLetter =
    firstName
      .charAt(0)
      .toUpperCase()


  /* ==========================================================
     CURRENCY SEARCH
  ========================================================== */

  const filteredCurrencies =
    currencies.filter((item) => {
      const search =
        currencySearch
          .trim()
          .toLowerCase()

      if (!search) {
        return true
      }

      return (
        item.code
          .toLowerCase()
          .includes(search) ||
        item.name
          .toLowerCase()
          .includes(search)
      )
    })


  /* ==========================================================
     THEME
  ========================================================== */

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme,
    )

    localStorage.setItem(
      'budgetwise-theme',
      theme,
    )
  }, [theme])


  /* ==========================================================
     CLOSE MENUS
  ========================================================== */

  useEffect(() => {
    function handleOutsideClick(
      event,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        setMenuOpen(false)
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target,
        )
      ) {
        setNotificationsOpen(false)
      }

      if (
        currencyRef.current &&
        !currencyRef.current.contains(
          event.target,
        )
      ) {
        setCurrencyOpen(false)
        setCurrencySearch('')
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
    }
  }, [])


  /* ==========================================================
     ACTIONS
  ========================================================== */

  function toggleTheme() {
    setTheme(
      (current) =>
        current === 'dark'
          ? 'light'
          : 'dark',
    )
  }


  function handleCurrencyChange(
    code,
  ) {
    setCurrency(code)
    setCurrencyOpen(false)
    setCurrencySearch('')
  }


  async function handleSignOut() {
    try {
      await signOut()

      setMenuOpen(false)

      navigate(
        '/login',
        {
          replace: true,
        },
      )
    } catch (error) {
      console.error(
        'Sign out failed:',
        error,
      )
    }
  }


  function openSettings() {
    setMenuOpen(false)
    navigate('/settings')
  }


  function openTripWise() {
    setMenuOpen(false)
    navigate('/tripwise')
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="budgetwise-root min-h-screen">

      <div className="flex min-h-screen">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside
          className="
            hidden
            w-[270px]
            shrink-0
            flex-col
            border-r
            border-[var(--bw-border)]
            bg-[var(--bw-surface)]
            lg:flex
          "
        >

          {/* BRAND */}

          <div
            className="
              border-b
              border-[var(--bw-border)]
              px-6
              py-7
            "
          >

            <NavLink
              to="/"
              className="group flex items-center gap-3"
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--bw-accent-soft)]
                  text-2xl
                  shadow-sm
                  transition
                  group-hover:scale-[1.02]
                "
              >
                💰
              </div>

              <div>

                <p
                  className="
                    font-serif
                    text-2xl
                    font-semibold
                    leading-none
                    tracking-tight
                    text-[var(--bw-text-strong)]
                  "
                >
                  Budget
                  <span className="text-[var(--bw-accent)]">
                    Wise
                  </span>
                </p>

                <p
                  className="
                    mt-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[var(--bw-text-muted)]
                  "
                >
                  Personal finance
                </p>

              </div>

            </NavLink>

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
                text-[var(--bw-text-muted)]
              "
            >
              Workspace
            </p>

            <div className="space-y-1.5">

              {navigation.map(
                (item) => (
                  <BudgetNavItem
                    key={item.path}
                    item={item}
                  />
                ),
              )}

            </div>

          </nav>


          {/* SETTINGS */}

          <div
            className="
              border-t
              border-[var(--bw-border)]
              p-4
            "
          >

            <BudgetNavItem
              item={{
                label: 'Settings',
                path: '/settings',
                icon: SettingsIcon,
              }}
            />

          </div>

        </aside>


        {/* ==================================================
            MAIN
        ================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header
            className="
              sticky
              top-0
              z-40
              flex
              min-h-[74px]
              items-center
              justify-between
              border-b
              border-[var(--bw-border)]
              bg-[var(--bw-bg)]/95
              px-5
              backdrop-blur-xl
              sm:px-8
              lg:px-10
            "
          >

            {/* MOBILE BRAND */}

            <NavLink
              to="/"
              className="
                flex
                items-center
                gap-3
                lg:hidden
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--bw-accent-soft)]
                  text-xl
                "
              >
                💰
              </div>

              <span
                className="
                  font-serif
                  text-xl
                  font-semibold
                  text-[var(--bw-text-strong)]
                "
              >
                Budget
                <span className="text-[var(--bw-accent)]">
                  Wise
                </span>
              </span>

            </NavLink>


            {/* DESKTOP DATE */}

            <div className="hidden lg:block">

              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--bw-text-strong)]
                "
              >
                {getCurrentDate()}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--bw-text-secondary)]
                "
              >
                Manage your money with clarity.
              </p>

            </div>


            {/* HEADER ACTIONS */}

            <div className="flex items-center gap-2">

              {/* CURRENCY */}

              <div
                ref={currencyRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() => {
                    setCurrencyOpen(
                      (current) =>
                        !current,
                    )

                    setMenuOpen(false)
                    setNotificationsOpen(false)
                  }}
                  className="
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[var(--bw-border)]
                    bg-[var(--bw-surface)]
                    px-3
                    text-xs
                    transition
                    hover:border-[var(--bw-accent)]
                    hover:bg-[var(--bw-surface-hover)]
                  "
                >

                  <span className="text-sm text-[var(--bw-accent)]">
                    {getCurrencyEmoji(
                      currency,
                    )}
                  </span>

                  <span className="font-medium text-[var(--bw-text-secondary)]">
                    {currency}
                  </span>

                  <ChevronDownIcon />

                </button>


                {currencyOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-12
                      z-50
                      w-72
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--bw-border)]
                      bg-[var(--bw-surface)]
                      shadow-2xl
                    "
                  >

                    <div
                      className="
                        border-b
                        border-[var(--bw-border)]
                        p-3
                      "
                    >

                      <p
                        className="
                          px-1
                          text-xs
                          font-semibold
                          text-[var(--bw-text-secondary)]
                        "
                      >
                        Choose currency
                      </p>

                      <input
                        type="text"
                        value={currencySearch}
                        onChange={(event) =>
                          setCurrencySearch(
                            event.target.value,
                          )
                        }
                        placeholder="Search currency..."
                        className="
                          mt-3
                          w-full
                          rounded-xl
                          border
                          border-[var(--bw-border)]
                          bg-[var(--bw-surface-soft)]
                          px-3
                          py-2.5
                          text-xs
                          text-[var(--bw-text)]
                          outline-none
                          placeholder:text-[var(--bw-muted)]
                          focus:border-[var(--bw-accent)]
                        "
                      />

                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">

                      {filteredCurrencies.length === 0 ? (
                        <p
                          className="
                            px-3
                            py-6
                            text-center
                            text-xs
                            text-[var(--bw-text-muted)]
                          "
                        >
                          No currencies found.
                        </p>
                      ) : (
                        filteredCurrencies.map(
                          (item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() =>
                                handleCurrencyChange(
                                  item.code,
                                )
                              }
                              className={`
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                px-3
                                py-2.5
                                text-left
                                transition
                                ${
                                  item.code ===
                                  currency
                                    ? 'bg-[var(--bw-accent-soft)] text-[var(--bw-accent-text)]'
                                    : 'text-[var(--bw-text-secondary)] hover:bg-[var(--bw-surface-hover)]'
                                }
                              `}
                            >

                              <div>

                                <p className="text-xs font-medium">
                                  {item.name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[var(--bw-text-muted)]">
                                  {item.code}
                                </p>

                              </div>

                              <span>
                                {item.symbol}
                              </span>

                            </button>
                          ),
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>


              {/* THEME */}

              <button
                type="button"
                onClick={toggleTheme}
                title={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                className="
                  hidden
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[var(--bw-border)]
                  bg-[var(--bw-surface)]
                  text-lg
                  transition
                  hover:border-[var(--bw-accent)]
                  hover:bg-[var(--bw-surface-hover)]
                  sm:flex
                "
              >
                {theme === 'dark'
                  ? '☀️'
                  : '🌙'}
              </button>


              {/* NOTIFICATIONS */}

              <div
                ref={notificationRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(
                      (current) =>
                        !current,
                    )

                    setMenuOpen(false)
                    setCurrencyOpen(false)
                  }}
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[var(--bw-border)]
                    bg-[var(--bw-surface)]
                    text-lg
                    transition
                    hover:border-[var(--bw-accent)]
                    hover:bg-[var(--bw-surface-hover)]
                  "
                >

                  🔔

                  <span
                    className="
                      absolute
                      right-2
                      top-1.5
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-[var(--bw-accent)]
                    "
                  />

                </button>


                {notificationsOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-12
                      z-50
                      w-72
                      rounded-2xl
                      border
                      border-[var(--bw-border)]
                      bg-[var(--bw-surface)]
                      p-4
                      shadow-2xl
                    "
                  >

                    <p
                      className="
                        font-serif
                        text-lg
                        font-semibold
                        text-[var(--bw-text-strong)]
                      "
                    >
                      Notifications
                    </p>

                    <div
                      className="
                        mt-4
                        rounded-xl
                        bg-[var(--bw-surface-soft)]
                        p-4
                        text-center
                      "
                    >

                      <div className="text-2xl">
                        🔔
                      </div>

                      <p className="mt-2 text-xs text-[var(--bw-text-secondary)]">
                        You're all caught up.
                      </p>

                    </div>

                  </div>
                )}

              </div>


              {/* PROFILE */}

              <div
                ref={menuRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(
                      (current) =>
                        !current,
                    )

                    setNotificationsOpen(false)
                    setCurrencyOpen(false)
                  }}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--bw-border)]
                    bg-[var(--bw-accent-soft)]
                    font-semibold
                    text-[var(--bw-accent-text)]
                    transition
                    hover:scale-105
                  "
                >
                  {avatarLetter}
                </button>


                {menuOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-12
                      z-50
                      w-80
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--bw-border)]
                      bg-[var(--bw-surface)]
                      shadow-2xl
                    "
                  >

                    {/* USER */}

                    <div
                      className="
                        border-b
                        border-[var(--bw-border)]
                        p-5
                      "
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[var(--bw-accent-soft)]
                            font-semibold
                            text-[var(--bw-accent-text)]
                          "
                        >
                          {avatarLetter}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-[var(--bw-text-strong)]">
                            {name}
                          </p>

                          <p className="truncate text-xs text-[var(--bw-text-secondary)]">
                            {user?.email}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* TRIPWISE */}

                    <button
                      type="button"
                      onClick={openTripWise}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        border-b
                        border-[var(--bw-border)]
                        p-4
                        text-left
                        transition
                        hover:bg-[var(--bw-surface-hover)]
                      "
                    >

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-[var(--tw-icon-bg)]
                          text-lg
                        "
                      >
                        ✈️
                      </span>

                      <span className="flex-1">

                        <span className="block font-medium text-[var(--bw-text-strong)]">
                          TripWise
                        </span>

                        <span className="block text-xs text-[var(--bw-text-secondary)]">
                          Plan and manage group trips
                        </span>

                      </span>

                      <span className="text-[var(--bw-text-muted)]">
                        →
                      </span>

                    </button>


                    {/* SETTINGS */}

                    <button
                      type="button"
                      onClick={openSettings}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        border-b
                        border-[var(--bw-border)]
                        p-4
                        text-left
                        transition
                        hover:bg-[var(--bw-surface-hover)]
                      "
                    >

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-[var(--bw-surface-soft)]
                          text-lg
                        "
                      >
                        ⚙️
                      </span>

                      <span className="flex-1 font-medium text-[var(--bw-text-strong)]">
                        Settings
                      </span>

                      <span className="text-[var(--bw-text-muted)]">
                        →
                      </span>

                    </button>


                    {/* SIGN OUT */}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        p-4
                        text-left
                        text-[var(--bw-danger)]
                        transition
                        hover:bg-[var(--bw-danger-soft)]
                      "
                    >

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-[var(--bw-danger-soft)]
                          text-lg
                        "
                      >
                        ↪
                      </span>

                      <span className="font-medium">
                        Sign out
                      </span>

                    </button>

                  </div>
                )}

              </div>

            </div>

          </header>


          {/* CONTENT */}

          <main
            className="
              min-w-0
              flex-1
              px-5
              py-7
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
   NAV ITEM
============================================================ */

function BudgetNavItem({
  item,
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',

          isActive
            ? 'bg-[var(--bw-accent-soft)] text-[var(--bw-accent-text)]'
            : 'text-[var(--bw-text-secondary)] hover:bg-[var(--bw-surface-hover)] hover:text-[var(--bw-text-strong)]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-xl transition',

              isActive
                ? 'bg-[var(--bw-accent-soft)] text-[var(--bw-accent)]'
                : 'text-[var(--bw-text-muted)] group-hover:text-[var(--bw-accent)]',
            ].join(' ')}
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
                bg-[var(--bw-accent)]
              "
            />
          )}
        </>
      )}
    </NavLink>
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
   CURRENCY EMOJI
============================================================ */

function getCurrencyEmoji(
  currency,
) {
  const map = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AED: 'د.إ',
    SAR: '﷼',
  }

  return map[currency] || '¤'
}


/* ============================================================
   SVG ICON WRAPPER
============================================================ */

function Icon({
  children,
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}


/* ============================================================
   ICONS
============================================================ */

function OverviewIcon() {
  return (
    <Icon>
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </Icon>
  )
}


function ExpensesIcon() {
  return (
    <Icon>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
      <path d="M9 19h4" />
    </Icon>
  )
}


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
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </Icon>
  )
}


function BudgetIcon() {
  return (
    <Icon>
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </Icon>
  )
}


function GoalsIcon() {
  return (
    <Icon>
      <circle
        cx="12"
        cy="12"
        r="8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <circle
        cx="12"
        cy="12"
        r="1"
      />
    </Icon>
  )
}


function ReportsIcon() {
  return (
    <Icon>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </Icon>
  )
}


function InsightsIcon() {
  return (
    <Icon>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.6-1.5 1.3-1.5 2.5h-4c0-1.2-.7-1.9-1.5-2.5Z" />
    </Icon>
  )
}


function SettingsIcon() {
  return (
    <Icon>
      <circle
        cx="12"
        cy="12"
        r="3"
      />

      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H16v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Icon>
  )
}


function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5 text-[var(--bw-text-muted)]"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


export default AppLayout