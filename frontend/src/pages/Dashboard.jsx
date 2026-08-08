import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'
import { useCurrency } from '../context/CurrencyContext'

import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import SectionHeader from '../components/SectionHeader'
import SpendingChart from '../components/SpendingChart'

import { getGoals } from '../services/goalService'

import {
  getProgressPercentage,
  getRemainingAmount,
  getTotalSaved,
} from '../utils/goalCalculations'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'

  return 'Good night'
}

function getUserName(user) {
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name

  if (fullName) {
    return fullName.split(' ')[0]
  }

  const email = user?.email

  if (email) {
    return email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(' ')
  }

  return 'there'
}

function formatDate(dateString) {
  if (!dateString) {
    return ''
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

function getDaysInMonth(monthString) {
  if (!monthString) {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate()
  }

  const [year, month] =
    monthString.split('-').map(Number)

  return new Date(
    year,
    month,
    0,
  ).getDate()
}

function getMonthStart(
  date = new Date(),
) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  return `${year}-${month}-01`
}

function Dashboard() {
  const {
    formatCurrency,
    ratesLoading,
  } = useCurrency()

  const [user, setUser] =
    useState(null)

  const [
    transactions,
    setTransactions,
  ] = useState([])

  const [budget, setBudget] =
    useState(null)

  const [goals, setGoals] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const {
          data: {
            user: currentUser,
          },
          error: userError,
        } =
          await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!currentUser) {
          throw new Error(
            'You must be signed in.',
          )
        }

        const [
          transactionResult,
          budgetResult,
          goalsResult,
        ] = await Promise.all([
          supabase
            .from('expenses')
            .select('*')
            .eq(
              'user_id',
              currentUser.id,
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
            ),

          supabase
            .from('budgets')
            .select('*')
            .eq(
              'user_id',
              currentUser.id,
            )
            .eq(
              'month',
              getMonthStart(),
            )
            .maybeSingle(),

          getGoals(),
        ])

        if (transactionResult.error) {
          throw transactionResult.error
        }

        if (budgetResult.error) {
          throw budgetResult.error
        }

        if (!mounted) {
          return
        }

        setUser(currentUser)

        setTransactions(
          (
            transactionResult.data ||
            []
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
                transaction.notes || '',

              transactionType:
                transaction.transaction_type ||
                'expense',
            }),
          ),
        )

        setBudget(
          budgetResult.data || null,
        )

        setGoals(
          goalsResult || [],
        )
      } catch (loadError) {
        console.error(
          'Dashboard loading error:',
          loadError,
        )

        if (mounted) {
          setError(
            loadError.message ||
              'Unable to load your dashboard.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * =========================================
   * CURRENT DATE
   * =========================================
   */

  const today = new Date()

  const todayDate =
    today.toISOString().split('T')[0]

  const currentMonth =
    today.toLocaleDateString(
      'en-IN',
      {
        month: 'long',
        year: 'numeric',
      },
    )

  /*
   * =========================================
   * BUDGET
   * =========================================
   */

  const monthlyBudget = Number(
    budget?.amount || 0,
  )

  const budgetMonth =
    budget?.month ||
    getMonthStart()

  const daysInBudgetMonth =
    getDaysInMonth(
      budgetMonth,
    )

  const dailyBudget =
    daysInBudgetMonth > 0
      ? monthlyBudget /
        daysInBudgetMonth
      : 0

  /*
   * =========================================
   * TRANSACTIONS
   * =========================================
   */

  const expenseTransactions =
    useMemo(
      () =>
        transactions.filter(
          (transaction) =>
            transaction.transactionType !==
            'credit',
        ),
      [transactions],
    )

  const creditTransactions =
    useMemo(
      () =>
        transactions.filter(
          (transaction) =>
            transaction.transactionType ===
            'credit',
        ),
      [transactions],
    )

  /*
   * =========================================
   * TOTALS
   * =========================================
   */

  const totalSpent =
    useMemo(
      () =>
        expenseTransactions.reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0,
            ),
          0,
        ),
      [expenseTransactions],
    )

  const totalCredits =
    useMemo(
      () =>
        creditTransactions.reduce(
          (total, transaction) =>
            total +
            Number(
              transaction.amount || 0,
            ),
          0,
        ),
      [creditTransactions],
    )

  const availableMoney =
    monthlyBudget +
    totalCredits -
    totalSpent

  /*
   * =========================================
   * BUDGET PERCENTAGE
   * =========================================
   */

  const budgetUsed =
    monthlyBudget > 0
      ? (totalSpent /
          monthlyBudget) *
        100
      : 0

  const safeBudgetUsed =
    Math.min(
      Math.max(budgetUsed, 0),
      100,
    )

  /*
   * =========================================
   * DAYS REMAINING
   * =========================================
   */

  const daysRemaining =
    useMemo(() => {
      if (!budget) {
        return 0
      }

      const [year, month] =
        budgetMonth
          .split('-')
          .map(Number)

      const endDate = new Date(
        year,
        month,
        0,
      )

      const endDateString =
        `${endDate.getFullYear()}-${String(
          endDate.getMonth() + 1,
        ).padStart(2, '0')}-${String(
          endDate.getDate(),
        ).padStart(2, '0')}`

      if (
        todayDate >
        endDateString
      ) {
        return 0
      }

      const start =
        new Date(
          `${todayDate}T00:00:00`,
        )

      const end =
        new Date(
          `${endDateString}T00:00:00`,
        )

      return Math.max(
        1,
        Math.ceil(
          (
            end.getTime() -
            start.getTime()
          ) /
            (1000 *
              60 *
              60 *
              24),
        ) + 1,
      )
    }, [
      budget,
      budgetMonth,
      todayDate,
    ])

  /*
   * =========================================
   * TODAY'S SPENDING
   * =========================================
   */

  const todaySpent =
    useMemo(
      () =>
        expenseTransactions
          .filter(
            (transaction) =>
              transaction.date ===
              todayDate,
          )
          .reduce(
            (total, transaction) =>
              total +
              Number(
                transaction.amount ||
                  0,
              ),
            0,
          ),
      [
        expenseTransactions,
        todayDate,
      ],
    )

  const todayDifference =
    dailyBudget - todaySpent

  const todayStatus =
    todaySpent === 0
      ? 'No spending recorded today'
      : todaySpent <= dailyBudget
        ? 'Under your daily budget'
        : 'Over your daily budget'

  const todayStatusClass =
    todaySpent === 0
      ? 'text-zinc-500'
      : todaySpent <= dailyBudget
        ? 'text-emerald-400'
        : 'text-red-400'

  /*
   * =========================================
   * SPENDING CHART
   * =========================================
   */

  const spendingChartData =
    useMemo(() => {
      const grouped = {}

      expenseTransactions.forEach(
        (transaction) => {
          if (!transaction.date) {
            return
          }

          if (
            !grouped[
              transaction.date
            ]
          ) {
            grouped[
              transaction.date
            ] = 0
          }

          grouped[
            transaction.date
          ] += Number(
            transaction.amount || 0,
          )
        },
      )

      return Object.entries(
        grouped,
      )
        .sort(
          ([dateA], [dateB]) =>
            dateA.localeCompare(
              dateB,
            ),
        )
        .map(
          ([date, amount]) => ({
            day: new Date(
              `${date}T00:00:00`,
            ).getDate(),
            amount,
          }),
        )
    }, [expenseTransactions])

  /*
   * =========================================
   * CATEGORY TOTALS
   * =========================================
   */

  const categoryTotals =
    useMemo(() => {
      const totals = {}

      expenseTransactions.forEach(
        (transaction) => {
          const category =
            transaction.category ||
            'Other'

          totals[category] =
            (totals[category] || 0) +
            Number(
              transaction.amount || 0,
            )
        },
      )

      return Object.entries(
        totals,
      )
        .map(
          ([name, amount]) => ({
            name,
            amount,
          }),
        )
        .sort(
          (a, b) =>
            b.amount - a.amount,
        )
    }, [expenseTransactions])

  /*
   * =========================================
   * RECENT TRANSACTIONS
   * =========================================
   */

  const recentExpenses =
    transactions.slice(0, 8)

  /*
   * =========================================
   * GOALS
   * =========================================
   */

  const activeGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            getRemainingAmount(
              goal,
            ) > 0,
        ),
      [goals],
    )

  const completedGoals =
    useMemo(
      () =>
        goals.filter(
          (goal) =>
            getRemainingAmount(
              goal,
            ) <= 0,
        ),
      [goals],
    )

  const totalGoalSaved =
    useMemo(
      () =>
        goals.reduce(
          (total, goal) =>
            total +
            getTotalSaved(goal),
          0,
        ),
      [goals],
    )

  const totalGoalTarget =
    useMemo(
      () =>
        goals.reduce(
          (total, goal) =>
            total +
            Number(
              goal.targetAmount || 0,
            ),
          0,
        ),
      [goals],
    )

  const totalGoalRemaining =
    Math.max(
      totalGoalTarget -
        totalGoalSaved,
      0,
    )

  const overallGoalProgress =
    totalGoalTarget > 0
      ? Math.min(
          (totalGoalSaved /
            totalGoalTarget) *
            100,
          100,
        )
      : 0

  /*
   * =========================================
   * FEATURED GOAL
   * =========================================
   */

  const featuredGoal =
    useMemo(() => {
      if (
        activeGoals.length ===
        0
      ) {
        return null
      }

      const withTargetDate =
        activeGoals.filter(
          (goal) =>
            goal.targetDate,
        )

      if (
        withTargetDate.length >
        0
      ) {
        return [
          ...withTargetDate,
        ].sort(
          (a, b) =>
            new Date(
              `${a.targetDate}T00:00:00`,
            ) -
            new Date(
              `${b.targetDate}T00:00:00`,
            ),
        )[0]
      }

      return [
        ...activeGoals,
      ].sort(
        (a, b) =>
          getProgressPercentage(a) -
          getProgressPercentage(b),
      )[0]
    }, [activeGoals])

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-pulse rounded-full border border-violet-400/20 bg-violet-500/[0.06]" />

          <p className="mt-4 text-sm text-zinc-500">
            Preparing your dashboard...
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
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.035] p-6">

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-400/80">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

        </div>

      </div>
    )
  }

  /*
   * =========================================
   * PAGE
   * =========================================
   */

  return (
    <div className="mx-auto max-w-7xl">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <section className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#111417] px-6 py-7 sm:px-8 sm:py-8">

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.045] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

          <div>

            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-400">
              {currentMonth}
            </p>

            <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.045em] text-zinc-100 sm:text-[34px]">
              {getGreeting()},{' '}
              {getUserName(user)}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              A clear view of your spending,
              budget, and progress toward your
              goals.
            </p>

          </div>

          <div className="shrink-0">

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">

              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                Available
              </p>

              <p
                className={`mt-1.5 text-lg font-semibold tracking-tight ${
                  availableMoney >= 0
                    ? 'text-zinc-100'
                    : 'text-red-400'
                }`}
              >
                {formatCurrency(
                  availableMoney,
                )}
              </p>

            </div>

          </div>

        </div>

        {ratesLoading && (
          <p className="relative mt-4 text-[11px] text-zinc-700">
            Updating exchange rates...
          </p>
        )}

      </section>

      {/* ===================================== */}
      {/* FINANCIAL SUMMARY */}
      {/* ===================================== */}

      <section className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-4">

        <DashboardStat
          label="Monthly budget"
          value={formatCurrency(
            monthlyBudget,
          )}
          detail={
            budget
              ? `${daysInBudgetMonth} days`
              : 'No budget set'
          }
        />

        <DashboardStat
          label="Spent"
          value={formatCurrency(
            totalSpent,
          )}
          detail={`${budgetUsed.toFixed(
            1,
          )}% used`}
        />

        <DashboardStat
          label="Credits"
          value={`+${formatCurrency(
            totalCredits,
          )}`}
          detail="Money received"
          positive
        />

        <DashboardStat
          label="Available"
          value={formatCurrency(
            availableMoney,
          )}
          detail={
            availableMoney >= 0
              ? 'Within available funds'
              : 'Above available funds'
          }
          accent={
            availableMoney >= 0
          }
        />

      </section>

      {/* ===================================== */}
      {/* TODAY */}
      {/* ===================================== */}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

        <div className="rounded-2xl border border-white/[0.06] bg-[#111417] p-6 sm:p-7">

          <div className="flex flex-col justify-between gap-6 sm:flex-row">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Today's budget
                </p>

              </div>

              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-zinc-100">
                {formatCurrency(
                  dailyBudget,
                )}
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Your fixed daily allowance
                based on this month's budget.
                Unused money does not carry
                forward.
              </p>

            </div>

            <div className="sm:text-right">

              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                Spent today
              </p>

              <p
                className={`mt-3 text-2xl font-semibold tracking-tight ${
                  todaySpent <= dailyBudget
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {formatCurrency(
                  todaySpent,
                )}
              </p>

              <p
                className={`mt-1.5 text-xs ${todayStatusClass}`}
              >
                {todayStatus}
              </p>

            </div>

          </div>

          <div className="mt-7">

            <ProgressBar
              value={
                dailyBudget > 0
                  ? Math.min(
                      (todaySpent /
                        dailyBudget) *
                        100,
                      100,
                    )
                  : 0
              }
            />

          </div>

          <div className="mt-4 flex justify-between gap-3 text-xs">

            <span className="text-zinc-600">
              {todayDifference >= 0
                ? 'Remaining today'
                : 'Over today by'}
            </span>

            <span
              className={
                todayDifference >= 0
                  ? 'font-medium text-emerald-400'
                  : 'font-medium text-red-400'
              }
            >
              {todayDifference >= 0
                ? ''
                : '-'}
              {formatCurrency(
                Math.abs(
                  todayDifference,
                ),
              )}
            </span>

          </div>

        </div>

        {/* MONTHLY USAGE */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#111417] p-6 sm:p-7">

          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
            Monthly usage
          </p>

          <div className="mt-4 flex items-end justify-between gap-4">

            <p className="text-3xl font-semibold tracking-[-0.04em] text-zinc-100">
              {budgetUsed.toFixed(
                1,
              )}
              <span className="text-lg text-zinc-600">
                %
              </span>
            </p>

            <p className="text-right text-xs text-zinc-600">
              {daysRemaining}{' '}
              days remaining
            </p>

          </div>

          <div className="mt-6">

            <ProgressBar
              value={safeBudgetUsed}
            />

          </div>

          <div className="mt-5 border-t border-white/[0.05] pt-4">

            <div className="flex items-center justify-between text-xs">

              <span className="text-zinc-600">
                Remaining budget
              </span>

              <span
                className={
                  monthlyBudget -
                    totalSpent >=
                  0
                    ? 'font-medium text-zinc-300'
                    : 'font-medium text-red-400'
                }
              >
                {formatCurrency(
                  monthlyBudget -
                    totalSpent,
                )}
              </span>

            </div>

            <div className="mt-2 flex items-center justify-between text-xs">

              <span className="text-zinc-600">
                Daily allowance
              </span>

              <span className="font-medium text-zinc-400">
                {formatCurrency(
                  dailyBudget,
                )}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================== */}
      {/* GOALS */}
      {/* ===================================== */}

      <section className="mt-10">

        <SectionHeader
          title="Savings goals"
          description="Track the money you're putting aside for your future."
          action="View goals"
        />

        <div className="mt-5">

          {goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111417] px-6 py-10">

              <p className="text-sm font-medium text-zinc-400">
                No savings goals yet.
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Create a goal to start
                tracking your progress.
              </p>

            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-[#111417] p-6 sm:p-7">

              <div className="grid gap-6 md:grid-cols-3">

                <GoalMetric
                  label="Total saved"
                  value={`+${formatCurrency(
                    totalGoalSaved,
                  )}`}
                  className="text-emerald-400"
                />

                <GoalMetric
                  label="Remaining"
                  value={formatCurrency(
                    totalGoalRemaining,
                  )}
                />

                <GoalMetric
                  label="Overall progress"
                  value={`${overallGoalProgress.toFixed(
                    1,
                  )}%`}
                  className="text-violet-300"
                />

              </div>

              <div className="mt-6">

                <ProgressBar
                  value={
                    overallGoalProgress
                  }
                />

              </div>

              {featuredGoal && (
                <div className="mt-6 border-t border-white/[0.05] pt-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                    <div>

                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-violet-400">
                        Next goal
                      </p>

                      <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-200">
                        {
                          featuredGoal.name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-zinc-600">
                        {formatCurrency(
                          getTotalSaved(
                            featuredGoal,
                          ),
                        )}{' '}
                        saved of{' '}
                        {formatCurrency(
                          featuredGoal.targetAmount,
                        )}
                      </p>

                    </div>

                    <div className="sm:text-right">

                      <p className="text-2xl font-semibold tracking-tight text-violet-300">
                        {getProgressPercentage(
                          featuredGoal,
                        ).toFixed(1)}
                        %
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {formatCurrency(
                          getRemainingAmount(
                            featuredGoal,
                          ),
                        )}{' '}
                        remaining
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <ProgressBar
                      value={getProgressPercentage(
                        featuredGoal,
                      )}
                    />

                  </div>

                  {featuredGoal.targetDate && (
                    <p className="mt-3 text-xs text-zinc-600">
                      Target date:{' '}
                      {formatDate(
                        featuredGoal.targetDate,
                      )}
                    </p>
                  )}

                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.05] pt-4 text-xs text-zinc-600">

                <span>
                  {activeGoals.length}{' '}
                  active goal
                  {activeGoals.length ===
                  1
                    ? ''
                    : 's'}
                </span>

                {completedGoals.length >
                  0 && (
                  <span className="text-emerald-500">
                    {completedGoals.length}{' '}
                    completed
                  </span>
                )}

              </div>

            </div>
          )}

        </div>

      </section>

      {/* ===================================== */}
      {/* AVAILABLE MONEY */}
      {/* ===================================== */}

      <section className="mt-10">

        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-emerald-400/[0.10] bg-emerald-400/[0.025] p-6 sm:flex-row sm:items-center sm:p-7">

          <div>

            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
              Current available money
            </p>

            <p
              className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${
                availableMoney >= 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {formatCurrency(
                availableMoney,
              )}
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Monthly budget + credits -
              expenses
            </p>

          </div>

          <div className="w-full max-w-xs border-t border-white/[0.06] pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">

            <MoneyRow
              label="Budget"
              value={formatCurrency(
                monthlyBudget,
              )}
            />

            <MoneyRow
              label="Credits"
              value={`+${formatCurrency(
                totalCredits,
              )}`}
              valueClass="text-emerald-400"
            />

            <MoneyRow
              label="Expenses"
              value={`-${formatCurrency(
                totalSpent,
              )}`}
              valueClass="text-red-400"
            />

          </div>

        </div>

      </section>

      {/* ===================================== */}
      {/* SPENDING TREND */}
      {/* ===================================== */}

      <section className="mt-10">

        <SpendingChart
          data={
            spendingChartData
          }
        />

      </section>

      {/* ===================================== */}
      {/* CATEGORY BREAKDOWN */}
      {/* ===================================== */}

      <section className="mt-10">

        <SectionHeader
          title="Spending by category"
          description="Where your money is going this month."
        />

        {categoryTotals.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] bg-[#111417] p-8 text-center">

            <p className="text-sm text-zinc-500">
              No expenses recorded yet.
            </p>

          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">

            {categoryTotals.map(
              (
                category,
                index,
              ) => (
                <div
                  key={
                    category.name
                  }
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-[#111417] px-5 py-4 transition-colors duration-200 hover:border-white/[0.09] hover:bg-[#14171a]"
                >

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.025] text-xs font-medium text-zinc-500">
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-zinc-300">
                      {
                        category.name
                      }
                    </p>

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]">

                      <div
                        className="h-full rounded-full bg-violet-400/60"
                        style={{
                          width: `${totalSpent > 0
                            ? Math.min(
                                (category.amount /
                                  totalSpent) *
                                  100,
                                100,
                              )
                            : 0}%`,
                        }}
                      />

                    </div>

                  </div>

                  <span className="shrink-0 text-sm font-medium text-zinc-200">
                    {formatCurrency(
                      category.amount,
                    )}
                  </span>

                </div>
              ),
            )}

          </div>
        )}

      </section>

      {/* ===================================== */}
      {/* RECENT TRANSACTIONS */}
      {/* ===================================== */}

      <section className="mt-10 pb-10">

        <SectionHeader
          title="Recent transactions"
          description="Your latest spending and incoming money."
          action="View all"
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111417]">

          {recentExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">

              <p className="text-sm text-zinc-500">
                No transactions yet.
              </p>

              <p className="mt-1 text-xs text-zinc-700">
                Add your first expense or
                credit.
              </p>

            </div>
          ) : (
            recentExpenses.map(
              (expense) => {
                const isCredit =
                  expense.transactionType ===
                  'credit'

                return (
                  <div
                    key={
                      expense.id
                    }
                    className="group flex items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-white/[0.018] sm:px-6"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isCredit
                            ? 'bg-emerald-400/[0.07] text-emerald-400'
                            : 'bg-white/[0.025] text-zinc-600'
                        }`}
                      >

                        {isCredit ? (
                          <ArrowDownIcon />
                        ) : (
                          <ArrowUpIcon />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-zinc-300">
                          {
                            expense.name
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-600">
                          {
                            expense.category
                          }
                          {' · '}
                          {formatDate(
                            expense.date,
                          )}
                        </p>

                      </div>

                    </div>

                    <p
                      className={`shrink-0 text-sm font-semibold ${
                        isCredit
                          ? 'text-emerald-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      {isCredit
                        ? '+'
                        : '-'}
                      {formatCurrency(
                        expense.amount,
                      )}
                    </p>

                  </div>
                )
              },
            )
          )}

        </div>

      </section>

    </div>
  )
}

/*
 * =========================================
 * UI-ONLY HELPERS
 * =========================================
 */

function DashboardStat({
  label,
  value,
  detail,
  positive = false,
  accent = false,
}) {
  return (
    <div className="bg-[#111417] px-5 py-5 sm:px-6 sm:py-6">

      <div className="flex items-center justify-between gap-3">

        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">
          {label}
        </p>

        {accent && (
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        )}

        {positive && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}

      </div>

      <p
        className={`mt-3 truncate text-xl font-semibold tracking-[-0.025em] ${
          positive
            ? 'text-emerald-400'
            : 'text-zinc-100'
        }`}
      >
        {value}
      </p>

      <p className="mt-1.5 text-xs text-zinc-700">
        {detail}
      </p>

    </div>
  )
}

function GoalMetric({
  label,
  value,
  className = 'text-zinc-100',
}) {
  return (
    <div>

      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-semibold tracking-tight ${className}`}
      >
        {value}
      </p>

    </div>
  )
}

function MoneyRow({
  label,
  value,
  valueClass = 'text-zinc-300',
}) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">

      <span className="text-zinc-600">
        {label}
      </span>

      <span
        className={`font-medium ${valueClass}`}
      >
        {value}
      </span>

    </div>
  )
}

/*
 * =========================================
 * SMALL ICONS
 * =========================================
 */

function ArrowDownIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m7 14 5 5 5-5" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m7 10 5-5 5 5" />
    </svg>
  )
}

export default Dashboard