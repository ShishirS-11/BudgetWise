import { useState } from 'react'

function GoalPlanner({ onCreateGoal }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialSavings, setInitialSavings] = useState('0')
  const [targetDate, setTargetDate] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const target = Number(targetAmount)
    const saved = Number(initialSavings)

    if (
      !name.trim() ||
      target <= 0 ||
      saved < 0 ||
      saved > target
    ) {
      return
    }

    const goal = {
      id: Date.now(),
      name: name.trim(),
      targetAmount: target,
      initialSavings: saved,
      targetDate,
      contributions: [],
    }

    onCreateGoal(goal)

    setName('')
    setTargetAmount('')
    setInitialSavings('0')
    setTargetDate('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-[#111417] p-6"
    >
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Create a goal
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Set something you want to save toward.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Goal name */}
        <div>
          <label
            htmlFor="goalName"
            className="mb-2 block text-sm text-zinc-400"
          >
            What are you saving for?
          </label>

          <input
            id="goalName"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. New laptop"
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
          />
        </div>

        {/* Target amount */}
        <div>
          <label
            htmlFor="targetAmount"
            className="mb-2 block text-sm text-zinc-400"
          >
            Target amount
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">
            <span className="text-zinc-500">
              ₹
            </span>

            <input
              id="targetAmount"
              type="number"
              min="1"
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(event.target.value)
              }
              placeholder="70000"
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Initial savings */}
        <div>
          <label
            htmlFor="initialSavings"
            className="mb-2 block text-sm text-zinc-400"
          >
            Already saved
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">
            <span className="text-zinc-500">
              ₹
            </span>

            <input
              id="initialSavings"
              type="number"
              min="0"
              value={initialSavings}
              onChange={(event) =>
                setInitialSavings(event.target.value)
              }
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none"
            />
          </div>
        </div>

        {/* Target date */}
        <div>
          <label
            htmlFor="targetDate"
            className="mb-2 block text-sm text-zinc-400"
          >
            Target date
            <span className="ml-2 text-xs text-zinc-600">
              optional
            </span>
          </label>

          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(event) =>
              setTargetDate(event.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
      >
        Create goal
      </button>
    </form>
  )
}

export default GoalPlanner