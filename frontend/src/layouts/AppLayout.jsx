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

/*
 * =========================================================
 * NAVIGATION
 * =========================================================
 */

const navigation = [
  {
    label: 'Overview',
    path: '/',
    icon: OverviewIcon,
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

/*
 * =========================================================
 * APP LAYOUT
 * =========================================================
 */

function AppLayout() {
  const {
    user,
    signOut,
  } = useAuth()

  const {
    currency,
    setCurrency,
    currencies,
    currencyInfo,
  } = useCurrency()

  const navigate = useNavigate()

  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [menuOpen, setMenuOpen] =
    useState(false)

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

  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem(
          'budgetwise-theme',
        ) || 'light'
      )
    })

  const menuRef =
    useRef(null)

  const notificationRef =
    useRef(null)

  const currencyRef =
    useRef(null)

  /*
   * =======================================================
   * USER
   * =======================================================
   */

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

  /*
   * =======================================================
   * FILTER CURRENCIES
   * =======================================================
   */

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

  /*
   * =======================================================
   * CLOSE DROPDOWNS
   * =======================================================
   */

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

  /*
   * =======================================================
   * THEME
   * =======================================================
   */

  useEffect(() => {
    const root =
      document.documentElement

    /*
     * The CSS theme system uses:
     *
     * html[data-theme="light"]
     * html[data-theme="dark"]
     */

    root.setAttribute(
      'data-theme',
      theme,
    )

    localStorage.setItem(
      'budgetwise-theme',
      theme,
    )
  }, [theme])

  /*
   * =======================================================
   * CURRENCY
   * =======================================================
   */

  function handleCurrencyChange(
    code,
  ) {
    setCurrency(code)

    setCurrencyOpen(false)
    setCurrencySearch('')
  }

  /*
   * =======================================================
   * THEME TOGGLE
   * =======================================================
   */

  function toggleTheme() {
    setTheme((current) =>
      current === 'dark'
        ? 'light'
        : 'dark',
    )
  }

  /*
   * =======================================================
   * SIGN OUT
   * =======================================================
   */

  async function handleSignOut() {
    try {
      await signOut()

      setMenuOpen(false)

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Sign out failed:',
        error,
      )
    }
  }

  /*
   * =======================================================
   * SETTINGS
   * =======================================================
   */

  function openSettings() {
    setMenuOpen(false)

    navigate('/settings')
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-[var(--bw-bg)] text-[var(--bw-text)] transition-colors duration-300">

      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-[270px] shrink-0 border-r border-white/[0.06] bg-[var(--bw-surface)] lg:flex lg:flex-col">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="px-6 pb-8 pt-7">

            <NavLink
              to="/"
              className="group flex items-center gap-3.5"
            >

              {/* Logo */}

              <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-white/[0.07] bg-[var(--bw-surface-soft)] shadow-sm transition-all duration-200 group-hover:border-violet-400/25">

                <img
                  src="/logo.png"
                  alt="BudgetWise"
                  className="h-[47px] w-[47px] object-contain"
                />

              </div>

              {/* Wordmark */}

              <div className="min-w-0">

                <p className="whitespace-nowrap text-[19px] font-semibold leading-none tracking-[-0.045em]">

                  <span className="text-[var(--bw-text-strong)]">
                    Budget
                  </span>

                  <span className="text-violet-300">
                    Wise
                  </span>

                </p>

                <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.19em] text-zinc-600">
                  Personal finance
                </p>

              </div>

            </NavLink>

          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="flex-1 px-3">

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Workspace
            </p>

            <div className="space-y-1">

              {navigation.map(
                (item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                  />
                ),
              )}

            </div>

          </nav>

          {/* =================================================
              SIDEBAR FOOTER
          ================================================= */}

          <div className="border-t border-white/[0.06] p-3">

            <NavItem
              item={{
                label: 'Settings',
                path: '/settings',
                icon: SettingsIcon,
              }}
            />

          </div>

        </aside>

        {/* =================================================
            MAIN AREA
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="sticky top-0 z-40 flex min-h-[74px] items-center justify-between border-b border-white/[0.06] bg-[var(--bw-bg)]/95 px-5 backdrop-blur-xl sm:px-6 lg:px-10">

            {/* =================================================
                MOBILE BRAND
            ================================================= */}

            <NavLink
              to="/"
              className="flex items-center gap-2.5 lg:hidden"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[var(--bw-surface-soft)]">

                <img
                  src="/logo.png"
                  alt="BudgetWise"
                  className="h-9 w-9 object-contain"
                />

              </div>

              <span className="text-[17px] font-semibold tracking-[-0.04em]">

                <span className="text-[var(--bw-text-strong)]">
                  Budget
                </span>

                <span className="text-violet-300">
                  Wise
                </span>

              </span>

            </NavLink>

            {/* =================================================
                DESKTOP CONTEXT
            ================================================= */}

            <div className="hidden lg:block">

              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">
                {getCurrentDate()}
              </p>

              <p className="mt-1 text-sm font-medium text-[var(--bw-text-secondary)]">
                Your financial overview
              </p>

            </div>

            {/* =================================================
                HEADER ACTIONS
            ================================================= */}

            <div className="flex items-center gap-2">

              {/* =================================================
                  CURRENCY SELECTOR
              ================================================= */}

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
                    setNotificationsOpen(
                      false,
                    )
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-xs transition-all duration-200 hover:border-violet-400/20 hover:bg-white/[0.05]"
                >

                  <span className="text-[11px] text-zinc-600">
                    Currency
                  </span>

                  <span className="font-medium text-[var(--bw-text-secondary)]">
                    {currency}
                  </span>

                  <ChevronDownIcon />

                </button>

                {/* Currency dropdown */}

                {currencyOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/[0.09] bg-[var(--bw-surface)] shadow-2xl">

                    <div className="border-b border-white/[0.06] p-3">

                      <p className="px-1 text-xs font-medium text-[var(--bw-text-secondary)]">
                        Choose currency
                      </p>

                      <input
                        type="text"
                        value={
                          currencySearch
                        }
                        onChange={(
                          event,
                        ) =>
                          setCurrencySearch(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Search currency..."
                        className="mt-3 w-full rounded-xl border border-white/[0.07] bg-[var(--bw-surface-soft)] px-3 py-2.5 text-xs text-[var(--bw-text)] outline-none placeholder:text-zinc-600 focus:border-violet-400/40"
                        autoFocus
                      />

                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">

                      {filteredCurrencies
                        .length ===
                      0 ? (
                        <p className="px-3 py-6 text-center text-xs text-zinc-600">
                          No currencies found.
                        </p>
                      ) : (
                        filteredCurrencies.map(
                          (item) => (
                            <button
                              key={
                                item.code
                              }
                              type="button"
                              onClick={() =>
                                handleCurrencyChange(
                                  item.code,
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                                item.code ===
                                currency
                                  ? 'bg-violet-500/[0.10] text-violet-300'
                                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                              }`}
                            >

                              <div className="min-w-0">

                                <p className="text-xs font-medium">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-zinc-600">
                                  {
                                    item.code
                                  }
                                </p>

                              </div>

                              <span className="ml-3 shrink-0 text-sm">
                                {
                                  item.symbol
                                }
                              </span>

                            </button>
                          ),
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* =================================================
                  THEME TOGGLE
              ================================================= */}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                title={
                  theme === 'dark'
                    ? 'Light mode'
                    : 'Dark mode'
                }
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition-all duration-200 hover:border-violet-400/20 hover:bg-white/[0.05] hover:text-violet-400 sm:flex"
              >

                {theme === 'dark' ? (
                  <SunIcon />
                ) : (
                  <MoonIcon />
                )}

              </button>

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <div
                ref={
                  notificationRef
                }
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
                    setCurrencyOpen(
                      false,
                    )
                  }}
                  aria-label="Notifications"
                  aria-expanded={
                    notificationsOpen
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition-all duration-200 hover:border-violet-400/20 hover:bg-white/[0.05] hover:text-violet-400"
                >

                  <BellIcon />

                  <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-violet-400" />

                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/[0.09] bg-[var(--bw-surface)] shadow-2xl">

                    <div className="border-b border-white/[0.06] px-4 py-4">

                      <p className="text-sm font-medium text-[var(--bw-text-strong)]">
                        Notifications
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your BudgetWise updates
                      </p>

                    </div>

                    <div className="p-4">

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">

                        <div className="flex items-start gap-3">

                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                            <SparkIcon />
                          </span>

                          <div>

                            <p className="text-xs font-medium text-[var(--bw-text-secondary)]">
                              You're all set
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                              Keep recording your transactions to get better financial insights.
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                )}

              </div>

              {/* =================================================
                  PROFILE
              ================================================= */}

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

                    setNotificationsOpen(
                      false,
                    )

                    setCurrencyOpen(
                      false,
                    )
                  }}
                  aria-label="Account menu"
                  aria-expanded={
                    menuOpen
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/10 bg-violet-500/10 text-xs font-semibold text-violet-400 transition-all duration-200 hover:border-violet-400/30 hover:bg-violet-500/15"
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/[0.09] bg-[var(--bw-surface)] shadow-2xl">

                    {/* Profile */}

                    <div className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-400">
                          {avatarLetter}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-[var(--bw-text-strong)]">
                            {name}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-600">
                            {user?.email ||
                              'Signed in'}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Appearance */}

                    <div className="border-t border-white/[0.06] p-4">

                      <p className="text-xs font-medium text-[var(--bw-text-secondary)]">
                        Appearance
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-600">
                        Choose how BudgetWise looks.
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <ThemeButton
                          active={
                            theme ===
                            'light'
                          }
                          onClick={() =>
                            setTheme(
                              'light',
                            )
                          }
                          icon={
                            <SunIcon
                              size={
                                15
                              }
                            />
                          }
                          label="Light"
                        />

                        <ThemeButton
                          active={
                            theme ===
                            'dark'
                          }
                          onClick={() =>
                            setTheme(
                              'dark',
                            )
                          }
                          icon={
                            <MoonIcon
                              size={
                                15
                              }
                            />
                          }
                          label="Dark"
                        />

                      </div>

                    </div>

                    {/* Currency summary */}

                    <div className="border-t border-white/[0.06] px-4 py-3">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-xs text-zinc-600">
                            Currency
                          </p>

                          <p className="mt-1 text-xs font-medium text-[var(--bw-text-secondary)]">
                            {currencyInfo?.name ||
                              currency}
                          </p>

                        </div>

                        <span className="text-sm text-violet-300">
                          {currencyInfo?.symbol ||
                            currency}
                        </span>

                      </div>

                    </div>

                    {/* Settings */}

                    <div className="border-t border-white/[0.06] p-2">

                      <button
                        type="button"
                        onClick={
                          openSettings
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-white/[0.035] hover:text-[var(--bw-text-secondary)]"
                      >

                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03]">
                          <SettingsIcon
                            size={
                              15
                            }
                          />
                        </span>

                        <span>
                          Settings
                        </span>

                        <span className="ml-auto text-xs text-zinc-700">
                          →
                        </span>

                      </button>

                    </div>

                    {/* Sign out */}

                    <div className="border-t border-white/[0.06] p-2">

                      <button
                        type="button"
                        onClick={
                          handleSignOut
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                      >

                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/5">
                          <LogoutIcon
                            size={
                              15
                            }
                          />
                        </span>

                        <span>
                          Sign out
                        </span>

                      </button>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <main className="min-w-0 flex-1 bg-[var(--bw-bg)] px-5 py-7 text-[var(--bw-text)] sm:px-6 sm:py-8 lg:px-10 lg:py-9">

            <Outlet />

          </main>

        </div>

      </div>

    </div>
  )
}

/*
 * =========================================================
 * NAV ITEM
 * =========================================================
 */

function NavItem({
  item,
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({
        isActive,
      }) =>
        [
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-violet-500/[0.10] text-violet-400'
            : 'text-zinc-500 hover:bg-white/[0.035] hover:text-[var(--bw-text-secondary)]',
        ].join(' ')
      }
    >

      {({
        isActive,
      }) => (
        <>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              isActive
                ? 'bg-violet-500/[0.10] text-violet-400'
                : 'text-zinc-500 group-hover:text-violet-400'
            }`}
          >
            <Icon />
          </span>

          <span>
            {item.label}
          </span>

          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
          )}
        </>
      )}

    </NavLink>
  )
}

/*
 * =========================================================
 * THEME BUTTON
 * =========================================================
 */

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
        active
          ? 'border-violet-400/20 bg-violet-500/[0.09] text-violet-400'
          : 'border-white/[0.05] bg-white/[0.02] text-zinc-500 hover:border-violet-400/20 hover:text-violet-400'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

/*
 * =========================================================
 * DATE
 * =========================================================
 */

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

/*
 * =========================================================
 * ICON SYSTEM
 * =========================================================
 */

function Icon({
  children,
  size = 17,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/*
 * =========================================================
 * NAVIGATION ICONS
 * =========================================================
 */

function OverviewIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
    </Icon>
  )
}

function ExpensesIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M7 3h8l3 3v15H7z" />
      <path d="M15 3v4h4" />
      <path d="M10 12h5" />
      <path d="M10 16h5" />
      <path d="M10 8h2" />
    </Icon>
  )
}

function CalendarIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
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
    </Icon>
  )
}

function BudgetIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
      <path d="M4 9l6-4 6 7 5-5" />
    </Icon>
  )
}

function GoalsIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
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

function ReportsIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </Icon>
  )
}

function InsightsIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.5 14.5C7.5 13.5 7 12.2 7 10.7a5 5 0 0110 0c0 1.5-.5 2.8-1.5 3.8-.7.7-1.2 1.3-1.4 2.5h-4.2c-.2-1.2-.7-1.8-1.4-2.5z" />
    </Icon>
  )
}

function SettingsIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <circle
        cx="12"
        cy="12"
        r="3"
      />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5v.2h-2.4v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1L8 17l.1-.1A1.7 1.7 0 008.4 15a1.7 1.7 0 00-1.5-1H6.7v-2.4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5v-.2h2.4v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.2V14h-.2a1.7 1.7 0 00-1.5 1z" />
    </Icon>
  )
}

/*
 * =========================================================
 * HEADER ICONS
 * =========================================================
 */

function BellIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M18 9a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </Icon>
  )
}

function SunIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </Icon>
  )
}

function MoonIcon({
  size = 17,
}) {
  return (
    <Icon size={size}>
      <path d="M20.5 14.7A8.5 8.5 0 019.3 3.5 8.5 8.5 0 1020.5 14.7z" />
    </Icon>
  )
}

function ChevronDownIcon({
  size = 14,
}) {
  return (
    <Icon size={size}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  )
}

function SparkIcon({
  size = 15,
}) {
  return (
    <Icon size={size}>
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </Icon>
  )
}

function LogoutIcon({
  size = 15,
}) {
  return (
    <Icon size={size}>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 00-2-2h-5" />
    </Icon>
  )
}

export default AppLayout