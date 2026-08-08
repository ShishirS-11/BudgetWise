import {
  useEffect,
  useState,
} from 'react'

import BudgetSetup from '../components/BudgetSetup'

import {
  getBudget,
  saveBudget,
} from '../services/budgetService'

import {
  useCurrency,
} from '../context/CurrencyContext'

function Budget() {
  const {
    formatCurrency,
    ratesLoading,
  } = useCurrency()

  const [budget, setBudget] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    getCurrentMonth(),
  )

  useEffect(() => {
    loadBudget(selectedMonth)
  }, [selectedMonth])

  async function loadBudget(
    month,
  ) {
    try {
      setLoading(true)
      setError('')

      const data =
        await getBudget(
          `${month}-01`,
        )

      setBudget(data)
    } catch (error) {
      console.error(
        'Failed to load budget:',
        error,
      )

      setError(
        error?.message ||
          'Unable to load budget.',
      )

      setBudget(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBudget(
    newBudget,
  ) {
    try {
      setSaving(true)
      setError('')

      const savedBudget =
        await saveBudget(
          newBudget.amount,
          newBudget.month,
        )

      setBudget(savedBudget)

      setSelectedMonth(
        savedBudget.month.slice(
          0,
          7,
        ),
      )
    } catch (error) {
      console.error(
        'Failed to save budget:',
        error,
      )

      setError(
        error?.message ||
          'Unable to save budget.',
      )
    } finally {
      setSaving(false)
    }
  }

  const amount =
    Number(budget?.amount || 0)

  const monthDate = budget
    ? new Date(
        `${budget.month}T00:00:00`,
      )
    : null

  const daysInMonth =
    monthDate
      ? new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() +
            1,
          0,
        ).getDate()
      : getDaysInSelectedMonth(
          selectedMonth,
        )

  const dailyBudget =
    amount > 0
      ? amount / daysInMonth
      : 0

  const monthLabel =
    formatMonth(selectedMonth)

  return (
    <div className="budgetwise-page mx-auto max-w-7xl">

      {/* Header */}

      <section>

        <p className="text-sm text-[var(--bw-body)]">
          Spending plan
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Budget
        </h1>

        <p className="mt-2 text-sm text-[var(--bw-body)]">
          Create and manage your
          monthly spending plan.
        </p>

        {ratesLoading && (
          <p className="mt-2 text-xs text-[var(--bw-muted)]">
            Updating exchange rates...
          </p>
        )}

      </section>

      {/* Error */}

      {error && (
        <section className="mt-6">

          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadBudget(
                  selectedMonth,
                )
              }
              className="mt-3 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
            >
              Try again
            </button>

          </div>

        </section>
      )}

      {/* Month selector */}

      <section className="mt-8">

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <label
            htmlFor="viewMonth"
            className="block text-sm text-[var(--bw-body)]"
          >
            View budget for
          </label>

          <input
            id="viewMonth"
            type="month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value,
              )
            }
            className="mt-3 rounded-xl border border-[var(--bw-border-strong)] bg-[var(--bw-surface-soft)] px-4 py-3 text-sm text-[var(--bw-heading)] outline-none focus:border-[color:var(--bw-primary)]"
          />

        </div>

      </section>

      {/* Current budget */}

      <section className="mt-6 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-sm text-[var(--bw-body)]">
            Monthly budget
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(
              amount,
            )}
          </p>

          <p className="mt-2 text-xs text-[var(--bw-muted)]">
            {monthLabel}
          </p>

        </div>

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-sm text-[var(--bw-body)]">
            Period
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {daysInMonth} days
          </p>

          <p className="mt-2 text-xs text-[var(--bw-muted)]">
            Full calendar month
          </p>

        </div>

        <div className="rounded-2xl border border-[color:var(--bw-border)] bg-[var(--bw-primary-soft)] p-6">

          <p className="text-sm text-[var(--bw-body)]">
            Daily budget
          </p>

          <p className="mt-3 text-2xl font-semibold text-[var(--bw-primary)]">
            {formatCurrency(
              dailyBudget,
              {
                maximumFractionDigits: 0,
              },
            )}
          </p>

          <p className="mt-2 text-xs text-[var(--bw-muted)]">
            Based on {daysInMonth}{' '}
            days
          </p>

        </div>

      </section>

      {/* Status */}

      {!loading && !budget && (
        <section className="mt-6">

          <div className="rounded-2xl border border-[color:var(--bw-border)] bg-[var(--bw-primary-soft)] p-6">

            <p className="text-sm font-medium text-[var(--bw-primary)]">
              No budget set for{' '}
              {monthLabel}.
            </p>

            <p className="mt-2 text-sm text-[var(--bw-body)]">
              Enter an amount below to
              create one.
            </p>

          </div>

        </section>
      )}

      {/* Loading */}

      {loading && (
        <section className="mt-6">

          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

            <p className="text-sm text-[var(--bw-muted)]">
              Loading budget...
            </p>

          </div>

        </section>
      )}

      {/* Setup */}

      <section className="mt-8 pb-10">

        <BudgetSetup
          budget={budget}
          onSave={handleSaveBudget}
          saving={saving}
        />

      </section>

    </div>
  )
}

function getCurrentMonth() {
  const date = new Date()

  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  return `${year}-${month}`
}

function getDaysInSelectedMonth(
  month,
) {
  const [
    year,
    monthNumber,
  ] = month
    .split('-')
    .map(Number)

  return new Date(
    year,
    monthNumber,
    0,
  ).getDate()
}

function formatMonth(month) {
  const date = new Date(
    `${month}-01T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  )
}

export default Budget