import { useMemo } from 'react'

import { getExpenses } from '../services/expenseService'
import { dashboardData } from '../data/dashboardData'

import {
  getAverageExpense,
  getBudgetInsight,
  getBudgetUsage,
  getCategoryShare,
  getLargestExpense,
  getProjectionInsight,
  getProjectedBudgetDifference,
  getProjectedMonthlySpending,
  getSpendingStatus,
} from '../utils/insightCalculations'

import {
  getCategoryTotals,
  getTotalSpent,
} from '../utils/reportCalculations'

function Insights() {
  const expenses = getExpenses()

  const today = new Date()

  const monthlyBudget = Number(
    dashboardData?.monthlyBudget || 0,
  )

  /*
   * Current month expenses
   */
  const currentMonthExpenses = useMemo(() => {
    const year = today.getFullYear()
    const month = today.getMonth()

    return expenses.filter((expense) => {
      if (!expense.date) {
        return false
      }

      const expenseDate = new Date(
        `${expense.date}T00:00:00`,
      )

      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() === month
      )
    })
  }, [expenses])

  /*
   * Basic calculations
   */
  const totalSpent = useMemo(
    () =>
      getTotalSpent(
        currentMonthExpenses,
      ),
    [currentMonthExpenses],
  )

  const averageExpense = useMemo(
    () =>
      getAverageExpense(
        currentMonthExpenses,
      ),
    [currentMonthExpenses],
  )

  const largestExpense = useMemo(
    () =>
      getLargestExpense(
        currentMonthExpenses,
      ),
    [currentMonthExpenses],
  )

  const categoryTotals = useMemo(
    () =>
      getCategoryTotals(
        currentMonthExpenses,
      ),
    [currentMonthExpenses],
  )

  const categoryShares = useMemo(
    () =>
      getCategoryShare(
        categoryTotals,
        totalSpent,
      ),
    [
      categoryTotals,
      totalSpent,
    ],
  )

  /*
   * Budget calculations
   */
  const budgetUsage = getBudgetUsage(
    totalSpent,
    monthlyBudget,
  )

  const spendingStatus =
    getSpendingStatus(
      totalSpent,
      monthlyBudget,
    )

  /*
   * Days elapsed / days in month
   */
  const daysElapsed =
    today.getDate()

  const daysInMonth =
    new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()

  const projectedSpending =
    getProjectedMonthlySpending(
      totalSpent,
      daysElapsed,
      daysInMonth,
    )

  const projectedDifference =
    getProjectedBudgetDifference(
      totalSpent,
      monthlyBudget,
      daysElapsed,
      daysInMonth,
    )

  /*
   * Insight messages
   */
  const budgetInsight =
    getBudgetInsight(
      totalSpent,
      monthlyBudget,
    )

  const projectionInsight =
    getProjectionInsight(
      projectedSpending,
      monthlyBudget,
    )

  const topCategory =
    categoryShares.length > 0
      ? categoryShares[0]
      : null

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section>
        <p className="text-sm text-zinc-500">
          Financial intelligence
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Insights
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Understand your spending patterns and
          make better financial decisions.
        </p>
      </section>

      {/* Main overview */}
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Total spent"
          value={`₹${totalSpent.toLocaleString(
            'en-IN',
          )}`}
          description="Spent this month"
        />

        <InsightCard
          label="Budget usage"
          value={`${budgetUsage.toFixed(1)}%`}
          description={
            monthlyBudget > 0
              ? `₹${Math.max(
                  monthlyBudget -
                    totalSpent,
                  0,
                ).toLocaleString(
                  'en-IN',
                )} remaining`
              : 'No budget configured'
          }
          accent
        />

        <InsightCard
          label="Average expense"
          value={`₹${Math.round(
            averageExpense,
          ).toLocaleString(
            'en-IN',
          )}`}
          description="Average per transaction"
        />

        <InsightCard
          label="Top category"
          value={
            topCategory
              ? topCategory.category
              : '—'
          }
          description={
            topCategory
              ? `${topCategory.percentage.toFixed(
                  1,
                )}% of total spending`
              : 'No spending data'
          }
        />
      </section>

      {/* Budget health */}
      <section className="mt-6">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm text-zinc-500">
                Budget health
              </p>

              <h2 className="mt-1 text-xl font-medium">
                {getBudgetHealthTitle(
                  spendingStatus,
                )}
              </h2>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                spendingStatus,
              )}`}
            >
              {getStatusLabel(
                spendingStatus,
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                Monthly budget
              </span>

              <span className="text-zinc-300">
                ₹
                {monthlyBudget.toLocaleString(
                  'en-IN',
                )}
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all ${getProgressClasses(
                  spendingStatus,
                )}`}
                style={{
                  width: `${Math.min(
                    budgetUsage,
                    100,
                  )}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-zinc-600">
                {budgetUsage.toFixed(1)}%
                used
              </span>

              <span className="text-zinc-600">
                {monthlyBudget > 0
                  ? `₹${Math.max(
                      monthlyBudget -
                        totalSpent,
                      0,
                    ).toLocaleString(
                      'en-IN',
                    )} left`
                  : 'Set a budget'}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-4">
            <p className="text-sm text-zinc-400">
              {budgetInsight}
            </p>
          </div>
        </div>
      </section>

      {/* Spending forecast */}
      <section className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
            <p className="text-sm text-zinc-500">
              End-of-month forecast
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-violet-300">
              ₹
              {Math.round(
                projectedSpending,
              ).toLocaleString(
                'en-IN',
              )}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Estimated total spending if your
              current pace continues.
            </p>

            <div className="mt-5 rounded-xl bg-violet-500/[0.04] px-4 py-4">
              <p className="text-sm text-zinc-400">
                {projectionInsight}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
            <p className="text-sm text-zinc-500">
              Monthly outlook
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {projectedDifference >= 0
                ? 'Under budget'
                : 'Over budget'}
            </p>

            <p
              className={`mt-2 text-xl font-medium ${
                projectedDifference >= 0
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {projectedDifference >=
              0
                ? `₹${Math.round(
                    projectedDifference,
                  ).toLocaleString(
                    'en-IN',
                  )} projected remaining`
                : `₹${Math.abs(
                    Math.round(
                      projectedDifference,
                    ),
                  ).toLocaleString(
                    'en-IN',
                  )} projected over budget`}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Based on {daysElapsed}{' '}
              days of spending in a{' '}
              {daysInMonth}-day month.
            </p>
          </div>
        </div>
      </section>

      {/* Category analysis */}
      <section className="mt-6">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <div>
            <p className="text-sm text-zinc-500">
              Spending by category
            </p>

            <h2 className="mt-1 text-xl font-medium">
              Where your money is going
            </h2>
          </div>

          {categoryShares.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-6 space-y-5">
              {categoryShares.map(
                (category) => (
                  <div
                    key={category.category}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          {category.category}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {category.percentage.toFixed(
                            1,
                          )}
                          % of spending
                        </p>
                      </div>

                      <p className="text-sm font-medium text-zinc-200">
                        ₹
                        {category.amount.toLocaleString(
                          'en-IN',
                        )}
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${Math.min(
                            category.percentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {/* Biggest expense */}
      <section className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
            <p className="text-sm text-zinc-500">
              Largest transaction
            </p>

            {largestExpense ? (
              <>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  ₹
                  {Number(
                    largestExpense.amount,
                  ).toLocaleString(
                    'en-IN',
                  )}
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {largestExpense.name}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  {largestExpense.category ||
                    'Other'}{' '}
                  ·{' '}
                  {formatDate(
                    largestExpense.date,
                  )}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">
                No expenses recorded yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              BudgetWise recommendation
            </p>

            <p className="mt-3 text-lg font-medium text-zinc-200">
              {getRecommendation(
                spendingStatus,
                topCategory,
                projectedDifference,
              )}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              This recommendation is based on
              your current month's spending
              activity.
            </p>
          </div>
        </div>
      </section>

      {/* Key insights */}
      <section className="mt-6 pb-10">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <p className="text-sm text-zinc-500">
            Key insights
          </p>

          <h2 className="mt-1 text-xl font-medium">
            What BudgetWise noticed
          </h2>

          <div className="mt-5 grid gap-3">
            <InsightRow>
              {budgetInsight}
            </InsightRow>

            <InsightRow>
              {projectionInsight}
            </InsightRow>

            {topCategory && (
              <InsightRow>
                {topCategory.category} accounts
                for{' '}
                {topCategory.percentage.toFixed(
                  1,
                )}
                % of your total spending this
                month.
              </InsightRow>
            )}

            {largestExpense && (
              <InsightRow>
                Your largest transaction was ₹
                {Number(
                  largestExpense.amount,
                ).toLocaleString(
                  'en-IN',
                )}{' '}
                for {largestExpense.name}.
              </InsightRow>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------- */
/* Components                       */
/* -------------------------------- */

function InsightCard({
  label,
  value,
  description,
  accent = false,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          accent
            ? 'text-violet-300'
            : 'text-zinc-100'
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  )
}

function InsightRow({ children }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-4">
      <div className="flex gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400" />

        <p className="text-sm leading-6 text-zinc-400">
          {children}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-10 text-center">
      <p className="text-sm text-zinc-600">
        Add some expenses to start seeing
        category insights.
      </p>
    </div>
  )
}

/* -------------------------------- */
/* Helpers                          */
/* -------------------------------- */

function getBudgetHealthTitle(
  status,
) {
  if (status === 'over') {
    return 'Your spending is over budget'
  }

  if (status === 'warning') {
    return 'You are approaching your budget'
  }

  if (status === 'healthy') {
    return 'Your spending is within budget'
  }

  return 'Set a budget to track your progress'
}

function getStatusLabel(status) {
  if (status === 'over') {
    return 'Over budget'
  }

  if (status === 'warning') {
    return 'Watch spending'
  }

  if (status === 'healthy') {
    return 'On track'
  }

  return 'No budget'
}

function getStatusClasses(status) {
  if (status === 'over') {
    return 'bg-red-500/10 text-red-400'
  }

  if (status === 'warning') {
    return 'bg-amber-500/10 text-amber-400'
  }

  if (status === 'healthy') {
    return 'bg-emerald-500/10 text-emerald-400'
  }

  return 'bg-zinc-500/10 text-zinc-500'
}

function getProgressClasses(status) {
  if (status === 'over') {
    return 'bg-red-500'
  }

  if (status === 'warning') {
    return 'bg-amber-400'
  }

  return 'bg-violet-500'
}

function getRecommendation(
  status,
  topCategory,
  projectedDifference,
) {
  if (status === 'over') {
    return 'Your spending has crossed the monthly budget. Focus on essential expenses until the next month.'
  }

  if (
    projectedDifference < 0
  ) {
    return 'Your current spending pace may push you over budget. Consider reducing discretionary spending.'
  }

  if (topCategory) {
    return `Keep an eye on ${topCategory.category}. It currently represents ${topCategory.percentage.toFixed(
      1,
    )}% of your spending.`
  }

  return 'Keep recording your expenses to receive more personalized recommendations.'
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Unknown date'
  }

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

export default Insights