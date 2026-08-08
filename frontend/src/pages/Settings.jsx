import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'

import {
  resetAllFinancialData,
} from '../services/resetService'

function Settings() {
  const {
    user,
    signOut,
  } = useAuth()

  const {
    currency,
    currencyInfo,
  } = useCurrency()

  const navigate = useNavigate()

  const [showSignOut, setShowSignOut] =
    useState(false)

  const [showReset, setShowReset] =
    useState(false)

  const [resetting, setResetting] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [resetError, setResetError] =
    useState('')

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'

  /*
   * =====================================================
   * SIGN OUT
   * =====================================================
   */

  async function handleSignOut() {
    try {
      await signOut()

      setShowSignOut(false)

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Sign out failed:',
        error,
      )

      setMessage(
        'Unable to sign out. Please try again.',
      )

      setShowSignOut(false)
    }
  }

  /*
   * =====================================================
   * COMING SOON MESSAGE
   * =====================================================
   */

  function showComingSoon() {
    setMessage(
      'This preference will be available in a future update.',
    )

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  /*
   * =====================================================
   * OPEN RESET MODAL
   * =====================================================
   */

  function openResetConfirmation() {
    setResetError('')
    setShowReset(true)
  }

  /*
   * =====================================================
   * RESET FINANCIAL DATA
   * =====================================================
   */

  async function handleResetData() {
    try {
      setResetting(true)
      setResetError('')

      await resetAllFinancialData()

      setShowReset(false)

      setMessage(
        'All financial data has been reset successfully.',
      )

      /*
       * Reload the application so every
       * page fetches fresh data.
       */

      setTimeout(() => {
        window.location.reload()
      }, 900)
    } catch (error) {
      console.error(
        'Failed to reset financial data:',
        error,
      )

      setResetError(
        error?.message ||
          'Unable to reset your financial data. Please try again.',
      )
    } finally {
      setResetting(false)
    }
  }

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <section>

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-400">
          Preferences
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--bw-text-strong)]">
          Settings
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--bw-text-muted)]">
          Manage your BudgetWise account,
          preferences, and financial data.
        </p>

      </section>


      {/* =================================================
          PROFILE
      ================================================= */}

      <section className="mt-8">

        <div className="rounded-2xl border border-white/[0.06] bg-[var(--bw-surface)] p-6 shadow-sm">

          <p className="text-sm text-[var(--bw-text-muted)]">
            Profile
          </p>

          <h2 className="mt-1 text-xl font-medium text-[var(--bw-text-strong)]">
            Account information
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <SettingItem
              label="Name"
              value={name}
            />

            <SettingItem
              label="Email"
              value={
                user?.email ||
                'Not available'
              }
            />

          </div>

        </div>

      </section>


      {/* =================================================
          PREFERENCES
      ================================================= */}

      <section className="mt-6">

        <div className="rounded-2xl border border-white/[0.06] bg-[var(--bw-surface)] p-6 shadow-sm">

          <p className="text-sm text-[var(--bw-text-muted)]">
            Preferences
          </p>

          <h2 className="mt-1 text-xl font-medium text-[var(--bw-text-strong)]">
            BudgetWise preferences
          </h2>

          <div className="mt-6 divide-y divide-white/[0.06]">

            <PreferenceRow
              title="Currency"
              description="Currency used throughout your financial records."
              value={
                currencyInfo?.name ||
                currency
              }
              onClick={
                showComingSoon
              }
            />

            <PreferenceRow
              title="Appearance"
              description="Choose how BudgetWise looks."
              value="Use the theme switcher"
              onClick={
                showComingSoon
              }
            />

            <PreferenceRow
              title="Notifications"
              description="Manage reminders and financial notifications."
              value="Coming soon"
              onClick={
                showComingSoon
              }
            />

          </div>

        </div>

      </section>


      {/* =================================================
          ACCOUNT
      ================================================= */}

      <section className="mt-6">

        <div className="rounded-2xl border border-white/[0.06] bg-[var(--bw-surface)] p-6 shadow-sm">

          <p className="text-sm text-[var(--bw-text-muted)]">
            Account
          </p>

          <h2 className="mt-1 text-xl font-medium text-[var(--bw-text-strong)]">
            Account actions
          </h2>

          <div className="mt-6">

            <button
              type="button"
              onClick={() =>
                setShowSignOut(true)
              }
              className="rounded-xl border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              Sign out
            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          DANGER ZONE
      ================================================= */}

      <section className="mt-6">

        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.025] p-6">

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-400/80">
            Danger zone
          </p>

          <h2 className="mt-2 text-xl font-medium text-[var(--bw-text-strong)]">
            Start fresh
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bw-text-muted)]">
            Remove all of your financial
            records and start BudgetWise
            from a clean slate.
          </p>

          <div className="mt-6 rounded-xl border border-red-500/10 bg-red-500/[0.025] p-4">

            <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
              The following will be deleted:
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">

              <DangerItem text="All expenses" />

              <DangerItem text="All credits" />

              <DangerItem text="All monthly budgets" />

              <DangerItem text="All goals" />

              <DangerItem text="All goal contributions" />

              <DangerItem text="Complete financial history" />

            </div>

          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="max-w-md text-xs leading-5 text-[var(--bw-text-faint)]">
              Your BudgetWise account, login
              credentials, currency, and theme
              preferences will remain unchanged.
            </p>

            <button
              type="button"
              onClick={
                openResetConfirmation
              }
              className="shrink-0 rounded-xl border border-red-500/25 bg-red-500/[0.04] px-4 py-3 text-sm font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
            >
              Reset all financial data
            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          ABOUT
      ================================================= */}

      <section className="mt-6 pb-10">

        <div className="rounded-2xl border border-white/[0.06] bg-[var(--bw-surface)] p-6 shadow-sm">

          <p className="text-sm text-[var(--bw-text-muted)]">
            About BudgetWise
          </p>

          <div className="mt-4 flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
                BudgetWise
              </p>

              <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
                Personal finance management
              </p>

            </div>

            <p className="text-xs text-[var(--bw-text-faint)]">
              v1.0
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm rounded-xl border border-white/[0.08] bg-[var(--bw-surface)] px-4 py-3 shadow-2xl">

          <p className="text-sm text-[var(--bw-text-secondary)]">
            {message}
          </p>

        </div>
      )}


      {/* =================================================
          SIGN OUT MODAL
      ================================================= */}

      {showSignOut && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[var(--bw-surface)] p-6 shadow-2xl">

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--bw-text-faint)]">
              Account
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--bw-text-strong)]">
              Sign out of BudgetWise?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--bw-text-muted)]">
              You can sign back in anytime
              using your account credentials.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowSignOut(false)
                }
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-[var(--bw-text-muted)] transition hover:bg-white/[0.04] hover:text-[var(--bw-text-secondary)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSignOut
                }
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Sign out
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          RESET MODAL
      ================================================= */}

      {showReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-red-500/15 bg-[var(--bw-surface)] p-6 shadow-2xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <WarningIcon />
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-red-400/80">
              Permanent action
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--bw-text-strong)]">
              Reset all financial data?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--bw-text-muted)]">
              This will permanently delete your
              expenses, credits, budgets, goals,
              and goal contributions.
            </p>

            <p className="mt-3 text-sm font-medium leading-6 text-red-400">
              This action cannot be undone.
            </p>

            {resetError && (
              <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.05] px-4 py-3">

                <p className="text-xs leading-5 text-red-400">
                  {resetError}
                </p>

              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={resetting}
                onClick={() => {
                  setShowReset(false)
                  setResetError('')
                }}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-[var(--bw-text-muted)] transition hover:bg-white/[0.04] hover:text-[var(--bw-text-secondary)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={resetting}
                onClick={
                  handleResetData
                }
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetting
                  ? 'Resetting...'
                  : 'Yes, reset everything'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}


/* =========================================================
   SETTING ITEM
   ========================================================= */

function SettingItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">

      <p className="text-xs text-[var(--bw-text-faint)]">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-[var(--bw-text-secondary)]">
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   PREFERENCE ROW
   ========================================================= */

function PreferenceRow({
  title,
  description,
  value,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-5 py-5 text-left transition hover:bg-white/[0.02]"
    >

      <div className="min-w-0">

        <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--bw-text-faint)]">
          {description}
        </p>

      </div>

      <div className="flex shrink-0 items-center gap-3">

        <span className="hidden text-xs text-[var(--bw-text-muted)] sm:block">
          {value}
        </span>

        <span className="text-[var(--bw-text-faint)]">
          →
        </span>

      </div>

    </button>
  )
}


/* =========================================================
   DANGER ITEM
   ========================================================= */

function DangerItem({
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--bw-text-muted)]">

      <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />

      {text}

    </div>
  )
}


/* =========================================================
   WARNING ICON
   ========================================================= */

function WarningIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.8L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export default Settings