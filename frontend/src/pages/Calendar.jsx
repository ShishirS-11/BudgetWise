import { useEffect, useState } from 'react'

import CalendarGrid from '../components/CalendarGrid'

import { getExpenses } from '../services/expenseService'
import { getBudget } from '../services/budgetService'

import { useCurrency } from '../context/CurrencyContext'

function Calendar() {
  const {
    formatCurrency,
    ratesLoading,
  } = useCurrency()

  const [expenses, setExpenses] =
    useState([])

  const [budget, setBudget] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadCalendarData()
  }, [])

  async function loadCalendarData() {
    try {
      setLoading(true)
      setError('')

      const [
        expenseData,
        budgetData,
      ] = await Promise.all([
        getExpenses(),
        getBudget(),
      ])

      setExpenses(
        expenseData || [],
      )

      setBudget(budgetData)
    } catch (err) {
      console.error(
        'Failed to load calendar data:',
        err,
      )

      setError(
        err?.message ||
          'Unable to load calendar data.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * Get number of days in
   * the budget month.
   */
  function getDaysInMonth(month) {
    if (!month) {
      return 0
    }

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

  const daysInBudgetMonth =
    budget
      ? getDaysInMonth(
          budget.month,
        )
      : 0

  /*
   * Fixed daily budget.
   *
   * The stored budget is INR.
   * CalendarGrid converts it for
   * display using CurrencyContext.
   */
  const dailyBudget =
    budget &&
    daysInBudgetMonth > 0
      ? Number(budget.amount) /
        daysInBudgetMonth
      : 0

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--bw-muted)]">
          Loading calendar...
        </p>
      </div>
    )
  }

  return (
    <div className="budgetwise-page mx-auto max-w-7xl">

      {/* Header */}

      <section>

        <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-primary)]">
          Daily spending
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Calendar
        </h1>

        <p className="mt-2 text-sm text-[var(--bw-body)]">
          See your spending and budget
          day by day.
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

          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadCalendarData
              }
              className="mt-3 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
            >
              Try again
            </button>

          </div>

        </section>
      )}

      {/* No budget */}

      {!budget && !error && (
        <section className="mt-8">

          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

            <p className="text-sm font-medium text-[var(--bw-text)]">
              No budget created yet
            </p>

            <p className="mt-2 text-sm text-[var(--bw-muted)]">
              Create a monthly budget
              first to see your daily
              budget here.
            </p>

          </div>

        </section>
      )}

      {/* Budget + Calendar */}

      {budget && (
        <>

          {/* Budget information */}

          <section className="mt-8 grid gap-4 md:grid-cols-3">

            {/* Monthly budget */}

            <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-5">

              <p className="text-xs text-[var(--bw-muted)]">
                Monthly budget
              </p>

              <p className="mt-2 text-xl font-semibold text-[var(--bw-heading)]">
                {formatCurrency(
                  budget.amount,
                )}
              </p>

            </div>

            {/* Days */}

            <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-5">

              <p className="text-xs text-[var(--bw-muted)]">
                Days in month
              </p>

              <p className="mt-2 text-xl font-semibold text-[var(--bw-heading)]">
                {daysInBudgetMonth}
              </p>

            </div>

            {/* Daily budget */}

            <div className="rounded-2xl border border-[color:var(--bw-border)] bg-[var(--bw-primary-soft)] p-5">

              <p className="text-xs text-[var(--bw-muted)]">
                Actual daily budget
              </p>

              <p className="mt-2 text-xl font-semibold text-[var(--bw-primary)]">
                {formatCurrency(
                  dailyBudget,
                  {
                    maximumFractionDigits: 0,
                  },
                )}
              </p>

              <p className="mt-1 text-xs text-[var(--bw-muted)]">
                No carry-forward
              </p>

            </div>

          </section>

          {/* Calendar */}

          <section className="mt-8 pb-10">

            <CalendarGrid
              expenses={expenses}
              dailyBudget={
                dailyBudget
              }
            />

          </section>

        </>
      )}

    </div>
  )
}

export default Calendar