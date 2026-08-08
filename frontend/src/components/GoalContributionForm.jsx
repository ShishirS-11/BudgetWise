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
      className="mt-6 border-t border-[var(--bw-border)] pt-6"
    >

      <div>

        <p className="text-sm font-medium text-[var(--bw-text)]">
          Add contribution
        </p>

        <p className="mt-1 text-xs text-[var(--bw-muted)]">
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

        <div className="flex items-center rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface)] px-4 focus-within:border-amber-500/50">

          <span className="text-[var(--bw-body)]">
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
            className="w-full bg-transparent px-3 py-3 text-sm text-[var(--bw-heading)] outline-none placeholder:text-[var(--bw-muted)] disabled:opacity-50"
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
          className="rounded-xl border border-[var(--bw-border)] bg-[var(--bw-surface)] px-4 py-3 text-sm text-[var(--bw-heading)] outline-none focus:border-amber-500/50 disabled:opacity-50"
        />

      </div>

      {currency !== 'INR' &&
        Number(amount) > 0 &&
        Number.isFinite(
          Number(currentRate),
        ) &&
        Number(currentRate) > 0 && (
          <p className="mt-2 text-[11px] text-[var(--bw-muted)]">
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
        className="mt-3 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ratesLoading
          ? 'Updating exchange rate...'
          : 'Add contribution'}
      </button>

    </form>
  )
}

export default GoalContributionForm