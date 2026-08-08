import { useState } from 'react'

function GoalContributionForm({ goal, onAddContribution }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  )

  function handleSubmit(event) {
    event.preventDefault()

    const contributionAmount = Number(amount)

    if (contributionAmount <= 0) {
      return
    }

    onAddContribution(goal.id, {
      id: Date.now(),
      amount: contributionAmount,
      date,
    })

    setAmount('')
    setDate(
      new Date().toISOString().split('T')[0],
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-xl border border-white/5 bg-[#0d0f11] p-4"
    >
      <p className="text-sm font-medium text-zinc-300">
        Add contribution
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center rounded-xl border border-white/10 bg-[#111417] px-4 focus-within:border-violet-500/50">
          <span className="text-zinc-500">
            ₹
          </span>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="Amount"
            className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
          />
        </div>

        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
          className="rounded-xl border border-white/10 bg-[#111417] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
        />
      </div>

      <button
        type="submit"
        className="mt-3 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400"
      >
        Add contribution
      </button>
    </form>
  )
}

export default GoalContributionForm