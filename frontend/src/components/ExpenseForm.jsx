import { useState } from 'react'

import { useCurrency } from '../context/CurrencyContext'

const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
]

const creditCategories = [
  'Salary',
  'Gift',
  'Refund',
  'Bonus',
  'Freelance',
  'Other',
]

function ExpenseForm({
  onAddExpense,
  disabled = false,
}) {
  const {
    currency,
    currencyInfo,
    currentRate,
    ratesLoading,
    ratesError,
    formatCurrency,
  } = useCurrency()

  const [
    transactionType,
    setTransactionType,
  ] = useState('expense')

  const [amount, setAmount] =
    useState('')

  const [category, setCategory] =
    useState('Food')

  const [description, setDescription] =
    useState('')

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    )

  const [error, setError] =
    useState('')

  function handleTransactionTypeChange(
    type,
  ) {
    setTransactionType(type)
    setError('')

    /*
     * Give each transaction type
     * a sensible default category.
     */

    if (type === 'credit') {
      setCategory('Salary')
    } else {
      setCategory('Food')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    setError('')

    /*
     * -----------------------------------------
     * Validate amount
     * -----------------------------------------
     */

    const enteredAmount =
      Number(amount)

    if (
      !amount ||
      !Number.isFinite(
        enteredAmount,
      ) ||
      enteredAmount <= 0
    ) {
      setError(
        `Please enter a valid amount in ${currencyInfo.code}.`,
      )

      return
    }

    /*
     * -----------------------------------------
     * Validate date
     * -----------------------------------------
     */

    if (!date) {
      setError(
        'Please select a date.',
      )

      return
    }

    /*
     * -----------------------------------------
     * Exchange rate check
     * -----------------------------------------
     *
     * The database uses INR as the
     * base currency.
     *
     * Example:
     *
     * USD selected
     * $100 entered
     *       ↓
     * USD → INR
     *       ↓
     * INR amount stored
     *
     * We divide by the INR → selected
     * currency rate.
     */

    if (
      currency !== 'INR' &&
      (
        ratesLoading ||
        !Number.isFinite(
          Number(currentRate),
        ) ||
        Number(currentRate) <= 0
      )
    ) {
      setError(
        'Exchange rates are still loading. Please try again in a moment.',
      )

      return
    }

    let amountInINR =
      enteredAmount

    if (currency !== 'INR') {
      amountInINR =
        enteredAmount /
        Number(currentRate)
    }

    if (
      !Number.isFinite(
        amountInINR,
      ) ||
      amountInINR <= 0
    ) {
      setError(
        'Unable to convert this amount. Please try again.',
      )

      return
    }

    /*
     * -----------------------------------------
     * Create transaction
     * -----------------------------------------
     *
     * Store INR in Supabase.
     */

    const transaction = {
      amount:
        Math.round(
          amountInINR * 100,
        ) / 100,

      category,

      description:
        description.trim() ||
        category,

      date,

      transactionType,
    }

    onAddExpense(transaction)

    /*
     * -----------------------------------------
     * Reset form
     * -----------------------------------------
     */

    setAmount('')
    setDescription('')

    setDate(
      new Date()
        .toISOString()
        .split('T')[0],
    )

    if (
      transactionType ===
      'credit'
    ) {
      setCategory('Salary')
    } else {
      setCategory('Food')
    }
  }

  const categories =
    transactionType ===
    'credit'
      ? creditCategories
      : expenseCategories

  const isCredit =
    transactionType ===
    'credit'

  /*
   * -----------------------------------------
   * Preview converted INR value
   * -----------------------------------------
   */

  const enteredAmount =
    Number(amount)

  let convertedAmount = 0

  if (
    Number.isFinite(
      enteredAmount,
    ) &&
    enteredAmount > 0 &&
    Number.isFinite(
      Number(currentRate),
    ) &&
    Number(currentRate) > 0
  ) {
    if (currency === 'INR') {
      convertedAmount =
        enteredAmount
    } else {
      convertedAmount =
        enteredAmount /
        Number(currentRate)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-[#111417] p-6"
    >

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div>

        <p className="text-lg font-medium tracking-tight">
          Add transaction
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Record money you spent or
          money you received.
        </p>

      </div>

      {/* ================================= */}
      {/* TRANSACTION TYPE */}
      {/* ================================= */}

      <div className="mt-6">

        <p className="mb-3 text-sm text-zinc-400">
          Transaction type
        </p>

        <div className="grid grid-cols-2 gap-3">

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              handleTransactionTypeChange(
                'expense',
              )
            }
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              !isCredit
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                : 'border-white/5 bg-[#0d0f11] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
          >
            Expense
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              handleTransactionTypeChange(
                'credit',
              )
            }
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
              isCredit
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-white/5 bg-[#0d0f11] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
          >
            Credit
          </button>

        </div>

      </div>

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* ================================= */}
      {/* RATE WARNING */}
      {/* ================================= */}

      {ratesError && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">

          <p className="text-xs text-amber-400">
            {ratesError}
          </p>

        </div>
      )}

      {/* ================================= */}
      {/* FIELDS */}
      {/* ================================= */}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        {/* ================================= */}
        {/* AMOUNT */}
        {/* ================================= */}

        <div>

          <label
            htmlFor="amount"
            className="mb-2 block text-sm text-zinc-400"
          >
            Amount
          </label>

          <div
            className={`flex items-center rounded-xl border bg-[#0d0f11] px-4 transition ${
              isCredit
                ? 'border-emerald-500/20 focus-within:border-emerald-500/50'
                : 'border-white/10 focus-within:border-violet-500/50'
            }`}
          >

            <span
              className={
                isCredit
                  ? 'text-emerald-400'
                  : 'text-zinc-500'
              }
            >
              {currencyInfo.symbol}
            </span>

            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              disabled={disabled}
              onChange={(event) =>
                setAmount(
                  event.target.value,
                )
              }
              placeholder="0"
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>

          {/* Currency information */}

          <div className="mt-2 flex items-center justify-between">

            <p className="text-[11px] text-zinc-600">
              Enter amount in{' '}
              <span className="text-zinc-500">
                {currencyInfo.code}
              </span>
            </p>

            {ratesLoading &&
              currency !==
                'INR' && (
                <p className="text-[11px] text-zinc-600">
                  Updating rate...
                </p>
              )}

          </div>

          {/* INR conversion preview */}

          {currency !== 'INR' &&
            enteredAmount >
              0 &&
            convertedAmount >
              0 && (
              <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">

                <div className="flex items-center justify-between">

                  <span className="text-xs text-zinc-600">
                    Stored value
                  </span>

                  <span className="text-xs font-medium text-zinc-400">
                    ₹
                    {convertedAmount.toLocaleString(
                      'en-IN',
                      {
                        maximumFractionDigits:
                          2,
                      },
                    )}
                  </span>

                </div>

              </div>
            )}

        </div>

        {/* ================================= */}
        {/* CATEGORY */}
        {/* ================================= */}

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
            disabled={disabled}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}

          </select>

        </div>

        {/* ================================= */}
        {/* DESCRIPTION */}
        {/* ================================= */}

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
            disabled={disabled}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder={
              isCredit
                ? 'e.g. Monthly salary'
                : 'e.g. Lunch with friends'
            }
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          />

        </div>

        {/* ================================= */}
        {/* DATE */}
        {/* ================================= */}

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
            disabled={disabled}
            onChange={(event) =>
              setDate(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          />

        </div>

      </div>

      {/* ================================= */}
      {/* SUBMIT */}
      {/* ================================= */}

      <button
        type="submit"
        disabled={
          disabled ||
          (currency !== 'INR' &&
            ratesLoading)
        }
        className={`mt-6 rounded-xl px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isCredit
            ? 'bg-emerald-500 hover:bg-emerald-400'
            : 'bg-violet-500 hover:bg-violet-400'
        }`}
      >
        {disabled
          ? 'Saving...'
          : currency !== 'INR' &&
              ratesLoading
            ? 'Updating exchange rate...'
            : isCredit
              ? 'Add credit'
              : 'Add expense'}
      </button>

    </form>
  )
}

export default ExpenseForm