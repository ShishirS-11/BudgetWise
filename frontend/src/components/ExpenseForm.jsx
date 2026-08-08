import { useState } from 'react'

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
]

function ExpenseForm({ onAddExpense }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  )

  function handleSubmit(event) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      return
    }

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      category,
      description: description.trim() || category,
      date,
    }

    onAddExpense(newExpense)

    setAmount('')
    setCategory('Food')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-[#111417] p-6"
    >
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Add expense
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Record what you spent today.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm text-zinc-400"
          >
            Amount
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">
            <span className="text-zinc-500">
              ₹
            </span>

            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm text-zinc-400"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm text-zinc-400"
          >
            Description
          </label>

          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Lunch with friends"
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
          />
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-sm text-zinc-400"
          >
            Date
          </label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
      >
        Add expense
      </button>
    </form>
  )
}

export default ExpenseForm