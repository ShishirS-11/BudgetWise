import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import SectionHeader from '../components/SectionHeader'
import SpendingChart from '../components/SpendingChart'
import { dashboardData } from '../data/dashboardData'

function Dashboard() {
  const {
    monthlyBudget,
    totalSpent,
    remaining,
    daysRemaining,
  } = dashboardData

  const budgetUsed =
    monthlyBudget > 0
      ? (totalSpent / monthlyBudget) * 100
      : 0

  const safeToSpend =
    daysRemaining > 0
      ? Math.floor(remaining / daysRemaining)
      : 0

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <section>
        <p className="text-sm text-zinc-500">
          August 2026
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Good afternoon, Shetty.
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Here's how your money is looking this month.
        </p>
      </section>

      {/* Main statistics */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Monthly budget"
          value={`₹${monthlyBudget.toLocaleString(
            'en-IN',
          )}`}
          description="Your spending limit for August"
        />

        <StatCard
          label="Spent"
          value={`₹${totalSpent.toLocaleString(
            'en-IN',
          )}`}
          description={`${budgetUsed.toFixed(
            1,
          )}% of your budget`}
        />

        <StatCard
          label="Remaining"
          value={`₹${remaining.toLocaleString(
            'en-IN',
          )}`}
          description={`${daysRemaining} days remaining`}
          accent
        />
      </section>

      {/* Monthly budget usage */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-[#111417] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Monthly budget usage
            </p>

            <p className="mt-2 text-xl font-semibold">
              {budgetUsed.toFixed(1)}%
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            ₹{remaining.toLocaleString('en-IN')} left
          </p>
        </div>

        <div className="mt-5">
          <ProgressBar value={budgetUsed} />
        </div>
      </section>

      {/* Safe to spend */}
      <section className="mt-6 rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
        <p className="text-sm text-zinc-500">
          Safe to spend today
        </p>

        <p className="mt-3 text-3xl font-semibold tracking-tight text-violet-300">
          ₹{safeToSpend.toLocaleString('en-IN')}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Based on your remaining budget and{' '}
          {daysRemaining} days left.
        </p>
      </section>

      {/* Spending trend */}
      <section className="mt-6">
        <SpendingChart />
      </section>

      {/* Spending by category */}
      <section className="mt-10">
        <SectionHeader
          title="Spending by category"
          description="Where your money is going this month."
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {dashboardData.categories.map(
            (category) => (
              <div
                key={category.name}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111417] px-5 py-4"
              >
                <span className="text-sm text-zinc-400">
                  {category.name}
                </span>

                <span className="text-sm font-medium text-zinc-200">
                  ₹
                  {category.amount.toLocaleString(
                    'en-IN',
                  )}
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Recent expenses */}
      <section className="mt-10 pb-10">
        <SectionHeader
          title="Recent expenses"
          description="Your latest spending activity."
          action="View all"
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/5 bg-[#111417]">
          {dashboardData.recentExpenses.map(
            (expense, index) => (
              <div
                key={`${expense.name}-${index}`}
                className="flex items-center justify-between border-b border-white/5 px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {expense.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {expense.category} · {expense.date}
                  </p>
                </div>

                <p className="text-sm font-medium text-zinc-200">
                  ₹
                  {expense.amount.toLocaleString(
                    'en-IN',
                  )}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard