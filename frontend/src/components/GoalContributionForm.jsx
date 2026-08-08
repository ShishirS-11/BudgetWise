import { useState } from 'react'

import {
  useCurrency,
} from '../context/CurrencyContext'

function GoalContributionForm({
  goal,
  onAddContribution,
}) {
  const {
    currency,
    currencyInfo,
    currentRate,
    ratesLoading,
  } = useCurrency()

  const [amount, setAmount] =
    useState('')

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    )

  const [error, setError] =
    useState('')

  function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const contributionAmount =
      Number(amount)

    if (
      !Number.isFinite(
        contributionAmount,
      ) ||
      contributionAmount <= 0
    ) {
      setError(
        `Please enter a valid contribution amount in ${currencyInfo.code}.`,
      )

      return
    }

    if (!date) {
      setError(
        'Please select a contribution date.',
      )

      return
    }

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
        'Exchange rates are still loading. Please try again.',
      )

      return
    }

    let amountInINR =
      contributionAmount

    if (currency !== 'INR') {
      amountInINR =
        contributionAmount /
        Number(currentRate)
    }

    if (
      !Number.isFinite(
        amountInINR,
      ) ||
      amountInINR <= 0
    ) {
      setError(
        'Unable to convert this contribution.',
      )

      return
    }

    amountInINR =
      Math.round(
        amountInINR * 100,
      ) / 100

    onAddContribution(
      goal.id,
      {
        id: Date.now(),
        amount: amountInINR,
        date,
      },
    )

    setAmount('')

    setDate(
      new Date()
        .toISOString()
        .split('T')[0],
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border-t border-white/5 pt-6"
    >

      <div>

        <p className="text-sm font-medium text-zinc-300">
          Add contribution
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          Add money you've put toward this
          goal.
        </p>

      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">

        {/* Amount */}

        <div className="flex items-center rounded-xl border border-white/10 bg-[#111417] px-4 focus-within:border-violet-500/50">

          <span className="text-zinc-500">
            {currencyInfo.symbol}
          </span>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(
                event.target.value,
              )
              setError('')
            }}
            placeholder="Amount"
            disabled={ratesLoading}
            className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 disabled:opacity-50"
          />

        </div>

        {/* Date */}

        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(
              event.target.value,
            )
          }
          disabled={ratesLoading}
          className="rounded-xl border border-white/10 bg-[#111417] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50 disabled:opacity-50"
        />

      </div>

      {currency !== 'INR' &&
        Number(amount) > 0 &&
        Number.isFinite(
          Number(currentRate),
        ) &&
        Number(currentRate) > 0 && (
          <p className="mt-2 text-[11px] text-zinc-600">
            This will be stored as
            approximately ₹
            {(
              Number(amount) /
              Number(currentRate)
            ).toLocaleString(
              'en-IN',
              {
                maximumFractionDigits: 2,
              },
            )}
          </p>
        )}

      <button
        type="submit"
        disabled={
          ratesLoading ||
          !amount ||
          Number(amount) <= 0
        }
        className="mt-3 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ratesLoading
          ? 'Updating exchange rate...'
          : 'Add contribution'}
      </button>

    </form>
  )
}

export default GoalContributionForm