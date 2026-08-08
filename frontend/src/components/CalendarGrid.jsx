import {
  useMemo,
  useState,
} from 'react'

import {
  useCurrency,
} from '../context/CurrencyContext'

function CalendarGrid({
  expenses = [],
  dailyBudget = 0,
}) {
  const {
    formatCurrency,
  } = useCurrency()

  const today = new Date()

  const [
    currentDate,
    setCurrentDate,
  ] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ),
  )

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    formatDateString(today),
  )

  const year =
    currentDate.getFullYear()

  const month =
    currentDate.getMonth()

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate()

  const firstDayOfMonth =
    new Date(
      year,
      month,
      1,
    ).getDay()

  const monthName =
    currentDate.toLocaleString(
      'en-IN',
      {
        month: 'long',
        year: 'numeric',
      },
    )

  /*
   * Calendar cells.
   */

  const calendarDays =
    useMemo(() => {
      const days = []

      for (
        let i = 0;
        i < firstDayOfMonth;
        i += 1
      ) {
        days.push(null)
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day += 1
      ) {
        days.push(day)
      }

      return days
    }, [
      firstDayOfMonth,
      daysInMonth,
    ])

  /*
   * Get date string for a
   * calendar day.
   */

  function formatDate(day) {
    if (!day) {
      return ''
    }

    return formatDateString(
      new Date(
        year,
        month,
        day,
      ),
    )
  }

  /*
   * Get transactions for
   * a day.
   */

  function getDayTransactions(
    day,
  ) {
    if (!day) {
      return []
    }

    const date =
      formatDate(day)

    return expenses.filter(
      (expense) =>
        expense.date === date,
    )
  }

  /*
   * Calculate daily spending.
   *
   * Credits are NOT spending.
   */

  function getDaySpent(day) {
    const transactions =
      getDayTransactions(day)

    return transactions
      .filter(
        (transaction) =>
          transaction.transactionType !==
          'credit',
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount ||
              0,
          ),
        0,
      )
  }

  /*
   * Calculate daily credits.
   */

  function getDayCredits(day) {
    const transactions =
      getDayTransactions(day)

    return transactions
      .filter(
        (transaction) =>
          transaction.transactionType ===
          'credit',
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount ||
              0,
          ),
        0,
      )
  }

  /*
   * Selected day's transactions.
   */

  const selectedTransactions =
    useMemo(() => {
      if (!selectedDate) {
        return []
      }

      return expenses.filter(
        (expense) =>
          expense.date ===
          selectedDate,
      )
    }, [
      expenses,
      selectedDate,
    ])

  const selectedExpenses =
    selectedTransactions.filter(
      (transaction) =>
        transaction.transactionType !==
        'credit',
    )

  const selectedCredits =
    selectedTransactions.filter(
      (transaction) =>
        transaction.transactionType ===
        'credit',
    )

  const selectedSpent =
    selectedExpenses.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.amount || 0,
        ),
      0,
    )

  const selectedCreditAmount =
    selectedCredits.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.amount || 0,
        ),
      0,
    )

  /*
   * Fixed daily remaining.
   *
   * No carry-forward.
   */

  const selectedRemaining =
    dailyBudget -
    selectedSpent

  /*
   * Today's date.
   */

  const todayString =
    formatDateString(today)

  function previousMonth() {
    setCurrentDate(
      new Date(
        year,
        month - 1,
        1,
      ),
    )
  }

  function nextMonth() {
    setCurrentDate(
      new Date(
        year,
        month + 1,
        1,
      ),
    )
  }

  function goToToday() {
    const now =
      new Date()

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    )

    setSelectedDate(
      formatDateString(now),
    )
  }

  function selectDay(day) {
    if (!day) {
      return
    }

    setSelectedDate(
      formatDate(day),
    )
  }

  return (
    <div className="space-y-6">

      {/* Calendar */}

      <div className="overflow-hidden rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-[var(--bw-border)] px-5 py-4">

          <div>

            <p className="text-lg font-medium">
              {monthName}
            </p>

            <p className="mt-1 text-xs text-[var(--bw-muted)]">
              Fixed daily budget:{' '}
              {formatCurrency(
                dailyBudget,
                {
                  maximumFractionDigits: 0,
                },
              )}
            </p>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={
                previousMonth
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bw-border)] text-[var(--bw-body)] transition hover:border-[var(--bw-border)] hover:text-[var(--bw-heading)]"
              aria-label="Previous month"
            >
              ←
            </button>

            <button
              type="button"
              onClick={
                goToToday
              }
              className="rounded-lg border border-[var(--bw-border)] px-3 py-2 text-xs text-[var(--bw-body)] transition hover:border-[var(--bw-border)] hover:text-[var(--bw-heading)]"
            >
              Today
            </button>

            <button
              type="button"
              onClick={
                nextMonth
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bw-border)] text-[var(--bw-body)] transition hover:border-[var(--bw-border)] hover:text-[var(--bw-heading)]"
              aria-label="Next month"
            >
              →
            </button>

          </div>

        </div>

        {/* Weekdays */}

        <div className="grid grid-cols-7 border-b border-[var(--bw-border)]">

          {[
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
          ].map(
            (day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide text-[var(--bw-muted)]"
              >
                {day}
              </div>
            ),
          )}

        </div>

        {/* Days */}

        <div className="grid grid-cols-7">

          {calendarDays.map(
            (day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[105px] border-b border-r border-[var(--bw-border)] bg-[var(--bw-surface-soft)]/50"
                  />
                )
              }

              const date =
                formatDate(day)

              const dayTransactions =
                getDayTransactions(
                  day,
                )

              const spent =
                getDaySpent(day)

              const credits =
                getDayCredits(day)

              const remaining =
                dailyBudget -
                spent

              const isToday =
                date ===
                todayString

              const isSelected =
                date ===
                selectedDate

              const hasSpending =
                spent > 0

              const isOverBudget =
                hasSpending &&
                dailyBudget > 0 &&
                spent >
                  dailyBudget

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() =>
                    selectDay(day)
                  }
                  className={`relative min-h-[105px] border-b border-r border-[var(--bw-border)] p-2 text-left transition ${
                    isSelected
                      ? 'bg-amber-500/[0.08]'
                      : 'hover:bg-white/[0.025]'
                  }`}
                >

                  {/* Day number */}

                  <div className="flex items-center justify-between">

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-[var(--bw-text)]'
                      }`}
                    >
                      {day}
                    </span>

                    {dayTransactions.length >
                      0 && (
                      <span className="text-[10px] text-[var(--bw-muted)]">
                        {
                          dayTransactions.length
                        }
                      </span>
                    )}

                  </div>

                  {/* Spending */}

                  {hasSpending && (
                    <div className="mt-3">

                      <p
                        className={`text-xs font-semibold ${
                          isOverBudget
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        -
                        {formatCurrency(
                          spent,
                          {
                            maximumFractionDigits: 0,
                          },
                        )}
                      </p>

                      <p
                        className={`mt-1 text-[10px] ${
                          isOverBudget
                            ? 'text-red-400/70'
                            : 'text-[var(--bw-muted)]'
                        }`}
                      >
                        {isOverBudget
                          ? `-${formatCurrency(
                              Math.abs(
                                remaining,
                              ),
                              {
                                maximumFractionDigits: 0,
                              },
                            )} over`
                          : `${formatCurrency(
                              remaining,
                              {
                                maximumFractionDigits: 0,
                              },
                            )} left`}
                      </p>

                    </div>
                  )}

                  {/* No spending */}

                  {!hasSpending &&
                    dailyBudget >
                      0 && (
                      <div className="mt-3">

                        <p className="text-[10px] text-[var(--bw-muted)]">
                          No spending
                        </p>

                        <p className="mt-1 text-[10px] text-emerald-400/70">
                          {formatCurrency(
                            dailyBudget,
                            {
                              maximumFractionDigits: 0,
                            },
                          )}{' '}
                          budget
                        </p>

                      </div>
                    )}

                  {/* Credits */}

                  {credits > 0 && (
                    <p className="absolute bottom-2 right-2 text-[10px] font-medium text-emerald-400">
                      +
                      {formatCurrency(
                        credits,
                        {
                          maximumFractionDigits: 0,
                        },
                      )}
                    </p>
                  )}

                  {/* Status */}

                  {hasSpending && (
                    <span
                      className={`absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full ${
                        isOverBudget
                          ? 'bg-red-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  )}

                </button>
              )
            },
          )}

        </div>

      </div>

      {/* Selected day */}

      <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

          <div>

            <p className="text-sm text-[var(--bw-body)]">
              Selected day
            </p>

            <h2 className="mt-1 text-xl font-medium">
              {formatSelectedDate(
                selectedDate,
              )}
            </h2>

          </div>

          <div className="text-left sm:text-right">

            <p className="text-xs text-[var(--bw-muted)]">
              Daily budget
            </p>

            <p className="mt-1 text-lg font-semibold text-amber-300">
              {formatCurrency(
                dailyBudget,
                {
                  maximumFractionDigits: 0,
                },
              )}
            </p>

          </div>

        </div>

        {/* Day summary */}

        <div className="mt-6 grid gap-3 md:grid-cols-3">

          <SummaryCard
            label="Spent"
            value={`-${formatCurrency(
              selectedSpent,
              {
                maximumFractionDigits: 0,
              },
            )}`}
            className="text-red-400"
          />

          <SummaryCard
            label="Received"
            value={`+${formatCurrency(
              selectedCreditAmount,
              {
                maximumFractionDigits: 0,
              },
            )}`}
            className="text-emerald-400"
          />

          <SummaryCard
            label={
              selectedRemaining >=
              0
                ? 'Remaining'
                : 'Over budget'
            }
            value={`${
              selectedRemaining >=
              0
                ? ''
                : '-'
            }${formatCurrency(
              Math.abs(
                selectedRemaining,
              ),
              {
                maximumFractionDigits: 0,
              },
            )}`}
            className={
              selectedRemaining >=
              0
                ? 'text-emerald-400'
                : 'text-red-400'
            }
          />

        </div>

        {/* Transactions */}

        <div className="mt-6">

          <p className="text-sm font-medium text-[var(--bw-text)]">
            Transactions
          </p>

          {selectedTransactions.length ===
          0 ? (
            <div className="mt-4 rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-soft)] p-6 text-center">

              <p className="text-sm text-[var(--bw-muted)]">
                No transactions on this
                day.
              </p>

              <p className="mt-1 text-xs text-[var(--bw-muted)]">
                Your unused daily budget
                does not carry forward.
              </p>

            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--bw-border)]">

              {selectedTransactions.map(
                (transaction) => {
                  const isCredit =
                    transaction.transactionType ===
                    'credit'

                  return (
                    <div
                      key={
                        transaction.id
                      }
                      className="flex items-center justify-between border-b border-[var(--bw-border)] bg-[var(--bw-surface-soft)] px-4 py-4 last:border-b-0"
                    >

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-[var(--bw-heading)]">
                          {transaction.name ||
                            transaction.description ||
                            'Transaction'}
                        </p>

                        <p className="mt-1 text-xs text-[var(--bw-muted)]">
                          {
                            transaction.category
                          }

                          {transaction.notes &&
                            ` · ${transaction.notes}`}
                        </p>

                      </div>

                      <p
                        className={`ml-4 shrink-0 text-sm font-semibold ${
                          isCredit
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {isCredit
                          ? '+'
                          : '-'}
                        {formatCurrency(
                          transaction.amount ||
                            0,
                        )}
                      </p>

                    </div>
                  )
                },
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

function SummaryCard({
  label,
  value,
  className,
}) {
  return (
    <div className="rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-soft)] p-4">

      <p className="text-xs text-[var(--bw-muted)]">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-semibold ${className}`}
      >
        {value}
      </p>

    </div>
  )
}

function formatDateString(
  date,
) {
  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatSelectedDate(
  dateString,
) {
  if (!dateString) {
    return 'Select a date'
  }

  const date = new Date(
    `${dateString}T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

export default CalendarGrid