import {
  useEffect,
  useState,
} from 'react'

import {
  useCurrency,
} from '../context/CurrencyContext'

function BudgetSetup({
  budget,
  onSave,
  saving = false,
}) {
  const {
    currency,
    currencyInfo,
    currentRate,
    ratesLoading,
    ratesError,
    formatCurrency,
  } = useCurrency()

  const [amount, setAmount] =
    useState('')

  const [month, setMonth] =
    useState(
      getCurrentMonth(),
    )

  const [error, setError] =
    useState('')

  /*
   * Populate existing budget.
   *
   * Database value is INR.
   * Input value is selected currency.
   */

  useEffect(() => {
    if (budget) {
      const storedINR =
        Number(
          budget.amount || 0,
        )

      let displayAmount =
        storedINR

      if (
        currency !== 'INR' &&
        Number.isFinite(
          Number(currentRate),
        ) &&
        Number(currentRate) > 0
      ) {
        displayAmount =
          storedINR *
          Number(currentRate)
      }

      setAmount(
        displayAmount
          ? String(
              Math.round(
                displayAmount * 100,
              ) / 100,
            )
          : '',
      )

      setMonth(
        budget.month.slice(
          0,
          7,
        ),
      )
    } else {
      setAmount('')
    }
  }, [
    budget,
    currency,
    currentRate,
  ])

  function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const enteredAmount =
      Number(amount)

    /*
     * Validate.
     */

    if (
      !amount ||
      !Number.isFinite(
        enteredAmount,
      ) ||
      enteredAmount <= 0
    ) {
      setError(
        `Please enter a valid budget amount in ${currencyInfo.code}.`,
      )

      return
    }

    if (!month) {
      setError(
        'Please select a budget month.',
      )

      return
    }

    /*
     * Exchange rate must be available
     * when using a non-INR currency.
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

    /*
     * Convert selected currency
     * back into INR.
     *
     * Example:
     *
     * USD 1000
     *     ↓
     * USD → INR
     *     ↓
     * INR amount saved
     */

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
        'Unable to convert this budget amount. Please try again.',
      )

      return
    }

    /*
     * Round to paise.
     */

    amountInINR =
      Math.round(
        amountInINR * 100,
      ) / 100

    const monthDate =
      `${month}-01`

    onSave({
      amount: amountInINR,
      month: monthDate,
    })
  }

  /*
   * Preview stored INR value.
   */

  const enteredAmount =
    Number(amount)

  let storedINR =
    enteredAmount

  if (
    currency !== 'INR' &&
    Number.isFinite(
      Number(currentRate),
    ) &&
    Number(currentRate) > 0 &&
    enteredAmount > 0
  ) {
    storedINR =
      enteredAmount /
      Number(currentRate)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/5 bg-[#111417] p-6"
    >

      {/* Header */}

      <div>

        <p className="text-lg font-medium tracking-tight">
          {budget
            ? 'Update budget'
            : 'Create a budget'}
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Set how much you want to
          spend during a month.
        </p>

      </div>

      {/* Error */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* Rate warning */}

      {ratesError && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">

          <p className="text-xs text-amber-400">
            {ratesError}
          </p>

        </div>
      )}

      {/* Month */}

      <div className="mt-6">

        <label
          htmlFor="budgetMonth"
          className="mb-2 block text-sm text-zinc-400"
        >
          Budget month
        </label>

        <input
          id="budgetMonth"
          type="month"
          value={month}
          onChange={(event) =>
            setMonth(
              event.target.value,
            )
          }
          disabled={saving}
          className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/50 disabled:opacity-50"
        />

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
            {currencyInfo.symbol}
          </span>

          <input
            id="budgetAmount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(
                event.target.value,
              )
              setError('')
            }}
            placeholder="Enter amount"
            disabled={saving}
            className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 disabled:opacity-50"
          />

        </div>

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

        {/* INR storage preview */}

        {currency !== 'INR' &&
          enteredAmount > 0 &&
          storedINR > 0 && (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">

              <div className="flex items-center justify-between">

                <span className="text-xs text-zinc-600">
                  Stored budget
                </span>

                <span className="text-xs font-medium text-zinc-400">
                  ₹
                  {storedINR.toLocaleString(
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

      {/* Save */}

      <button
        type="submit"
        disabled={
          saving ||
          !amount ||
          Number(amount) <=
            0 ||
          (
            currency !== 'INR' &&
            ratesLoading
          )
        }
        className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? 'Saving...'
          : currency !==
                'INR' &&
              ratesLoading
            ? 'Updating exchange rate...'
            : budget
              ? 'Update budget'
              : 'Save budget'}
      </button>

    </form>
  )
}

function getCurrentMonth() {
  const date = new Date()

  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  return `${year}-${month}`
}

export default BudgetSetup