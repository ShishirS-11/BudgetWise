import { useMemo, useState } from 'react'

import {
  getAverageDailySpending,
  getCategoryChanges,
  getCategoryTotals,
  getHighestSpendingDay,
  getPeriodExpenses,
  getPreviousMonthRange,
  getSpendingChange,
  getTopCategory,
  getTotalSpent,
} from '../utils/reportCalculations'

import { getExpenses } from '../services/expenseService'
import { generateMonthlyReport } from '../utils/pdfReport'

function Reports() {
  const [period, setPeriod] = useState('monthly')

  const expenses = getExpenses()
  const today = new Date()

  /*
   * Current selected period
   */
  const periodRange = useMemo(
    () => getPeriodRange(period, today),
    [period, today.getMonth(), today.getFullYear()],
  )

  const periodExpenses = useMemo(
    () =>
      getPeriodExpenses(
        expenses,
        periodRange.start,
        periodRange.end,
      ),
    [
      expenses,
      periodRange.start,
      periodRange.end,
    ],
  )

  /*
   * Main statistics
   */
  const totalSpent = useMemo(
    () => getTotalSpent(periodExpenses),
    [periodExpenses],
  )

  const daysInPeriod = getDaysBetween(
    periodRange.start,
    periodRange.end,
  )

  const averageDailySpending = useMemo(
    () =>
      getAverageDailySpending(
        periodExpenses,
        daysInPeriod,
      ),
    [
      periodExpenses,
      daysInPeriod,
    ],
  )

  const topCategory = useMemo(
    () => getTopCategory(periodExpenses),
    [periodExpenses],
  )

  const highestSpendingDay = useMemo(
    () =>
      getHighestSpendingDay(
        periodExpenses,
      ),
    [periodExpenses],
  )

  const categoryTotals = useMemo(
    () =>
      getCategoryTotals(periodExpenses),
    [periodExpenses],
  )

  /*
   * Previous month comparison
   */
  const previousMonthRange = useMemo(
    () => getPreviousMonthRange(today),
    [today.getMonth(), today.getFullYear()],
  )

  const previousMonthExpenses = useMemo(
    () =>
      getPeriodExpenses(
        expenses,
        previousMonthRange.start,
        previousMonthRange.end,
      ),
    [
      expenses,
      previousMonthRange.start,
      previousMonthRange.end,
    ],
  )

  const previousMonthTotal = useMemo(
    () =>
      getTotalSpent(
        previousMonthExpenses,
      ),
    [previousMonthExpenses],
  )

  const spendingChange = useMemo(
    () =>
      getSpendingChange(
        totalSpent,
        previousMonthTotal,
      ),
    [
      totalSpent,
      previousMonthTotal,
    ],
  )

  const categoryChanges = useMemo(
    () =>
      getCategoryChanges(
        periodExpenses,
        previousMonthExpenses,
      ),
    [
      periodExpenses,
      previousMonthExpenses,
    ],
  )

  /*
   * PDF insights
   */
  const reportInsights = [
    getTopCategoryInsight(
      topCategory,
    ),
    getDailyAverageInsight(
      averageDailySpending,
    ),
    getHighestDayInsight(
      highestSpendingDay,
    ),
    getComparisonInsight(
      spendingChange,
      previousMonthTotal,
    ),
  ]

  function handleDownloadPDF() {
    generateMonthlyReport({
      monthLabel: formatPeriodLabel(
        period,
        today,
      ),
      totalSpent,
      averageDailySpending,
      topCategory,
      highestSpendingDay,
      spendingChange,
      categoryTotals,
      insights: reportInsights,
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-zinc-500">
              Spending analysis
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Understand where your money went and
              how your spending is changing.
            </p>
          </div>

          {/* PDF button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 active:scale-[0.98]"
          >
            Download PDF
          </button>
        </div>
      </section>

      {/* Period selector */}
      <section className="mt-8">
        <div className="inline-flex rounded-xl border border-white/5 bg-[#111417] p-1">
          {[
            {
              label: 'Weekly',
              value: 'weekly',
            },
            {
              label: 'Monthly',
              value: 'monthly',
            },
            {
              label: 'Yearly',
              value: 'yearly',
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setPeriod(item.value)
              }
              className={`rounded-lg px-4 py-2 text-sm transition ${
                period === item.value
                  ? 'bg-violet-500/10 text-violet-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Current period */}
      <section className="mt-6">
        <p className="text-sm text-zinc-500">
          {formatPeriodLabel(
            period,
            today,
          )}
        </p>
      </section>

      {/* Summary cards */}
      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ReportCard
          label="Total spent"
          value={`₹${totalSpent.toLocaleString(
            'en-IN',
          )}`}
          description={`${periodExpenses.length} transactions`}
        />

        <ReportCard
          label="Daily average"
          value={`₹${Math.round(
            averageDailySpending,
          ).toLocaleString('en-IN')}`}
          description="Average spending per day"
        />

        <ReportCard
          label="Top category"
          value={
            topCategory
              ? topCategory.category
              : '—'
          }
          description={
            topCategory
              ? `₹${topCategory.amount.toLocaleString(
                  'en-IN',
                )}`
              : 'No spending recorded'
          }
        />

        <ReportCard
          label="Highest spending day"
          value={
            highestSpendingDay
              ? `₹${highestSpendingDay.amount.toLocaleString(
                  'en-IN',
                )}`
              : '—'
          }
          description={
            highestSpendingDay
              ? formatDate(
                  highestSpendingDay.date,
                )
              : 'No spending recorded'
          }
        />

        <ReportCard
          label="vs. previous month"
          value={
            spendingChange === null
              ? '—'
              : `${
                  spendingChange > 0
                    ? '+'
                    : ''
                }${spendingChange.toFixed(
                  1,
                )}%`
          }
          description={
            spendingChange === null
              ? 'No previous month data'
              : spendingChange > 0
                ? 'Spending increased'
                : spendingChange < 0
                  ? 'Spending decreased'
                  : 'No change'
          }
        />
      </section>

      {/* Spending trend */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-[#111417] p-6">
        <div>
          <p className="text-sm text-zinc-500">
            Spending trend
          </p>

          <p className="mt-1 text-lg font-medium">
            How your spending is moving
          </p>
        </div>

        <div className="mt-6">
          <ReportTrend
            expenses={periodExpenses}
            period={period}
          />
        </div>
      </section>

      {/* Category breakdown */}
      <section className="mt-6">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <div>
            <p className="text-sm text-zinc-500">
              Category breakdown
            </p>

            <p className="mt-1 text-lg font-medium">
              Where your money went
            </p>
          </div>

          {categoryTotals.length === 0 ? (
            <EmptyState
              message="No expenses recorded for this period."
            />
          ) : (
            <div className="mt-6 space-y-4">
              {categoryTotals.map(
                (category) => {
                  const percentage =
                    totalSpent > 0
                      ? (category.amount /
                          totalSpent) *
                        100
                      : 0

                  return (
                    <div
                      key={category.category}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-zinc-400">
                          {category.category}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600">
                            {percentage.toFixed(
                              0,
                            )}
                            %
                          </span>

                          <span className="text-sm font-medium text-zinc-200">
                            ₹
                            {category.amount.toLocaleString(
                              'en-IN',
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </div>
      </section>

      {/* Month-over-month comparison */}
      <section className="mt-6">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <p className="text-sm text-zinc-500">
            Month-over-month comparison
          </p>

          <p className="mt-1 text-lg font-medium">
            Category changes
          </p>

          {categoryChanges.length === 0 ? (
            <EmptyState
              message="No category data available for comparison."
            />
          ) : (
            <div className="mt-6 space-y-3">
              {categoryChanges.map(
                (category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-zinc-300">
                        {category.category}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        ₹
                        {category.previousAmount.toLocaleString(
                          'en-IN',
                        )}{' '}
                        → ₹
                        {category.currentAmount.toLocaleString(
                          'en-IN',
                        )}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        category.change === null
                          ? 'text-zinc-600'
                          : category.change > 0
                            ? 'text-amber-400'
                            : category.change < 0
                              ? 'text-emerald-400'
                              : 'text-zinc-500'
                      }`}
                    >
                      {category.change === null
                        ? 'New'
                        : `${
                            category.change >
                            0
                              ? '+'
                              : ''
                          }${category.change.toFixed(
                            1,
                          )}%`}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {/* Insights */}
      <section className="mt-6 pb-10">
        <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
          <p className="text-sm text-zinc-500">
            Spending insights
          </p>

          <p className="mt-1 text-lg font-medium">
            What BudgetWise noticed
          </p>

          <div className="mt-5 space-y-3">
            {reportInsights.map(
              (insight, index) => (
                <Insight
                  key={index}
                  text={insight}
                />
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------- */
/* Report Card                      */
/* -------------------------------- */

function ReportCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 truncate text-xl font-semibold tracking-tight text-zinc-100">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  )
}

/* -------------------------------- */
/* Spending Trend                   */
/* -------------------------------- */

function ReportTrend({
  expenses,
  period,
}) {
  if (expenses.length === 0) {
    return (
      <EmptyState message="No spending data available for this period." />
    )
  }

  const dailyTotals = {}

  expenses.forEach((expense) => {
    if (!expense.date) {
      return
    }

    if (!dailyTotals[expense.date]) {
      dailyTotals[expense.date] = 0
    }

    dailyTotals[expense.date] +=
      Number(expense.amount || 0)
  })

  const values = Object.entries(
    dailyTotals,
  ).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  )

  const maxValue = Math.max(
    ...values.map(([, amount]) => amount),
    1,
  )

  return (
    <div>
      <div className="flex h-56 items-end gap-2 overflow-x-auto pb-6">
        {values.map(
          ([date, amount]) => {
            const height =
              Math.max(
                (amount / maxValue) * 100,
                5,
              )

            return (
              <div
                key={date}
                className="group flex min-w-10 flex-1 flex-col items-center justify-end"
              >
                <div className="relative w-full max-w-12">
                  <div
                    className="w-full rounded-t-lg bg-violet-500/70 transition group-hover:bg-violet-400"
                    style={{
                      height: `${height * 1.8}px`,
                    }}
                    title={`₹${amount.toLocaleString(
                      'en-IN',
                    )}`}
                  />
                </div>

                <p className="mt-2 text-[10px] text-zinc-600">
                  {formatShortDate(date)}
                </p>
              </div>
            )
          },
        )}
      </div>

      <p className="text-xs text-zinc-600">
        {period === 'monthly'
          ? 'Daily spending for this month'
          : period === 'weekly'
            ? 'Daily spending for this week'
            : 'Spending activity for this year'}
      </p>
    </div>
  )
}

/* -------------------------------- */
/* Insight                          */
/* -------------------------------- */

function Insight({ text }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111417] px-4 py-3">
      <p className="text-sm text-zinc-400">
        {text}
      </p>
    </div>
  )
}

/* -------------------------------- */
/* Empty State                      */
/* -------------------------------- */

function EmptyState({ message }) {
  return (
    <div className="mt-5 rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-8 text-center">
      <p className="text-sm text-zinc-600">
        {message}
      </p>
    </div>
  )
}

/* -------------------------------- */
/* Period helpers                   */
/* -------------------------------- */

function getPeriodRange(
  period,
  today,
) {
  const year = today.getFullYear()
  const month = today.getMonth()

  if (period === 'weekly') {
    const current = new Date(today)
    const dayOfWeek =
      current.getDay()

    const start = new Date(current)

    start.setDate(
      current.getDate() - dayOfWeek,
    )

    const end = new Date(start)

    end.setDate(
      start.getDate() + 6,
    )

    return {
      start: toDateString(start),
      end: toDateString(end),
    }
  }

  if (period === 'yearly') {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    }
  }

  const lastDay = new Date(
    year,
    month + 1,
    0,
  ).getDate()

  return {
    start: `${year}-${String(
      month + 1,
    ).padStart(2, '0')}-01`,
    end: `${year}-${String(
      month + 1,
    ).padStart(2, '0')}-${String(
      lastDay,
    ).padStart(2, '0')}`,
  }
}

function getDaysBetween(
  startDate,
  endDate,
) {
  const start = new Date(
    `${startDate}T00:00:00`,
  )

  const end = new Date(
    `${endDate}T00:00:00`,
  )

  const difference =
    end.getTime() - start.getTime()

  return (
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24),
    ) + 1
  )
}

function toDateString(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

/* -------------------------------- */
/* Formatting                       */
/* -------------------------------- */

function formatDate(dateString) {
  const date = new Date(
    `${dateString}T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )
}

function formatShortDate(
  dateString,
) {
  const date = new Date(
    `${dateString}T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
    },
  )
}

function formatPeriodLabel(
  period,
  today,
) {
  if (period === 'weekly') {
    return 'Current week'
  }

  if (period === 'yearly') {
    return today
      .getFullYear()
      .toString()
  }

  return today.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  )
}

/* -------------------------------- */
/* Insights                         */
/* -------------------------------- */

function getTopCategoryInsight(
  category,
) {
  if (!category) {
    return 'Add some expenses to start generating spending insights.'
  }

  return `${category.category} is your highest spending category at ₹${category.amount.toLocaleString(
    'en-IN',
  )}.`
}

function getDailyAverageInsight(
  average,
) {
  if (average <= 0) {
    return 'There is not enough spending data to calculate your daily average.'
  }

  return `You're spending an average of ₹${Math.round(
    average,
  ).toLocaleString(
    'en-IN',
  )} per day during this period.`
}

function getHighestDayInsight(
  day,
) {
  if (!day) {
    return 'Your highest spending day will appear once you record expenses.'
  }

  return `Your highest spending day was ${formatDate(
    day.date,
  )}, when you spent ₹${day.amount.toLocaleString(
    'en-IN',
  )}.`
}

function getComparisonInsight(
  change,
  previousTotal,
) {
  if (
    change === null ||
    previousTotal === 0
  ) {
    return 'Once you have spending data from the previous month, BudgetWise will compare the two periods.'
  }

  if (change > 0) {
    return `Your spending increased by ${change.toFixed(
      1,
    )}% compared with the previous month.`
  }

  if (change < 0) {
    return `Your spending decreased by ${Math.abs(
      change,
    ).toFixed(
      1,
    )}% compared with the previous month.`
  }

  return 'Your spending is almost identical to the previous month.'
}

export default Reports