import { useEffect, useState } from 'react'

import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'

import {
  addExpense,
  deleteExpense,
  getExpenses,
} from '../services/expenseService'

import { useCurrency } from '../context/CurrencyContext'

function Expenses() {
  const {
    formatCurrency,
    ratesLoading,
  } = useCurrency()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    try {
      setLoading(true)
      setError('')

      const data = await getExpenses()

      setExpenses(data || [])
    } catch (error) {
      console.error(
        'Failed to load expenses:',
        error,
      )

      setError(
        error?.message ||
          'Unable to load your expenses.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAddExpense(expense) {
    try {
      setSaving(true)
      setError('')

      const newExpense =
        await addExpense(expense)

      setExpenses((currentExpenses) => [
        newExpense,
        ...currentExpenses,
      ])
    } catch (error) {
      console.error(
        'Failed to add expense:',
        error,
      )

      setError(
        error?.message ||
          'Unable to save this expense.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteExpense(id) {
    try {
      setDeletingId(id)
      setError('')

      await deleteExpense(id)

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) =>
            expense.id !== id,
        ),
      )
    } catch (error) {
      console.error(
        'Failed to delete expense:',
        error,
      )

      setError(
        error?.message ||
          'Unable to delete this expense.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const totalCredits =
    expenses
      .filter(
        (expense) =>
          expense.transactionType ===
          'credit',
      )
      .reduce(
        (total, expense) =>
          total +
          Number(expense.amount || 0),
        0,
      )

  const totalSpending =
    expenses
      .filter(
        (expense) =>
          expense.transactionType !==
          'credit',
      )
      .reduce(
        (total, expense) =>
          total +
          Number(expense.amount || 0),
        0,
      )

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}

      <section>
        <p className="text-sm font-medium text-[var(--bw-primary)]">
          Expense tracking
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--bw-heading)]">
          Expenses
        </h1>

        <p className="mt-2 text-sm text-[var(--bw-body)]">
          Record and manage your daily
          spending.
        </p>

        {ratesLoading && (
          <p className="mt-2 text-xs text-[var(--bw-muted)]">
            Updating exchange rates...
          </p>
        )}
      </section>

      {/* ERROR */}

      {error && (
        <section className="mt-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4">
            <p className="text-sm font-medium text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadExpenses}
              className="mt-3 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
            >
              Try again
            </button>
          </div>
        </section>
      )}

      {/* SUMMARY */}

      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">

          {/* SPENDING */}

          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6 shadow-sm transition-colors">

            <p className="text-sm text-[var(--bw-body)]">
              Total spending
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-red-500">
              -
              {formatCurrency(
                totalSpending,
              )}
            </p>

            <p className="mt-2 text-xs text-[var(--bw-muted)]">
              {
                expenses.filter(
                  (expense) =>
                    expense.transactionType !==
                    'credit',
                ).length
              }{' '}
              expense transactions
            </p>

          </div>

          {/* CREDIT */}

          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6 shadow-sm transition-colors">

            <p className="text-sm text-[var(--bw-body)]">
              Money received
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-500">
              +
              {formatCurrency(
                totalCredits,
              )}
            </p>

            <p className="mt-2 text-xs text-[var(--bw-muted)]">
              Incoming transactions
            </p>

          </div>

          {/* NET */}

          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6 shadow-sm transition-colors">

            <p className="text-sm text-[var(--bw-body)]">
              Net activity
            </p>

            <p
              className={`mt-2 text-3xl font-semibold tracking-tight ${
                totalCredits -
                  totalSpending >=
                0
                  ? 'text-emerald-500'
                  : 'text-red-500'
              }`}
            >
              {totalCredits -
                totalSpending >=
              0
                ? '+'
                : '-'}

              {formatCurrency(
                Math.abs(
                  totalCredits -
                    totalSpending,
                ),
              )}
            </p>

            <p className="mt-2 text-xs text-[var(--bw-muted)]">
              Credits minus spending
            </p>

          </div>

        </div>
      </section>

      {/* ADD EXPENSE */}

      <section className="mt-6 budgetwise-amber-page">
        <ExpenseForm
          onAddExpense={
            handleAddExpense
          }
          disabled={saving}
        />
      </section>

      {/* EXPENSE LIST */}

      <section className="mt-10 pb-10">

        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--bw-heading)]">
            Your expenses
          </h2>

          <p className="mt-1 text-sm text-[var(--bw-body)]">
            Your most recent transactions.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] px-5 py-12 text-center">
            <p className="text-sm text-[var(--bw-body)]">
              Loading your expenses...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] px-5 py-12 text-center">

            <p className="text-sm font-medium text-[var(--bw-text)]">
              No expenses yet.
            </p>

            <p className="mt-2 text-xs text-[var(--bw-muted)]">
              Add your first expense above.
            </p>

          </div>
        ) : (
          <div className="budgetwise-amber-page">
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={
                handleDeleteExpense
              }
              deletingId={deletingId}
            />
          </div>
        )}

      </section>

    </div>
  )
}

export default Expenses