import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'
import { useCurrency } from '../context/CurrencyContext'

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


  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

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


  /* ==========================================================
     CURRENT DATE
  ========================================================== */

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


  /* ==========================================================
     BUDGET
  ========================================================== */

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


  /* ==========================================================
     TRANSACTIONS
  ========================================================== */

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


  /* ==========================================================
     TOTALS
  ========================================================== */

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


  /* ==========================================================
     BUDGET PERCENTAGE
  ========================================================== */

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


  /* ==========================================================
     DAYS REMAINING
  ========================================================== */

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


  /* ==========================================================
     TODAY
  ========================================================== */

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


  /* ==========================================================
     SPENDING CHART
  ========================================================== */

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


  /* ==========================================================
     CATEGORY TOTALS
  ========================================================== */

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


  /* ==========================================================
     RECENT
  ========================================================== */

  const recentExpenses =
    transactions.slice(0, 8)


  /* ==========================================================
     GOALS
  ========================================================== */

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


  /* ==========================================================
     FEATURED GOAL
  ========================================================== */

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


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">

        <div className="text-center">

          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-[var(--bw-border)]
              bg-[var(--bw-accent-soft)]
              text-xl
            "
          >
            💰
          </div>

          <p
            className="
              mt-4
              text-sm
              text-[var(--bw-text-secondary)]
            "
          >
            Preparing your dashboard...
          </p>

        </div>

      </div>
    )
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div
          className="
            rounded-2xl
            border
            border-[var(--bw-danger)]
            bg-[var(--bw-danger-soft)]
            p-6
          "
        >

          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.14em]
              text-[var(--bw-danger)]
            "
          >
            Something went wrong
          </p>

          <p
            className="
              mt-2
              text-sm
              text-[var(--bw-danger)]
            "
          >
            {error}
          </p>

        </div>

      </div>
    )
  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="mx-auto max-w-7xl">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          budgetwise-card
          relative
          overflow-hidden
          rounded-[28px]
          px-6
          py-7
          sm:px-8
          sm:py-8
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-[var(--bw-accent)]
            opacity-[0.07]
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            justify-between
            gap-6
            sm:flex-row
            sm:items-end
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[var(--bw-accent)]
              "
            >
              {currentMonth}
            </p>

            <h1
              className="
                mt-3
                font-serif
                text-[32px]
                font-semibold
                tracking-[-0.035em]
                text-[var(--bw-heading)]
                sm:text-[38px]
              "
            >
              {getGreeting()},{' '}
              {getUserName(user)}
            </h1>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-[var(--bw-body)]
              "
            >
              A clear view of your spending,
              budget, and progress toward your
              goals.
            </p>

          </div>

          <div className="shrink-0">

            <div
              className="
                rounded-2xl
                border
                border-[var(--bw-border)]
                bg-[var(--bw-surface-soft)]
                px-5
                py-4
              "
            >

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-[var(--bw-muted)]
                "
              >
                Available
              </p>

              <p
                className={`
                  mt-1.5
                  font-serif
                  text-2xl
                  font-semibold
                  tracking-tight
                  ${
                    availableMoney >= 0
                      ? 'text-[var(--bw-heading)]'
                      : 'text-[var(--bw-danger)]'
                  }
                `}
              >
                {formatCurrency(
                  availableMoney,
                )}
              </p>

            </div>

          </div>

        </div>

        {ratesLoading && (
          <p
            className="
              relative
              mt-4
              text-[11px]
              text-[var(--bw-muted)]
            "
          >
            Updating exchange rates...
          </p>
        )}

      </section>


      {/* ======================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      <section
        className="
          mt-6
          grid
          gap-4
          md:grid-cols-4
        "
      >

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
          icon="💰"
        />

        <DashboardStat
          label="Spent"
          value={formatCurrency(
            totalSpent,
          )}
          detail={`${budgetUsed.toFixed(
            1,
          )}% used`}
          icon="💳"
        />

        <DashboardStat
          label="Credits"
          value={`+${formatCurrency(
            totalCredits,
          )}`}
          detail="Money received"
          icon="📈"
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
          icon="✨"
          accent={
            availableMoney >= 0
          }
        />

      </section>


      {/* ======================================================
          TODAY
      ====================================================== */}

      <section
        className="
          mt-6
          grid
          gap-6
          lg:grid-cols-[1.35fr_0.65fr]
        "
      >

        <div
          className="
            budgetwise-card
            rounded-[24px]
            p-6
            sm:p-7
          "
        >

          <div
            className="
              flex
              flex-col
              justify-between
              gap-6
              sm:flex-row
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[var(--bw-accent)]
                  "
                />

                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--bw-muted)]
                  "
                >
                  Today's budget
                </p>

              </div>

              <p
                className="
                  mt-4
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.04em]
                  text-[var(--bw-heading)]
                "
              >
                {formatCurrency(
                  dailyBudget,
                )}
              </p>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-[var(--bw-body)]
                "
              >
                Your fixed daily allowance
                based on this month's budget.
                Unused money does not carry
                forward.
              </p>

            </div>

            <div className="sm:text-right">

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--bw-muted)]
                "
              >
                Spent today
              </p>

              <p
                className={`
                  mt-3
                  font-serif
                  text-2xl
                  font-semibold
                  tracking-tight
                  ${
                    todaySpent <=
                    dailyBudget
                      ? 'text-[var(--bw-success)]'
                      : 'text-[var(--bw-danger)]'
                  }
                `}
              >
                {formatCurrency(
                  todaySpent,
                )}
              </p>

              <p
                className={`
                  mt-1.5
                  text-xs
                  ${
                    todaySpent === 0
                      ? 'text-[var(--bw-muted)]'
                      : todaySpent <=
                          dailyBudget
                        ? 'text-[var(--bw-success)]'
                        : 'text-[var(--bw-danger)]'
                  }
                `}
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

          <div
            className="
              mt-4
              flex
              justify-between
              gap-3
              text-xs
            "
          >

            <span className="text-[var(--bw-muted)]">
              {todayDifference >= 0
                ? 'Remaining today'
                : 'Over today by'}
            </span>

            <span
              className={
                todayDifference >= 0
                  ? 'font-semibold text-[var(--bw-success)]'
                  : 'font-semibold text-[var(--bw-danger)]'
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

        <div
          className="
            budgetwise-card
            rounded-[24px]
            p-6
            sm:p-7
          "
        >

          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--bw-muted)]
            "
          >
            Monthly usage
          </p>

          <div
            className="
              mt-4
              flex
              items-end
              justify-between
              gap-4
            "
          >

            <p
              className="
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.04em]
                text-[var(--bw-heading)]
              "
            >
              {budgetUsed.toFixed(
                1,
              )}
              <span className="text-lg text-[var(--bw-muted)]">
                %
              </span>
            </p>

            <p
              className="
                text-right
                text-xs
                text-[var(--bw-muted)]
              "
            >
              {daysRemaining}{' '}
              days remaining
            </p>

          </div>

          <div className="mt-6">

            <ProgressBar
              value={safeBudgetUsed}
            />

          </div>

          <div
            className="
              mt-5
              border-t
              border-[var(--bw-border)]
              pt-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                text-xs
              "
            >

              <span className="text-[var(--bw-muted)]">
                Remaining budget
              </span>

              <span
                className={
                  monthlyBudget -
                    totalSpent >=
                  0
                    ? 'font-semibold text-[var(--bw-text)]'
                    : 'font-semibold text-[var(--bw-danger)]'
                }
              >
                {formatCurrency(
                  monthlyBudget -
                    totalSpent,
                )}
              </span>

            </div>

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                text-xs
              "
            >

              <span className="text-[var(--bw-muted)]">
                Daily allowance
              </span>

              <span className="font-semibold text-[var(--bw-text)]">
                {formatCurrency(
                  dailyBudget,
                )}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          GOALS
      ====================================================== */}

      <section className="mt-10">

        <SectionHeader
          title="Savings goals"
          description="Track the money you're putting aside for your future."
          action="View goals"
        />

        <div className="mt-5">

          {goals.length === 0 ? (

            <div
              className="
                budgetwise-card
                rounded-[24px]
                border-dashed
                px-6
                py-10
              "
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
                  text-xl
                "
              >
                🎯
              </div>

              <p
                className="
                  mt-4
                  font-serif
                  text-lg
                  font-semibold
                  text-[var(--bw-heading)]
                "
              >
                No savings goals yet.
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--bw-body)]
                "
              >
                Create a goal to start
                tracking your progress.
              </p>

            </div>

          ) : (

            <div
              className="
                budgetwise-card
                rounded-[24px]
                p-6
                sm:p-7
              "
            >

              <div className="grid gap-6 md:grid-cols-3">

                <GoalMetric
                  label="Total saved"
                  value={`+${formatCurrency(
                    totalGoalSaved,
                  )}`}
                  className="text-[var(--bw-success)]"
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
                  className="text-[var(--bw-accent)]"
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

                <div
                  className="
                    mt-6
                    border-t
                    border-[var(--bw-border)]
                    pt-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      justify-between
                      gap-5
                      sm:flex-row
                      sm:items-end
                    "
                  >

                    <div>

                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                          text-[var(--bw-accent)]
                        "
                      >
                        Next goal
                      </p>

                      <h3
                        className="
                          mt-2
                          font-serif
                          text-lg
                          font-semibold
                          tracking-tight
                          text-[var(--bw-heading)]
                        "
                      >
                        {
                          featuredGoal.name
                        }
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-[var(--bw-body)]
                        "
                      >
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

                      <p
                        className="
                          font-serif
                          text-2xl
                          font-semibold
                          tracking-tight
                          text-[var(--bw-accent)]
                        "
                      >
                        {getProgressPercentage(
                          featuredGoal,
                        ).toFixed(1)}
                        %
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-[var(--bw-muted)]
                        "
                      >
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
                    <p
                      className="
                        mt-3
                        text-xs
                        text-[var(--bw-muted)]
                      "
                    >
                      Target date:{' '}
                      {formatDate(
                        featuredGoal.targetDate,
                      )}
                    </p>
                  )}

                </div>

              )}

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  gap-x-6
                  gap-y-2
                  border-t
                  border-[var(--bw-border)]
                  pt-4
                  text-xs
                "
              >

                <span className="text-[var(--bw-muted)]">
                  {activeGoals.length}{' '}
                  active goal
                  {activeGoals.length ===
                  1
                    ? ''
                    : 's'}
                </span>

                {completedGoals.length >
                  0 && (
                  <span className="text-[var(--bw-success)]">
                    {completedGoals.length}{' '}
                    completed
                  </span>
                )}

              </div>

            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          AVAILABLE MONEY
      ====================================================== */}

      <section className="mt-10">

        <div
          className="
            rounded-[24px]
            border
            border-[var(--bw-success)]
            bg-[var(--bw-success-soft)]
            p-6
            sm:flex
            sm:items-center
            sm:justify-between
            sm:p-7
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[var(--bw-body)]
              "
            >
              Current available money
            </p>

            <p
              className={`
                mt-3
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.04em]
                ${
                  availableMoney >= 0
                    ? 'text-[var(--bw-success)]'
                    : 'text-[var(--bw-danger)]'
                }
              `}
            >
              {formatCurrency(
                availableMoney,
              )}
            </p>

            <p
              className="
                mt-2
                text-sm
                text-[var(--bw-body)]
              "
            >
              Monthly budget + credits -
              expenses
            </p>

          </div>

          <div
            className="
              mt-5
              w-full
              max-w-xs
              border-t
              border-[var(--bw-border)]
              pt-4
              sm:mt-0
              sm:border-l
              sm:border-t-0
              sm:pl-6
              sm:pt-0
            "
          >

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
              valueClass="text-[var(--bw-success)]"
            />

            <MoneyRow
              label="Expenses"
              value={`-${formatCurrency(
                totalSpent,
              )}`}
              valueClass="text-[var(--bw-danger)]"
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          SPENDING TREND
      ====================================================== */}

      <section className="mt-10">

        <SpendingChart
          data={
            spendingChartData
          }
        />

      </section>


      {/* ======================================================
          CATEGORY BREAKDOWN
      ====================================================== */}

      <section className="mt-10">

        <SectionHeader
          title="Spending by category"
          description="Where your money is going this month."
        />

        {categoryTotals.length === 0 ? (

          <div
            className="
              budgetwise-card
              mt-5
              rounded-[24px]
              border-dashed
              p-8
              text-center
            "
          >

            <div className="text-2xl">
              🧾
            </div>

            <p
              className="
                mt-3
                text-sm
                text-[var(--bw-body)]
              "
            >
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
                  className="
                    budgetwise-card
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    px-5
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--bw-accent-soft)]
                      text-xs
                      font-semibold
                      text-[var(--bw-accent-text)]
                    "
                  >
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-[var(--bw-text)]
                      "
                    >
                      {
                        category.name
                      }
                    </p>

                    <div
                      className="
                        mt-2
                        h-1
                        overflow-hidden
                        rounded-full
                        bg-[var(--bw-border)]
                      "
                    >

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-[var(--bw-accent)]
                        "
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

                  <span
                    className="
                      shrink-0
                      font-serif
                      text-sm
                      font-semibold
                      text-[var(--bw-text-strong)]
                    "
                  >
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


      {/* ======================================================
          RECENT TRANSACTIONS
      ====================================================== */}

      <section className="mt-10 pb-10">

        <SectionHeader
          title="Recent transactions"
          description="Your latest spending and incoming money."
          action="View all"
        />

        <div
          className="
            budgetwise-card
            mt-5
            overflow-hidden
            rounded-[24px]
          "
        >

          {recentExpenses.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="text-2xl">
                🧾
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  text-[var(--bw-body)]
                "
              >
                No transactions yet.
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--bw-muted)]
                "
              >
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
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      gap-4
                      border-b
                      border-[var(--bw-border)]
                      px-5
                      py-4
                      transition-colors
                      last:border-b-0
                      hover:bg-[var(--bw-surface-hover)]
                      sm:px-6
                    "
                  >

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            isCredit
                              ? 'bg-[var(--bw-success-soft)] text-[var(--bw-success)]'
                              : 'bg-[var(--bw-accent-soft)] text-[var(--bw-accent)]'
                          }
                        `}
                      >

                        {isCredit ? (
                          <ArrowDownIcon />
                        ) : (
                          <ArrowUpIcon />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-[var(--bw-text)]
                          "
                        >
                          {
                            expense.name
                          }
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-[var(--bw-muted)]
                          "
                        >
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
                      className={`
                        shrink-0
                        font-serif
                        text-sm
                        font-semibold
                        ${
                          isCredit
                            ? 'text-[var(--bw-success)]'
                            : 'text-[var(--bw-danger)]'
                        }
                      `}
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


/* ============================================================
   DASHBOARD STAT
============================================================ */

function DashboardStat({
  label,
  value,
  detail,
  icon,
  positive = false,
  accent = false,
}) {
  return (
    <div
      className="
        budgetwise-card
        rounded-[22px]
        p-5
        sm:p-6
      "
    >

      <div className="flex items-center justify-between gap-3">

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[var(--bw-accent-soft)]
            text-lg
          "
        >
          {icon}
        </div>

        {(positive || accent) && (
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[var(--bw-accent)]
            "
          />
        )}

      </div>

      <p
        className="
          mt-5
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[var(--bw-muted)]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          truncate
          font-serif
          text-2xl
          font-semibold
          tracking-[-0.025em]
          ${
            positive
              ? 'text-[var(--bw-success)]'
              : 'text-[var(--bw-heading)]'
          }
        `}
      >
        {value}
      </p>

      <p
        className="
          mt-1.5
          text-xs
          text-[var(--bw-muted)]
        "
      >
        {detail}
      </p>

    </div>
  )
}


/* ============================================================
   GOAL METRIC
============================================================ */

function GoalMetric({
  label,
  value,
  className = 'text-[var(--bw-heading)]',
}) {
  return (
    <div>

      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[var(--bw-muted)]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          font-serif
          text-xl
          font-semibold
          tracking-tight
          ${className}
        `}
      >
        {value}
      </p>

    </div>
  )
}


/* ============================================================
   MONEY ROW
============================================================ */

function MoneyRow({
  label,
  value,
  valueClass = 'text-[var(--bw-text)]',
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-5
        text-xs
      "
    >

      <span className="text-[var(--bw-muted)]">
        {label}
      </span>

      <span
        className={`font-semibold ${valueClass}`}
      >
        {value}
      </span>

    </div>
  )
}


/* ============================================================
   ICONS
============================================================ */

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