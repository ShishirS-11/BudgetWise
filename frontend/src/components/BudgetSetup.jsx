import { useState } from 'react'

const presetPeriods = [7, 15, 30, 60, 90]

function BudgetSetup({ onSave }) {
  const [amount, setAmount] = useState('30000')
  const [period, setPeriod] = useState(30)
  const [customDays, setCustomDays] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const numberOfDays =
      period === 'custom'
        ? Number(customDays)
        : Number(period)

    const budgetAmount = Number(amount)

    if (
      budgetAmount <= 0 ||
      numberOfDays <= 0
    ) {
      return
    }

    const startDate = new Date()

    const endDate = new Date(startDate)

    endDate.setDate(
      endDate.getDate() + numberOfDays - 1,
    )

    onSave({
      amount: budgetAmount,
      days: numberOfDays,
      startDate: startDate
        .toISOString()
        .split('T')[0],
      endDate: endDate
        .toISOString()
        .split('T')[0],
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-[#111417] p-6"
    >
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Create a budget
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Choose how long this budget should last.
        </p>
      </div>

      {/* Amount */}
      <div className="mt-6">
        <label
          htmlFor="budgetAmount"
          className="mb-2 block text-sm text-zinc-400"
        >
          Budget amount
        </label>

        <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">
          <span className="text-zinc-500">
            ₹
          </span>

          <input
            id="budgetAmount"
            type="number"
            min="1"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none"
          />
        </div>
      </div>

      {/* Preset periods */}
      <div className="mt-6">
        <p className="mb-3 text-sm text-zinc-400">
          Budget period
        </p>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {presetPeriods.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days)}
              className={`rounded-xl border px-3 py-3 text-sm transition ${
                period === days
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                  : 'border-white/5 bg-[#0d0f11] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Custom period */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setPeriod('custom')}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-left transition ${
            period === 'custom'
              ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
              : 'border-white/5 bg-[#0d0f11] text-zinc-500 hover:border-white/10'
          }`}
        >
          Custom number of days
        </button>

        {period === 'custom' && (
          <input
            type="number"
            min="1"
            value={customDays}
            onChange={(event) =>
              setCustomDays(event.target.value)
            }
            placeholder="Enter number of days"
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
          />
        )}
      </div>

      <button
        type="submit"
        className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
      >
        Create budget
      </button>
    </form>
  )
}

export default BudgetSetup