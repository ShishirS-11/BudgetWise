import { useState } from 'react'
import BudgetSetup from '../components/BudgetSetup'

function Budget() {
  const [budget, setBudget] = useState({
    amount: 30000,
    days: 30,
    startDate: '2026-08-01',
    endDate: '2026-08-30',
  })

  function handleSaveBudget(newBudget) {
    setBudget(newBudget)
  }

  const dailyBudget =
    budget.amount / budget.days

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section>
        <p className="text-sm text-zinc-500">
          Spending plan
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Budget
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Create a budget that fits your timeline.
        </p>
      </section>

      {/* Current budget */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <p className="text-sm text-zinc-500">
            Budget
          </p>

          <p className="mt-3 text-2xl font-semibold">
            ₹{budget.amount.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <p className="text-sm text-zinc-500">
            Period
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {budget.days} days
          </p>
        </div>

        <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
          <p className="text-sm text-zinc-500">
            Daily budget
          </p>

          <p className="mt-3 text-2xl font-semibold text-violet-300">
            ₹{Math.floor(dailyBudget).toLocaleString('en-IN')}
          </p>
        </div>
      </section>

      {/* Date range */}
      <section className="mt-6 rounded-2xl border border-white/5 bg-[#111417] p-6">
        <p className="text-sm text-zinc-500">
          Budget period
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-lg bg-white/[0.03] px-3 py-2 text-zinc-300">
            {budget.startDate}
          </span>

          <span className="text-zinc-700">
            →
          </span>

          <span className="rounded-lg bg-white/[0.03] px-3 py-2 text-zinc-300">
            {budget.endDate}
          </span>
        </div>
      </section>

      {/* Setup */}
      <section className="mt-8 pb-10">
        <BudgetSetup
          onSave={handleSaveBudget}
        />
      </section>
    </div>
  )
}

export default Budget