import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'

import { useCurrency } from '../context/CurrencyContext'

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
  const { formatCurrency } = useCurrency()

  const [transactions, setTransactions] =
    useState([])

  const [budget, setBudget] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  /*
   * =========================================
   * CURRENT DATE
   * =========================================
   */

  const today = new Date()

  const currentYear =
    today.getFullYear()

  const currentMonth =
    today.getMonth()

  const currentMonthStart =
    `${currentYear}-${String(
      currentMonth + 1,
    ).padStart(2, '0')}-01`

  /*
   * =========================================
   * LOAD DATA
   * =========================================
   */

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      setLoading(true)
      setError('')

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        throw new Error(
          'You must be signed in.',
        )
      }

      const {
        data: transactionData,
        error: transactionError,
      } =
        await supabase
          .from('expenses')
          .select('*')
          .eq(
            'user_id',
            user.id,
          )
          .order(
            'expense_date',
            {
              ascending: false,
            },
          )
          .order(
            'created_at',
            {
              ascending: false,
            },
          )

      if (transactionError) {
        throw transactionError
      }

      const {
        data: budgetData,
        error: budgetError,
      } =
        await supabase
          .from('budgets')
          .select('*')
          .eq(
            'user_id',
            user.id,
          )
          .eq(
            'month',
            currentMonthStart,
          )
          .maybeSingle()

      if (budgetError) {
        throw budgetError
      }

      const mappedTransactions =
        (
          transactionData || []
        ).map(
          (transaction) => ({
            id: transaction.id,

            name:
              transaction.name ||
              'Transaction',

            amount: Number(
              transaction.amount || 0,
            ),

            category:
              transaction.category ||
              'Other',

            date:
              transaction.expense_date,

            notes:
              transaction.notes ||
              '',

            transactionType:
              transaction.transaction_type ||
              'expense',
          }),
        )

      setTransactions(
        mappedTransactions,
      )

      setBudget(
        budgetData || null,
      )
    } catch (err) {
      console.error(
        'Insights loading error:',
        err,
      )

      setError(
        err?.message ||
          'Unable to load insights.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * =========================================
   * CURRENT MONTH EXPENSES
   * =========================================
   */

  const currentMonthExpenses =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          if (
            transaction.transactionType ===
            'credit'
          ) {
            return false
          }

          if (!transaction.date) {
            return false
          }

          const date = new Date(
            `${transaction.date}T00:00:00`,
          )

          return (
            date.getFullYear() ===
              currentYear &&
            date.getMonth() ===
              currentMonth
          )
        },
      )
    }, [
      transactions,
      currentYear,
      currentMonth,
    ])

  /*
   * =========================================
   * CURRENT MONTH CREDITS
   * =========================================
   */

  const currentMonthCredits =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          if (
            transaction.transactionType !==
            'credit'
          ) {
            return false
          }

          if (!transaction.date) {
            return false
          }

          const date = new Date(
            `${transaction.date}T00:00:00`,
          )

          return (
            date.getFullYear() ===
              currentYear &&
            date.getMonth() ===
              currentMonth
          )
        },
      )
    }, [
      transactions,
      currentYear,
      currentMonth,
    ])

  /*
   * =========================================
   * PREVIOUS MONTH
   * =========================================
   */

  const previousMonthTransactions =
    useMemo(() => {
      const previousDate =
        new Date(
          currentYear,
          currentMonth - 1,
          1,
        )

      const previousYear =
        previousDate.getFullYear()

      const previousMonth =
        previousDate.getMonth()

      return transactions.filter(
        (transaction) => {
          if (
            transaction.transactionType ===
            'credit'
          ) {
            return false
          }

          if (!transaction.date) {
            return false
          }

          const date = new Date(
            `${transaction.date}T00:00:00`,
          )

          return (
            date.getFullYear() ===
              previousYear &&
            date.getMonth() ===
              previousMonth
          )
        },
      )
    }, [
      transactions,
      currentYear,
      currentMonth,
    ])

  /*
   * =========================================
   * MONEY
   * =========================================
   */

  const monthlyBudget =
    Number(
      budget?.amount || 0,
    )

  const totalSpent =
    useMemo(() => {
      return getTotalSpent(
        currentMonthExpenses,
      )
    }, [
      currentMonthExpenses,
    ])

  const totalCredits =
    useMemo(() => {
      return currentMonthCredits.reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount || 0,
          ),
        0,
      )
    }, [
      currentMonthCredits,
    ])

  const availableMoney =
    monthlyBudget +
    totalCredits -
    totalSpent

  /*
   * =========================================
   * SPENDING METRICS
   * =========================================
   */

  const averageExpense =
    useMemo(() => {
      return getAverageExpense(
        currentMonthExpenses,
      )
    }, [
      currentMonthExpenses,
    ])

  const largestExpense =
    useMemo(() => {
      return getLargestExpense(
        currentMonthExpenses,
      )
    }, [
      currentMonthExpenses,
    ])

  const categoryTotals =
    useMemo(() => {
      return getCategoryTotals(
        currentMonthExpenses,
      )
    }, [
      currentMonthExpenses,
    ])

  const categoryShares =
    useMemo(() => {
      return getCategoryShare(
        categoryTotals,
        totalSpent,
      )
    }, [
      categoryTotals,
      totalSpent,
    ])

  const topCategory =
    categoryShares.length > 0
      ? categoryShares[0]
      : null

  /*
   * =========================================
   * BUDGET
   * =========================================
   */

  const budgetUsage =
    getBudgetUsage(
      totalSpent,
      monthlyBudget,
    )

  const spendingStatus =
    getSpendingStatus(
      totalSpent,
      monthlyBudget,
    )

  /*
   * =========================================
   * FORECAST
   * =========================================
   */

  const daysElapsed =
    today.getDate()

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
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
   * =========================================
   * PREVIOUS MONTH COMPARISON
   * =========================================
   */

  const previousMonthSpent =
    getTotalSpent(
      previousMonthTransactions,
    )

  let spendingChange = null

  if (previousMonthSpent > 0) {
    spendingChange =
      ((totalSpent -
        previousMonthSpent) /
        previousMonthSpent) *
      100
  }

  /*
   * =========================================
   * GENERATED INSIGHTS
   * =========================================
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

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--bw-border)] border-t-amber-400" />

          <p className="mt-4 text-sm text-[var(--bw-text-muted)]">
            Preparing your insights...
          </p>
        </div>
      </div>
    )
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadInsights
            }
            className="mt-4 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400">
          Financial intelligence
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--bw-text-strong)]">
          Insights
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bw-text-muted)]">
          A clearer view of your spending,
          budget health, and financial
          direction.
        </p>
      </section>

      {/* OVERVIEW */}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <InsightCard
          label="Total spent"
          value={`-${formatCurrency(
            totalSpent,
          )}`}
          description="Spent this month"
          tone="danger"
        />

        <InsightCard
          label="Money received"
          value={`+${formatCurrency(
            totalCredits,
          )}`}
          description="Credits this month"
          tone="positive"
        />

        <InsightCard
          label="Available"
          value={formatCurrency(
            availableMoney,
          )}
          description="Budget + credits - expenses"
          tone="accent"
        />

        <InsightCard
          label="Budget usage"
          value={`${budgetUsage.toFixed(
            1,
          )}%`}
          description={
            monthlyBudget > 0
              ? `${formatCurrency(
                  Math.max(
                    monthlyBudget -
                      totalSpent,
                    0,
                  ),
                )} remaining`
              : 'No budget configured'
          }
        />

        <InsightCard
          label="Average expense"
          value={formatCurrency(
            Math.round(
              averageExpense,
            ),
          )}
          description="Average per transaction"
        />

      </section>

      {/* BUDGET HEALTH */}

      <section className="mt-6">
        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
                Budget health
              </p>

              <h2 className="mt-2 text-xl font-medium text-[var(--bw-text-strong)]">
                {getBudgetHealthTitle(
                  spendingStatus,
                )}
              </h2>
            </div>

            <div
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                spendingStatus,
              )}`}
            >
              {getStatusLabel(
                spendingStatus,
              )}
            </div>

          </div>

          <div className="mt-7">

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--bw-text-muted)]">
                Monthly budget
              </span>

              <span className="font-medium text-[var(--bw-text-secondary)]">
                {formatCurrency(
                  monthlyBudget,
                )}
              </span>
            </div>

            {monthlyBudget > 0 ? (
              <>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bw-surface-alt)]">
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

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-[var(--bw-text-faint)]">
                    {budgetUsage.toFixed(
                      1,
                    )}
                    % used
                  </span>

                  <span className="text-[var(--bw-text-faint)]">
                    {budgetUsage >=
                    100
                      ? `${formatCurrency(
                          Math.max(
                            totalSpent -
                              monthlyBudget,
                            0,
                          ),
                        )} over`
                      : `${formatCurrency(
                          Math.max(
                            monthlyBudget -
                              totalSpent,
                            0,
                          ),
                        )} left`}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] px-4 py-4">
                <p className="text-sm leading-6 text-[var(--bw-text-faint)]">
                  Set a monthly budget to
                  start receiving budget
                  health insights.
                </p>
              </div>
            )}

          </div>

          <div className="mt-6 rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] px-4 py-4">
            <p className="text-sm leading-6 text-[var(--bw-text-muted)]">
              {budgetInsight}
            </p>
          </div>

        </div>
      </section>

      {/* FORECAST */}

      <section className="mt-6 grid gap-4 lg:grid-cols-2">

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
            End-of-month forecast
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-300">
            {formatCurrency(
              Math.round(
                projectedSpending,
              ),
            )}
          </p>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--bw-text-muted)]">
            Estimated total spending if
            your current daily spending
            pace continues.
          </p>

          <div className="mt-5 rounded-xl border border-amber-500/10 bg-amber-500/[0.035] px-4 py-4">
            <p className="text-sm leading-6 text-[var(--bw-text-muted)]">
              {projectionInsight}
            </p>
          </div>

        </div>

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
            Monthly outlook
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--bw-text-strong)]">
            {monthlyBudget <= 0
              ? 'No budget'
              : projectedDifference >=
                  0
                ? 'Under budget'
                : 'Over budget'}
          </p>

          {monthlyBudget > 0 && (
            <p
              className={`mt-2 text-xl font-medium ${
                projectedDifference >=
                0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {projectedDifference >=
              0
                ? '+'
                : '-'}
              {formatCurrency(
                Math.abs(
                  Math.round(
                    projectedDifference,
                  ),
                ),
              )}
            </p>
          )}

          <p className="mt-3 text-sm leading-6 text-[var(--bw-text-muted)]">
            Based on {daysElapsed}{' '}
            days of spending in a{' '}
            {daysInMonth}-day month.
          </p>

        </div>

      </section>

      {/* CATEGORY ANALYSIS */}

      <section className="mt-6">
        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
              Spending by category
            </p>

            <h2 className="mt-2 text-xl font-medium text-[var(--bw-text-strong)]">
              Where your money is going
            </h2>
          </div>

          {categoryShares.length ===
          0 ? (
            <EmptyState />
          ) : (
            <div className="mt-7 space-y-6">

              {categoryShares.map(
                (category) => (
                  <div
                    key={
                      category.category
                    }
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
                          {
                            category.category
                          }
                        </p>

                        <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
                          {category.percentage.toFixed(
                            1,
                          )}
                          % of spending
                        </p>
                      </div>

                      <p className="text-sm font-medium text-red-400">
                        -{formatCurrency(
                          category.amount,
                        )}
                      </p>

                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bw-surface-alt)]">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
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

      {/* LARGEST EXPENSE + RECOMMENDATION */}

      <section className="mt-6 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
            Largest expense
          </p>

          {largestExpense ? (
            <>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-red-400">
                -{formatCurrency(
                  largestExpense.amount,
                )}
              </p>

              <p className="mt-2 text-sm font-medium text-[var(--bw-text-secondary)]">
                {largestExpense.name}
              </p>

              <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
                {largestExpense.category ||
                  'Other'}{' '}
                ·{' '}
                {formatDate(
                  largestExpense.date,
                )}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--bw-text-faint)]">
              No expenses recorded yet.
            </p>
          )}

        </div>

        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.025] p-6">

          <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
            BudgetWise recommendation
          </p>

          <p className="mt-3 text-lg font-medium leading-7 text-[var(--bw-text-secondary)]">
            {getRecommendation(
              spendingStatus,
              topCategory,
              projectedDifference,
            )}
          </p>

          <p className="mt-3 text-sm leading-6 text-[var(--bw-text-muted)]">
            Based on your current month's
            spending activity.
          </p>

        </div>

      </section>

      {/* PREVIOUS MONTH */}

      <section className="mt-6">
        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
                Compared with last month
              </p>

              <h2 className="mt-2 text-xl font-medium text-[var(--bw-text-strong)]">
                Spending comparison
              </h2>
            </div>

            <div className="text-left sm:text-right">

              {spendingChange ===
              null ? (
                <p className="text-sm text-[var(--bw-text-faint)]">
                  No previous-month
                  spending data
                </p>
              ) : (
                <>
                  <p
                    className={`text-2xl font-semibold ${
                      spendingChange >
                      0
                        ? 'text-red-400'
                        : spendingChange <
                            0
                          ? 'text-emerald-400'
                          : 'text-[var(--bw-text-secondary)]'
                    }`}
                  >
                    {spendingChange >
                    0
                      ? '+'
                      : ''}
                    {spendingChange.toFixed(
                      1,
                    )}
                    %
                  </p>

                  <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
                    {spendingChange >
                    0
                      ? 'More spent'
                      : spendingChange <
                          0
                        ? 'Less spent'
                        : 'No change'}
                  </p>
                </>
              )}

            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <ComparisonBox
              label="This month"
              amount={totalSpent}
              negative
              formatCurrency={
                formatCurrency
              }
            />

            <ComparisonBox
              label="Previous month"
              amount={
                previousMonthSpent
              }
              negative
              formatCurrency={
                formatCurrency
              }
            />

          </div>

        </div>
      </section>

      {/* KEY INSIGHTS */}

      <section className="mt-6 pb-10">
        <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
            Key insights
          </p>

          <h2 className="mt-2 text-xl font-medium text-[var(--bw-text-strong)]">
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
                {topCategory.category}{' '}
                accounts for{' '}
                {topCategory.percentage.toFixed(
                  1,
                )}
                % of your total spending
                this month.
              </InsightRow>
            )}

            {largestExpense && (
              <InsightRow>
                Your largest expense was{' '}
                {formatCurrency(
                  largestExpense.amount,
                )}{' '}
                for{' '}
                {largestExpense.name}.
              </InsightRow>
            )}

            {totalCredits > 0 && (
              <InsightRow>
                You received{' '}
                {formatCurrency(
                  totalCredits,
                )}{' '}
                in credits this month.
              </InsightRow>
            )}

            <InsightRow>
              Your current average expense
              is{' '}
              {formatCurrency(
                Math.round(
                  averageExpense,
                ),
              )}{' '}
              per transaction.
            </InsightRow>

            {spendingChange !==
              null && (
              <InsightRow>
                Your spending is{' '}
                {spendingChange > 0
                  ? `${spendingChange.toFixed(
                      1,
                    )}% higher`
                  : spendingChange <
                      0
                    ? `${Math.abs(
                        spendingChange,
                      ).toFixed(
                        1,
                      )}% lower`
                    : 'about the same'}{' '}
                compared with the previous
                month.
              </InsightRow>
            )}

          </div>

        </div>
      </section>

    </div>
  )
}

/*
 * =========================================
 * INSIGHT CARD
 * =========================================
 */

function InsightCard({
  label,
  value,
  description,
  tone = 'default',
}) {
  const toneClasses = {
    danger: 'text-red-400',
    positive: 'text-emerald-400',
    accent: 'text-amber-300',
    default: 'text-[var(--bw-text-strong)]',
  }

  return (
    <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-5 transition hover:border-[var(--bw-border)]">

      <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${toneClasses[tone]}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-[var(--bw-text-faint)]">
        {description}
      </p>

    </div>
  )
}

/*
 * =========================================
 * COMPARISON BOX
 * =========================================
 */

function ComparisonBox({
  label,
  amount,
  negative = false,
  formatCurrency,
}) {
  return (
    <div className="rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] p-4">

      <p className="text-xs uppercase tracking-wider text-[var(--bw-text-faint)]">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-semibold ${
          negative
            ? 'text-red-400'
            : 'text-emerald-400'
        }`}
      >
        {negative
          ? '-'
          : '+'}
        {formatCurrency(amount)}
      </p>

    </div>
  )
}

/*
 * =========================================
 * INSIGHT ROW
 * =========================================
 */

function InsightRow({
  children,
}) {
  return (
    <div className="rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] px-4 py-4">

      <div className="flex gap-3">

        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

        <p className="text-sm leading-6 text-[var(--bw-text-muted)]">
          {children}
        </p>

      </div>

    </div>
  )
}

/*
 * =========================================
 * EMPTY STATE
 * =========================================
 */

function EmptyState() {
  return (
    <div className="mt-6 rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] px-4 py-10 text-center">

      <p className="text-sm text-[var(--bw-text-faint)]">
        Add some expenses to start seeing
        category insights.
      </p>

    </div>
  )
}

/*
 * =========================================
 * BUDGET STATUS
 * =========================================
 */

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

  return 'bg-zinc-500/10 text-[var(--bw-text-muted)]'
}

function getProgressClasses(status) {
  if (status === 'over') {
    return 'bg-red-500'
  }

  if (status === 'warning') {
    return 'bg-amber-400'
  }

  return 'bg-amber-500'
}

/*
 * =========================================
 * RECOMMENDATION
 * =========================================
 */

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

/*
 * =========================================
 * DATE
 * =========================================
 */

function formatDate(dateString) {
  if (!dateString) {
    return 'Unknown date'
  }

  const date = new Date(
    `${dateString}T00:00:00`,
  )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return dateString
  }

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