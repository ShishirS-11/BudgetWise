import { useEffect, useMemo, useState } from 'react'

import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getExpenses } from '../services/expenseService'
import { getBudget } from '../services/budgetService'

import {
  getCategoryTotals,
  getTopCategory,
  getHighestSpendingDay,
  getDailyTotals,
  getPeriodExpenses,
  getPreviousMonthRange,
  getSpendingChange,
} from '../utils/reportCalculations'

import { generateMonthlyReport } from '../utils/pdfReport'

import { useCurrency } from '../context/CurrencyContext'

const CHART_COLORS = [
  '#f59e0b',
  '#fbbf24',
  '#fcd34d',
  '#d97706',
  '#b45309',
  '#92400e',
  '#fde68a',
]

function Reports() {
  const {
    formatCurrency,
    currency,
    currencyInfo,
    currentRate,
  } = useCurrency()

  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(null)

  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] =
    useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth())

  useEffect(() => {
    loadReportData()
  }, [selectedMonth])

  async function loadReportData() {
    try {
      setLoading(true)
      setError('')

      const monthStart =
        `${selectedMonth}-01`

      const [
        expenseData,
        budgetData,
      ] = await Promise.all([
        getExpenses(),
        getBudget(monthStart),
      ])

      setExpenses(
        Array.isArray(expenseData)
          ? expenseData
          : [],
      )

      setBudget(
        budgetData || null,
      )
    } catch (err) {
      console.error(
        'Failed to load report:',
        err,
      )

      setError(
        err?.message ||
          'Unable to load your report.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * =========================================
   * CURRENT MONTH RANGE
   * =========================================
   */

  const currentRange = useMemo(() => {
    const [
      year,
      month,
    ] = selectedMonth
      .split('-')
      .map(Number)

    const lastDay =
      new Date(
        year,
        month,
        0,
      ).getDate()

    return {
      start:
        `${selectedMonth}-01`,

      end:
        `${selectedMonth}-${String(
          lastDay,
        ).padStart(2, '0')}`,
    }
  }, [selectedMonth])

  const currentExpenses =
    useMemo(() => {
      return getPeriodExpenses(
        expenses,
        currentRange.start,
        currentRange.end,
      )
    }, [
      expenses,
      currentRange,
    ])

  /*
   * =========================================
   * EXPENSE / CREDIT
   * =========================================
   */

  const spendingExpenses =
    useMemo(() => {
      return currentExpenses.filter(
        (expense) =>
          expense.transactionType !==
          'credit',
      )
    }, [currentExpenses])

  const creditTransactions =
    useMemo(() => {
      return currentExpenses.filter(
        (expense) =>
          expense.transactionType ===
          'credit',
      )
    }, [currentExpenses])

  /*
   * =========================================
   * TOTALS
   * =========================================
   */

  const totalSpent =
    useMemo(() => {
      return spendingExpenses.reduce(
        (total, expense) =>
          total +
          Number(
            expense.amount || 0,
          ),
        0,
      )
    }, [spendingExpenses])

  const totalCredits =
    useMemo(() => {
      return creditTransactions.reduce(
        (total, expense) =>
          total +
          Number(
            expense.amount || 0,
          ),
        0,
      )
    }, [creditTransactions])

  /*
   * Budget remains stored in INR/base
   * currency.
   */

  const monthlyBudget =
    Number(
      budget?.amount || 0,
    )

  const daysInMonth =
    useMemo(() => {
      const [
        year,
        month,
      ] = selectedMonth
        .split('-')
        .map(Number)

      return new Date(
        year,
        month,
        0,
      ).getDate()
    }, [selectedMonth])

  const averageDailySpending =
    daysInMonth > 0
      ? totalSpent /
        daysInMonth
      : 0

  const budgetUsed =
    monthlyBudget > 0
      ? (totalSpent /
          monthlyBudget) *
        100
      : 0

  const budgetRemaining =
    Math.max(
      monthlyBudget -
        totalSpent,
      0,
    )

  /*
   * =========================================
   * CATEGORIES
   * =========================================
   */

  const categoryTotals =
    useMemo(() => {
      return getCategoryTotals(
        spendingExpenses,
      )
    }, [spendingExpenses])

  const topCategory =
    useMemo(() => {
      return getTopCategory(
        spendingExpenses,
      )
    }, [spendingExpenses])

  /*
   * =========================================
   * DAILY DATA
   * =========================================
   */

  const dailyTotals =
    useMemo(() => {
      return getDailyTotals(
        spendingExpenses,
      )
    }, [spendingExpenses])

  const highestSpendingDay =
    useMemo(() => {
      return getHighestSpendingDay(
        spendingExpenses,
      )
    }, [spendingExpenses])

  /*
   * =========================================
   * PREVIOUS MONTH
   * =========================================
   */

  const previousMonthRange =
    useMemo(() => {
      const date =
        new Date(
          `${selectedMonth}-01T00:00:00`,
        )

      return getPreviousMonthRange(
        date,
      )
    }, [selectedMonth])

  const previousMonthExpenses =
    useMemo(() => {
      return getPeriodExpenses(
        expenses,
        previousMonthRange.start,
        previousMonthRange.end,
      ).filter(
        (expense) =>
          expense.transactionType !==
          'credit',
      )
    }, [
      expenses,
      previousMonthRange,
    ])

  const previousMonthSpent =
    useMemo(() => {
      return previousMonthExpenses.reduce(
        (total, expense) =>
          total +
          Number(
            expense.amount || 0,
          ),
        0,
      )
    }, [previousMonthExpenses])

  const spendingChange =
    getSpendingChange(
      totalSpent,
      previousMonthSpent,
    )

  /*
   * =========================================
   * CHART DATA
   * =========================================
   */

  const categoryChartData =
    useMemo(() => {
      return categoryTotals
        .slice(0, 7)
        .map((item) => ({
          name:
            item.category,
          value:
            Number(
              item.amount || 0,
            ),
        }))
    }, [categoryTotals])

  const dailyChartData =
    useMemo(() => {
      return dailyTotals.map(
        (item) => ({
          date:
            formatShortDate(
              item.date,
            ),

          amount:
            Number(
              item.amount || 0,
            ),
        }),
      )
    }, [dailyTotals])

  /*
   * =========================================
   * INSIGHTS
   * =========================================
   */

  const insights =
    useMemo(() => {
      const result = []

      if (totalSpent === 0) {
        result.push(
          'There is not enough spending data for this month yet. Keep recording your transactions to build a useful spending history.',
        )
      }

      if (monthlyBudget > 0) {
        if (
          totalSpent >
          monthlyBudget
        ) {
          result.push(
            `You have exceeded your monthly budget by ${formatCurrency(
              totalSpent -
                monthlyBudget,
            )}.`,
          )
        } else if (
          budgetUsed >= 80
        ) {
          result.push(
            `You have used ${budgetUsed.toFixed(
              0,
            )}% of your monthly budget. Consider keeping discretionary spending lower for the rest of the month.`,
          )
        } else {
          result.push(
            `Your spending is currently ${budgetUsed.toFixed(
              0,
            )}% of your monthly budget, leaving ${formatCurrency(
              budgetRemaining,
            )} available.`,
          )
        }
      }

      if (topCategory) {
        result.push(
          `${topCategory.category} is currently your largest spending category at ${formatCurrency(
            topCategory.amount,
          )}.`,
        )
      }

      if (
        highestSpendingDay
      ) {
        result.push(
          `Your highest spending day was ${formatFullDate(
            highestSpendingDay.date,
          )}, when you spent ${formatCurrency(
            highestSpendingDay.amount,
          )}.`,
        )
      }

      if (
        spendingChange !==
          null &&
        spendingChange !==
          undefined
      ) {
        if (
          spendingChange > 0
        ) {
          result.push(
            `Your spending is ${Math.abs(
              spendingChange,
            ).toFixed(
              1,
            )}% higher than the previous month.`,
          )
        } else if (
          spendingChange < 0
        ) {
          result.push(
            `Your spending is ${Math.abs(
              spendingChange,
            ).toFixed(
              1,
            )}% lower than the previous month.`,
          )
        } else {
          result.push(
            'Your spending is almost unchanged compared with the previous month.',
          )
        }
      }

      return result.slice(0, 5)
    }, [
      totalSpent,
      monthlyBudget,
      budgetUsed,
      budgetRemaining,
      topCategory,
      highestSpendingDay,
      spendingChange,
      formatCurrency,
    ])

  /*
   * =========================================
   * DOWNLOAD PDF
   * =========================================
   */

  async function handleDownloadPDF() {
    try {
      setDownloading(true)
      setMessage('')
      setError('')

      /*
       * INR is the base currency.
       *
       * Every amount in the database is
       * stored in INR.
       *
       * currentRate converts:
       *
       * INR -> selected currency
       */

      const rate =
        currency === 'INR'
          ? 1
          : Number(currentRate)

      if (
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        throw new Error(
          'Exchange rate is not available yet. Please wait a moment and try again.',
        )
      }

      const monthLabel =
        formatMonth(
          selectedMonth,
        )

      generateMonthlyReport({
        monthLabel,

        totalSpent,

        totalCredits,

        monthlyBudget,

        averageDailySpending,

        topCategory,

        highestSpendingDay,

        spendingChange,

        categoryTotals,

        dailyExpenses:
          dailyTotals,

        insights,

        /*
         * Currency information
         */

        currency,

        currencySymbol:
          currencyInfo?.symbol ||
          currency,

        /*
         * IMPORTANT:
         * PDF uses this to convert
         * all INR amounts.
         */

        exchangeRate: rate,
      })

      setMessage(
        `Your ${currency} PDF report has been downloaded successfully.`,
      )

      setTimeout(() => {
        setMessage('')
      }, 3500)
    } catch (err) {
      console.error(
        'PDF generation failed:',
        err,
      )

      setError(
        err?.message ||
          'Unable to generate the PDF report. Please try again.',
      )
    } finally {
      setDownloading(false)
    }
  }

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-10 text-center">
          <p className="text-sm text-[var(--bw-text-muted)]">
            Preparing your financial report...
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}

      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400">
              Financial overview
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--bw-text-strong)]">
              Reports
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--bw-text-muted)]">
              Understand where your money went,
              how your spending compares, and
              how closely you are following your
              budget.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleDownloadPDF
            }
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-amber-500/10 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading
              ? 'Preparing PDF...'
              : 'Download PDF'}
          </button>

        </div>
      </section>

      {/* Error */}

      {error && (
        <section className="mt-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadReportData
              }
              className="shrink-0 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
            >
              Try again
            </button>

          </div>
        </section>
      )}

      {/* Success */}

      {message && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-emerald-500/20 bg-[var(--bw-surface)] px-5 py-4 shadow-2xl shadow-black/30">
          <p className="text-sm text-emerald-300">
            {message}
          </p>
        </div>
      )}

      {/* Report period */}

      <section className="mt-8">

        <div className="flex flex-col gap-5 rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-5 sm:p-6 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--bw-text-faint)]">
              Report period
            </p>

            <h2 className="mt-1 text-lg font-medium text-[var(--bw-text-secondary)]">
              {formatMonth(
                selectedMonth,
              )}
            </h2>

            <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
              All figures are based on
              transactions recorded during this
              month.
            </p>
          </div>

          <div>
            <label
              htmlFor="reportMonth"
              className="mb-2 block text-xs text-[var(--bw-text-muted)]"
            >
              Select month
            </label>

            <input
              id="reportMonth"
              type="month"
              value={
                selectedMonth
              }
              onChange={(event) =>
                setSelectedMonth(
                  event.target.value,
                )
              }
              className="rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] px-4 py-3 text-sm text-[var(--bw-text-secondary)] outline-none transition focus:border-amber-500/50"
            />
          </div>

        </div>

      </section>

      {/* Summary */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <ReportCard
          label="Total spent"
          value={formatCurrency(
            totalSpent,
          )}
          description={`${spendingExpenses.length} spending transactions`}
          tone="red"
        />

        <ReportCard
          label="Money received"
          value={formatCurrency(
            totalCredits,
          )}
          description={`${creditTransactions.length} credit transactions`}
          tone="green"
        />

        <ReportCard
          label="Monthly budget"
          value={
            monthlyBudget > 0
              ? formatCurrency(
                  monthlyBudget,
                )
              : 'Not set'
          }
          description={
            monthlyBudget > 0
              ? `${budgetUsed.toFixed(
                  0,
                )}% currently used`
              : 'Create a budget to track progress'
          }
          tone="violet"
        />

        <ReportCard
          label="Daily average"
          value={formatCurrency(
            averageDailySpending,
          )}
          description="Average spending across the month"
          tone="neutral"
        />

      </section>

      {/* Budget progress */}

      <section className="mt-6">

        <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
                Budget progress
              </p>

              <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
                {monthlyBudget > 0
                  ? `${formatCurrency(
                      totalSpent,
                    )} spent from ${formatCurrency(
                      monthlyBudget,
                    )}`
                  : 'No monthly budget has been set.'}
              </p>
            </div>

            {monthlyBudget > 0 && (
              <p
                className={`text-sm font-medium ${
                  budgetUsed >= 100
                    ? 'text-red-400'
                    : budgetUsed >= 80
                      ? 'text-amber-400'
                      : 'text-amber-300'
                }`}
              >
                {budgetUsed.toFixed(
                  1,
                )}
                %
              </p>
            )}

          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--bw-surface-alt)]">

            <div
              className={`h-full rounded-full transition-all ${
                budgetUsed >= 100
                  ? 'bg-red-500'
                  : budgetUsed >= 80
                    ? 'bg-amber-500'
                    : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(
                  Math.max(
                    budgetUsed,
                    0,
                  ),
                  100,
                )}%`,
              }}
            />

          </div>

          <div className="mt-3 flex justify-between text-xs text-[var(--bw-text-faint)]">

            <span>
              {monthlyBudget > 0
                ? `${formatCurrency(
                    budgetRemaining,
                  )} remaining`
                : 'Budget unavailable'}
            </span>

            <span>
              {daysInMonth} days
            </span>

          </div>

        </div>

      </section>

      {/* Charts */}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">

        {/* Daily spending */}

        <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div>
            <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
              Daily spending
            </p>

            <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
              Spending activity across{' '}
              {formatMonth(
                selectedMonth,
              )}
              .
            </p>
          </div>

          <div className="mt-6 h-72">

            {dailyChartData.length ===
            0 ? (
              <EmptyChart text="No spending recorded this month." />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    dailyChartData
                  }
                  margin={{
                    top: 8,
                    right: 8,
                    left: -18,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: '#71717a',
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    tick={{
                      fill: '#71717a',
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  {/* IMPORTANT:
                      cursor={false} removes
                      the white/gray hover area.
                  */}

                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background:
                        '#171a1e',
                      border:
                        '1px solid rgba(255,255,255,0.08)',
                      borderRadius:
                        '14px',
                      color:
                        '#e4e4e7',
                      boxShadow:
                        '0 12px 30px rgba(0,0,0,0.35)',
                    }}
                    labelStyle={{
                      color:
                        '#f4f4f5',
                      fontWeight: 500,
                      marginBottom:
                        '4px',
                    }}
                    itemStyle={{
                      color:
                        '#fbbf24',
                    }}
                    formatter={(
                      value,
                    ) => [
                      formatCurrency(
                        value,
                      ),
                      'Spent',
                    ]}
                  />

                  <Bar
                    dataKey="amount"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                    fill="#f59e0b"
                  />

                </BarChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* Category chart */}

        <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div>
            <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
              Spending by category
            </p>

            <p className="mt-1 text-xs text-[var(--bw-text-faint)]">
              Your largest spending areas.
            </p>
          </div>

          <div className="mt-5 flex h-72 items-center justify-center">

            {categoryChartData.length ===
            0 ? (
              <EmptyChart text="No category data yet." />
            ) : (
              <div className="grid h-full w-full grid-cols-2 items-center gap-4">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={
                        categoryChartData
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={3}
                    >
                      {categoryChartData.map(
                        (
                          entry,
                          index,
                        ) => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background:
                          '#171a1e',
                        border:
                          '1px solid rgba(255,255,255,0.08)',
                        borderRadius:
                          '14px',
                        color:
                          '#e4e4e7',
                        boxShadow:
                          '0 12px 30px rgba(0,0,0,0.35)',
                      }}
                      labelStyle={{
                        color:
                          '#f4f4f5',
                        fontWeight: 500,
                        marginBottom:
                          '4px',
                      }}
                      itemStyle={{
                        color:
                          '#fbbf24',
                      }}
                      formatter={(
                        value,
                      ) =>
                        formatCurrency(
                          value,
                        )
                      }
                    />

                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">

                  {categoryChartData.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={
                          item.name
                        }
                        className="flex items-center justify-between gap-3"
                      >

                        <div className="flex min-w-0 items-center gap-2">

                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ],
                            }}
                          />

                          <span className="truncate text-xs text-[var(--bw-text-muted)]">
                            {
                              item.name
                            }
                          </span>

                        </div>

                        <span className="shrink-0 text-xs font-medium text-[var(--bw-text-secondary)]">
                          {formatCurrency(
                            item.value,
                          )}
                        </span>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* Analysis */}

      <section className="mt-6 grid gap-6 lg:grid-cols-3">

        <AnalysisCard
          label="Top category"
          value={
            topCategory
              ? topCategory.category
              : 'No data'
          }
          description={
            topCategory
              ? formatCurrency(
                  topCategory.amount,
                )
              : 'Record some expenses first.'
          }
        />

        <AnalysisCard
          label="Highest spending day"
          value={
            highestSpendingDay
              ? formatFullDate(
                  highestSpendingDay.date,
                )
              : 'No data'
          }
          description={
            highestSpendingDay
              ? formatCurrency(
                  highestSpendingDay.amount,
                )
              : 'No daily spending recorded.'
          }
        />

        <AnalysisCard
          label="Compared with previous month"
          value={
            spendingChange ===
                null ||
            spendingChange ===
              undefined
              ? 'No comparison'
              : `${
                  spendingChange >
                  0
                    ? '+'
                    : ''
                }${spendingChange.toFixed(
                  1,
                )}%`
          }
          description={
            spendingChange ===
                null ||
            spendingChange ===
              undefined
              ? 'Not enough previous-month data.'
              : spendingChange >
                0
                ? 'Spending increased.'
                : spendingChange <
                    0
                  ? 'Spending decreased.'
                  : 'Spending stayed similar.'
          }
          positive={
            spendingChange !==
              null &&
            spendingChange <
              0
          }
        />

      </section>

      {/* Insights */}

      <section className="mt-6 pb-12">

        <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

          <div>
            <p className="text-sm font-medium text-[var(--bw-text-secondary)]">
              Financial insights
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--bw-text-faint)]">
              A few observations based on your
              activity this month.
            </p>
          </div>

          <div className="mt-5 space-y-3">

            {insights.length ===
            0 ? (
              <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] p-5">
                <p className="text-sm text-[var(--bw-text-muted)]">
                  Keep recording your transactions
                  and BudgetWise will have more
                  information to analyze.
                </p>
              </div>
            ) : (
              insights.map(
                (
                  insight,
                  index,
                ) => (
                  <div
                    key={index}
                    className="flex gap-4 rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)] p-5"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm text-amber-300">
                      {index +
                        1}
                    </div>

                    <p className="text-sm leading-6 text-[var(--bw-text-muted)]">
                      {insight}
                    </p>

                  </div>
                ),
              )
            )}

          </div>

        </div>

      </section>

    </div>
  )
}

/*
 * =========================================
 * REPORT CARD
 * =========================================
 */

function ReportCard({
  label,
  value,
  description,
  tone = 'neutral',
}) {
  const tones = {
    red: {
      border:
        'border-red-500/10',
      background:
        'bg-red-500/[0.025]',
      text:
        'text-red-300',
    },

    green: {
      border:
        'border-emerald-500/10',
      background:
        'bg-emerald-500/[0.025]',
      text:
        'text-emerald-300',
    },

    violet: {
      border:
        'border-amber-500/10',
      background:
        'bg-amber-500/[0.025]',
      text:
        'text-amber-300',
    },

    neutral: {
      border:
        'border-[var(--bw-border)]',
      background:
        'bg-[var(--bw-surface)]',
      text:
        'text-[var(--bw-text-secondary)]',
    },
  }

  const style =
    tones[tone] ||
    tones.neutral

  return (
    <div
      className={`rounded-3xl border ${style.border} ${style.background} p-5`}
    >
      <p className="text-xs text-[var(--bw-text-faint)]">
        {label}
      </p>

      <p
        className={`mt-3 text-xl font-semibold tracking-tight ${style.text}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--bw-text-faint)]">
        {description}
      </p>
    </div>
  )
}

/*
 * =========================================
 * ANALYSIS CARD
 * =========================================
 */

function AnalysisCard({
  label,
  value,
  description,
  positive = false,
}) {
  return (
    <div className="rounded-3xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">

      <p className="text-xs text-[var(--bw-text-faint)]">
        {label}
      </p>

      <p
        className={`mt-3 text-lg font-medium ${
          positive
            ? 'text-emerald-300'
            : 'text-[var(--bw-text-secondary)]'
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--bw-text-faint)]">
        {description}
      </p>

    </div>
  )
}

/*
 * =========================================
 * EMPTY CHART
 * =========================================
 */

function EmptyChart({
  text,
}) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface-alt)]">
      <p className="text-xs text-[var(--bw-text-faint)]">
        {text}
      </p>
    </div>
  )
}

/*
 * =========================================
 * HELPERS
 * =========================================
 */

function getCurrentMonth() {
  const date =
    new Date()

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}`
}

function formatMonth(
  month,
) {
  const date =
    new Date(
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

function formatShortDate(
  dateString,
) {
  if (!dateString) {
    return ''
  }

  const date =
    new Date(
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
    },
  )
}

function formatFullDate(
  dateString,
) {
  if (!dateString) {
    return 'Unknown date'
  }

  const date =
    new Date(
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
      month: 'long',
      year: 'numeric',
    },
  )
}

export default Reports