import { useState } from 'react'

import {
  useCurrency,
} from '../context/CurrencyContext'

function GoalPlanner({
  onCreateGoal,
}) {
  const {
    currency,
    currencyInfo,
    currentRate,
    ratesLoading,
    ratesError,
  } = useCurrency()

  const [name, setName] =
    useState('')

  const [targetAmount, setTargetAmount] =
    useState('')

  const [initialSavings, setInitialSavings] =
    useState('0')

  const [targetDate, setTargetDate] =
    useState('')

  const [error, setError] =
    useState('')

  function convertToINR(
    amount,
  ) {
    if (currency === 'INR') {
      return amount
    }

    if (
      !Number.isFinite(
        Number(currentRate),
      ) ||
      Number(currentRate) <= 0
    ) {
      return null
    }

    return (
      amount /
      Number(currentRate)
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const target =
      Number(targetAmount)

    const saved =
      Number(initialSavings)

    if (!name.trim()) {
      setError(
        'Please enter a goal name.',
      )
      return
    }

    if (
      !Number.isFinite(target) ||
      target <= 0
    ) {
      setError(
        `Please enter a valid target amount in ${currencyInfo.code}.`,
      )
      return
    }

    if (
      !Number.isFinite(saved) ||
      saved < 0
    ) {
      setError(
        `Please enter a valid saved amount in ${currencyInfo.code}.`,
      )
      return
    }

    if (saved > target) {
      setError(
        'Already saved cannot be greater than the target amount.',
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
        'Exchange rates are still loading. Please try again in a moment.',
      )
      return
    }

    const targetINR =
      convertToINR(target)

    const savedINR =
      convertToINR(saved)

    if (
      targetINR === null ||
      savedINR === null
    ) {
      setError(
        'Unable to convert the goal amount. Please try again.',
      )
      return
    }

    const goal = {
      id: Date.now(),

      name: name.trim(),

      targetAmount:
        Math.round(
          targetINR * 100,
        ) / 100,

      initialSavings:
        Math.round(
          savedINR * 100,
        ) / 100,

      targetDate,

      contributions: [],
    }

    onCreateGoal(goal)

    setName('')
    setTargetAmount('')
    setInitialSavings('0')
    setTargetDate('')
  }

  const target =
    Number(targetAmount)

  const saved =
    Number(initialSavings)

  let targetINR = target
  let savedINR = saved

  if (
    currency !== 'INR' &&
    Number.isFinite(
      Number(currentRate),
    ) &&
    Number(currentRate) > 0
  ) {
    targetINR =
      target /
      Number(currentRate)

    savedINR =
      saved /
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
          Create a goal
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Set something you want to
          save toward.
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

      {ratesError && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">

          <p className="text-xs text-amber-400">
            {ratesError}
          </p>

        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        {/* Goal name */}

        <div>

          <label
            htmlFor="goalName"
            className="mb-2 block text-sm text-zinc-400"
          >
            What are you saving for?
          </label>

          <input
            id="goalName"
            type="text"
            value={name}
            onChange={(event) => {
              setName(
                event.target.value,
              )
              setError('')
            }}
            placeholder="e.g. New laptop"
            disabled={ratesLoading}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50 disabled:opacity-50"
          />

        </div>

        {/* Target amount */}

        <div>

          <label
            htmlFor="targetAmount"
            className="mb-2 block text-sm text-zinc-400"
          >
            Target amount
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">

            <span className="text-zinc-500">
              {currencyInfo.symbol}
            </span>

            <input
              id="targetAmount"
              type="number"
              min="1"
              step="0.01"
              value={targetAmount}
              onChange={(event) => {
                setTargetAmount(
                  event.target.value,
                )
                setError('')
              }}
              placeholder="70000"
              disabled={ratesLoading}
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 disabled:opacity-50"
            />

          </div>

          {currency !== 'INR' &&
            target > 0 &&
            targetINR > 0 && (
              <p className="mt-2 text-[11px] text-zinc-600">
                Stored as approximately ₹
                {targetINR.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
            )}

        </div>

        {/* Initial savings */}

        <div>

          <label
            htmlFor="initialSavings"
            className="mb-2 block text-sm text-zinc-400"
          >
            Already saved
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f11] px-4 focus-within:border-violet-500/50">

            <span className="text-zinc-500">
              {currencyInfo.symbol}
            </span>

            <input
              id="initialSavings"
              type="number"
              min="0"
              step="0.01"
              value={initialSavings}
              onChange={(event) => {
                setInitialSavings(
                  event.target.value,
                )
                setError('')
              }}
              disabled={ratesLoading}
              className="w-full bg-transparent px-3 py-3 text-sm text-zinc-100 outline-none disabled:opacity-50"
            />

          </div>

          {currency !== 'INR' &&
            saved > 0 &&
            savedINR > 0 && (
              <p className="mt-2 text-[11px] text-zinc-600">
                Stored as approximately ₹
                {savedINR.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
            )}

        </div>

        {/* Target date */}

        <div>

          <label
            htmlFor="targetDate"
            className="mb-2 block text-sm text-zinc-400"
          >
            Target date

            <span className="ml-2 text-xs text-zinc-600">
              optional
            </span>
          </label>

          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(event) =>
              setTargetDate(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
          />

        </div>

      </div>

      <button
        type="submit"
        disabled={
          ratesLoading
        }
        className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ratesLoading
          ? 'Updating exchange rate...'
          : 'Create goal'}
      </button>

    </form>
  )
}

export default GoalPlanner