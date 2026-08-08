import { useCurrency } from '../context/CurrencyContext'

function ExpenseList({
  expenses,
  onDeleteExpense,
  deletingId,
}) {
  const {
    formatCurrency,
  } = useCurrency()

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111417]">

      {expenses.length === 0 ? (
        <div className="px-5 py-12 text-center">

          <p className="text-sm text-zinc-400">
            No expenses yet.
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            Add your first expense above.
          </p>

        </div>
      ) : (
        expenses.map((expense) => {
          const isCredit =
            expense.transactionType ===
            'credit'

          const expenseName =
            expense.name ||
            expense.description ||
            expense.category ||
            'Expense'

          const amount =
            Number(
              expense.amount || 0,
            )

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-4 last:border-b-0"
            >

              {/* Transaction */}

              <div className="min-w-0">

                <p className="truncate text-sm font-medium text-zinc-200">
                  {expenseName}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  {expense.category ||
                    'Other'}
                  {' · '}
                  {expense.date}
                </p>

              </div>

              {/* Amount + Delete */}

              <div className="flex shrink-0 items-center gap-4">

                <p
                  className={`text-sm font-semibold ${
                    isCredit
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {isCredit
                    ? '+'
                    : '-'}
                  {formatCurrency(
                    amount,
                  )}
                </p>

                <button
                  type="button"
                  disabled={
                    deletingId ===
                    expense.id
                  }
                  onClick={() =>
                    onDeleteExpense(
                      expense.id,
                    )
                  }
                  className="rounded-lg px-2 py-1 text-xs text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingId ===
                  expense.id
                    ? 'Deleting...'
                    : 'Delete'}
                </button>

              </div>

            </div>
          )
        })
      )}

    </div>
  )
}

export default ExpenseList