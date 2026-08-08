import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import {
  addExpense,
  deleteExpense,
  getExpenses,
} from '../services/expenseService'

function Expenses() {
  const [expenses, setExpenses] = useState(
    getExpenses(),
  )

  function handleAddExpense(expense) {
    const newExpense = addExpense(expense)

    setExpenses((currentExpenses) => [
      newExpense,
      ...currentExpenses,
    ])
  }

  function handleDeleteExpense(id) {
    deleteExpense(id)

    setExpenses((currentExpenses) =>
      currentExpenses.filter(
        (expense) => expense.id !== id,
      ),
    )
  }

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    0,
  )

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section>
        <p className="text-sm text-zinc-500">
          Expense tracking
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Expenses
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Record and manage your daily spending.
        </p>
      </section>

      {/* Summary */}
      <section className="mt-8">
        <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
          <p className="text-sm text-zinc-500">
            Total recorded
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            {expenses.length} transactions
          </p>
        </div>
      </section>

      {/* Add expense */}
      <section className="mt-6">
        <ExpenseForm
          onAddExpense={handleAddExpense}
        />
      </section>

      {/* Expense list */}
      <section className="mt-10 pb-10">
        <div className="mb-5">
          <h2 className="text-lg font-medium tracking-tight">
            Your expenses
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your most recent transactions.
          </p>
        </div>

        <ExpenseList
          expenses={expenses}
          onDeleteExpense={handleDeleteExpense}
        />
      </section>
    </div>
  )
}

export default Expenses