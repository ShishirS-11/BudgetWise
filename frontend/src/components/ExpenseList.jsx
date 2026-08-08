function ExpenseList({ expenses, onDeleteExpense }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111417]">
      {expenses.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-zinc-400">
            No expenses yet.
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Add your first expense above.
          </p>
        </div>
      ) : (
        expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-200">
                {expense.description}
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {expense.category} · {expense.date}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <p className="text-sm font-medium text-zinc-200">
                ₹{expense.amount.toLocaleString('en-IN')}
              </p>

              <button
                type="button"
                onClick={() => onDeleteExpense(expense.id)}
                className="text-xs text-zinc-600 transition hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ExpenseList