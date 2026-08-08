import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getTripExpenses,
  addTripExpense,
  updateTripExpense,
  deleteTripExpense,
} from '../services/tripExpenseService'

import {
  getTrip,
} from '../services/tripService'

import {
  getTripMembers,
} from '../services/tripMemberService'


function TripExpenses() {
  const navigate = useNavigate()

  const [trip, setTrip] =
    useState(null)

  const [members, setMembers] =
    useState([])

  const [expenses, setExpenses] =
    useState([])

  const [form, setForm] =
    useState({
      title: '',
      amount: '',
      paidBy: '',
      category: 'General',
      date: '',
    })

  const [editingId, setEditingId] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const tripId =
    localStorage.getItem(
      'tripwise-current-trip-id',
    )


  useEffect(() => {
    if (!tripId) {
      navigate('/tripwise')
      return
    }

    loadData()
  }, [tripId])


  async function loadData() {
    setLoading(true)

    try {
      const [
        tripData,
        memberData,
        expenseData,
      ] = await Promise.all([
        getTrip(tripId),
        getTripMembers(tripId),
        getTripExpenses(tripId),
      ])

      setTrip(tripData)
      setMembers(
        memberData,
      )
      setExpenses(
        expenseData,
      )

      setForm((current) => ({
        ...current,
        date:
          current.date ||
          new Date()
            .toISOString()
            .split('T')[0],
        paidBy:
          current.paidBy ||
          memberData[0]?.name ||
          '',
      }))
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to load expenses.',
      )
    } finally {
      setLoading(false)
    }
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }


  function resetForm() {
    setForm({
      title: '',
      amount: '',
      paidBy:
        members[0]?.name || '',
      category: 'General',
      date:
        new Date()
          .toISOString()
          .split('T')[0],
    })

    setEditingId(null)
  }


  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    if (
      !form.title.trim() ||
      !form.amount ||
      !form.paidBy
    ) {
      setMessage(
        'Title, amount and payer are required.',
      )
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        const updated =
          await updateTripExpense(
            editingId,
            form,
          )

        setExpenses((current) =>
          current.map(
            (expense) =>
              expense.id ===
              editingId
                ? updated
                : expense,
          ),
        )

        setMessage(
          'Expense updated.',
        )
      } else {
        const expense =
          await addTripExpense({
            tripId,
            ...form,
          })

        setExpenses((current) => [
          expense,
          ...current,
        ])

        setMessage(
          'Expense added.',
        )
      }

      resetForm()
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to save expense.',
      )
    } finally {
      setSaving(false)
    }
  }


  function startEditing(
    expense,
  ) {
    setEditingId(
      expense.id,
    )

    setForm({
      title:
        expense.title,
      amount:
        String(
          expense.amount,
        ),
      paidBy:
        expense.paidBy,
      category:
        expense.category,
      date:
        expense.date,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  async function removeExpense(
    expenseId,
  ) {
    const confirmed =
      window.confirm(
        'Delete this expense?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteTripExpense(
        expenseId,
      )

      setExpenses((current) =>
        current.filter(
          (expense) =>
            expense.id !==
            expenseId,
        ),
      )

      setMessage(
        'Expense deleted.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to delete expense.',
      )
    }
  }


  const total =
    expenses.reduce(
      (
        sum,
        expense,
      ) =>
        sum +
        Number(
          expense.amount || 0,
        ),
      0,
    )


  if (loading) {
    return <PageLoading />
  }


  return (
    <div className="mx-auto max-w-6xl">

      <button
        type="button"
        onClick={() =>
          navigate('/tripwise')
        }
        className="mb-7 text-sm font-medium text-[#7c8781] hover:text-[#527d71]"
      >
        ← Back to TripWise
      </button>


      <header className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78968b]">
          {trip?.name}
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843] sm:text-5xl">
          Trip expenses
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#7c8781]">
          Keep every shared expense visible to
          everyone.
        </p>

      </header>


      {message && (
        <div className="mb-6 rounded-2xl border border-[#cbded6] bg-[#eef6f2] px-4 py-3 text-sm text-[#527d71]">
          {message}
        </div>
      )}


      {/* TOTAL */}

      <section className="rounded-[28px] bg-[#527d71] p-7 text-white shadow-sm">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Total trip spending
        </p>

        <p className="mt-2 font-serif text-4xl font-semibold">
          ₹
          {total.toLocaleString(
            'en-IN',
            {
              maximumFractionDigits: 0,
            },
          )}
        </p>

        <p className="mt-2 text-sm text-white/70">
          {expenses.length}{' '}
          {expenses.length === 1
            ? 'expense'
            : 'expenses'}
        </p>

      </section>


      {/* FORM */}

      <section className="mt-6 rounded-[28px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              {editingId
                ? 'Edit expense'
                : 'New expense'}
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
              {editingId
                ? 'Update the expense'
                : 'Add spending'}
            </h2>

          </div>

          {editingId && (
            <button
              type="button"
              onClick={
                resetForm
              }
              className="text-xs text-[#7c8781]"
            >
              Cancel
            </button>
          )}

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 grid gap-5 md:grid-cols-2"
        >

          <Field
            label="Expense"
            className="md:col-span-2"
          >
            <input
              type="text"
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              placeholder="Hotel booking"
              className={inputClass()}
            />
          </Field>


          <Field label="Amount">
            <input
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              min="0"
              step="0.01"
              placeholder="2500"
              className={inputClass()}
            />
          </Field>


          <Field label="Paid by">

            <select
              name="paidBy"
              value={
                form.paidBy
              }
              onChange={
                handleChange
              }
              className={inputClass()}
            >

              <option value="">
                Select member
              </option>

              {members.map(
                (member) => (
                  <option
                    key={
                      member.id
                    }
                    value={
                      member.name
                    }
                  >
                    {
                      member.name
                    }
                  </option>
                ),
              )}

            </select>

          </Field>


          <Field label="Category">

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              className={inputClass()}
            >
              <option>
                General
              </option>

              <option>
                Food
              </option>

              <option>
                Stay
              </option>

              <option>
                Transport
              </option>

              <option>
                Activities
              </option>

              <option>
                Shopping
              </option>

              <option>
                Other
              </option>
            </select>

          </Field>


          <Field label="Date">

            <input
              type="date"
              name="date"
              value={
                form.date
              }
              onChange={
                handleChange
              }
              className={inputClass()}
            />

          </Field>


          <div className="md:col-span-2">

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#527d71] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Add expense'}
            </button>

          </div>

        </form>

      </section>


      {/* EXPENSE LIST */}

      <section className="mt-7">

        <h2 className="font-serif text-2xl font-semibold text-[#334843]">
          Spending
        </h2>

        <div className="mt-5 space-y-3">

          {expenses.length ===
          0 ? (
            <div className="rounded-[28px] border border-dashed border-[#d8d1c5] bg-[#fffdf8] p-12 text-center">

              <p className="text-3xl">
                💳
              </p>

              <p className="mt-3 text-sm text-[#7f8984]">
                No trip expenses yet.
              </p>

            </div>
          ) : (
            expenses.map(
              (expense) => (
                <div
                  key={
                    expense.id
                  }
                  className="flex flex-col gap-4 rounded-[24px] border border-[#ddd6ca] bg-[#fffdf8] p-5 shadow-sm sm:flex-row sm:items-center"
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4f0eb]">
                    💳
                  </div>

                  <div className="flex-1">

                    <h3 className="font-serif text-lg font-semibold text-[#334843]">
                      {
                        expense.title
                      }
                    </h3>

                    <p className="mt-1 text-xs text-[#7f8984]">
                      Paid by{' '}
                      {
                        expense.paidBy
                      }
                      {' · '}
                      {
                        expense.category
                      }
                      {' · '}
                      {
                        expense.date
                      }
                    </p>

                  </div>

                  <p className="font-serif text-xl font-semibold text-[#334843]">
                    ₹
                    {Number(
                      expense.amount,
                    ).toLocaleString(
                      'en-IN',
                    )}
                  </p>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          expense,
                        )
                      }
                      className="rounded-xl border border-[#d8d1c5] px-4 py-2 text-xs text-[#68746f]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeExpense(
                          expense.id,
                        )
                      }
                      className="rounded-xl border border-[#e3c3bd] px-4 py-2 text-xs text-[#a65d52]"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ),
            )
          )}

        </div>

      </section>

    </div>
  )
}


function Field({
  label,
  children,
  className = '',
}) {
  return (
    <label className={className}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d76]">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  )
}


function inputClass() {
  return 'w-full rounded-2xl border border-[#dcd5c9] bg-[#fffdf8] px-4 py-3 text-sm text-[#334843] outline-none placeholder:text-[#a7ada9] focus:border-[#7ca194] focus:ring-4 focus:ring-[#7ca194]/10'
}


function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d8e6e0] border-t-[#527d71]" />
    </div>
  )
}


export default TripExpenses