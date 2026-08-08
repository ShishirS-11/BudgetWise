import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import GoalPlanner from '../components/GoalPlanner'
import GoalContributionForm from '../components/GoalContributionForm'

import { useCurrency } from '../context/CurrencyContext'

import {
  getAverageMonthlySaving,
  getEstimatedCompletionDate,
  getGoalStatus,
  getMonthlyContributions,
  getProgressPercentage,
  getRemainingAmount,
  getRequiredMonthlySaving,
  getTotalSaved,
} from '../utils/goalCalculations'

import {
  getGoals,
  createGoal,
  addGoalContribution,
  deleteGoal,
} from '../services/goalService'

function Goals() {
  const {
    formatCurrency,
  } = useCurrency()

  const [goals, setGoals] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [goalToDelete, setGoalToDelete] =
    useState(null)

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    try {
      setLoading(true)
      setError('')

      const data = await getGoals()

      setGoals(data || [])
    } catch (err) {
      console.error(
        'Failed to load goals:',
        err,
      )

      setError(
        err?.message ||
          'Unable to load your goals.',
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * =========================================
   * CREATE GOAL
   * =========================================
   */

  async function handleCreateGoal(
    goal,
  ) {
    try {
      setError('')
      setSuccess('')

      await createGoal({
        name: goal.name,

        targetAmount:
          goal.targetAmount,

        initialSavings:
          goal.initialSavings,

        targetDate:
          goal.targetDate,
      })

      await loadGoals()

      setSuccess(
        'Goal created successfully.',
      )

      window.setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error(
        'Failed to create goal:',
        err,
      )

      setError(
        err?.message ||
          'Unable to create the goal.',
      )
    }
  }

  /*
   * =========================================
   * ADD CONTRIBUTION
   * =========================================
   */

  async function handleAddContribution(
    goalId,
    contribution,
  ) {
    try {
      setError('')
      setSuccess('')

      await addGoalContribution(
        goalId,
        contribution.amount,
        contribution.date,
      )

      await loadGoals()

      setSuccess(
        'Contribution added successfully.',
      )

      window.setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error(
        'Failed to add contribution:',
        err,
      )

      setError(
        err?.message ||
          'Unable to add contribution.',
      )
    }
  }

  /*
   * =========================================
   * OPEN DELETE MODAL
   * =========================================
   */

  function handleDeleteGoal(
    goalId,
  ) {
    const goal =
      goals.find(
        (item) =>
          item.id === goalId,
      )

    if (!goal) {
      return
    }

    setGoalToDelete(goal)
  }

  /*
   * =========================================
   * CONFIRM DELETE
   * =========================================
   */

  async function confirmDeleteGoal() {
    if (!goalToDelete) {
      return
    }

    try {
      setError('')
      setSuccess('')

      const goalId =
        goalToDelete.id

      await deleteGoal(goalId)

      setGoals(
        (currentGoals) =>
          currentGoals.filter(
            (goal) =>
              goal.id !== goalId,
          ),
      )

      setGoalToDelete(null)

      setSuccess(
        'Goal deleted successfully.',
      )

      window.setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error(
        'Failed to delete goal:',
        err,
      )

      setGoalToDelete(null)

      setError(
        err?.message ||
          'Unable to delete goal.',
      )
    }
  }

  /*
   * =========================================
   * CANCEL DELETE
   * =========================================
   */

  function cancelDeleteGoal() {
    setGoalToDelete(null)
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <section>

        <p className="text-sm text-zinc-500">
          Future purchases
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Goals
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Save at your own pace and see
          when you can reach your goals.
        </p>

      </section>

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/10 bg-red-500/[0.03] px-4 py-3">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* ================================= */}
      {/* SUCCESS */}
      {/* ================================= */}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3">

          <p className="text-sm text-emerald-400">
            {success}
          </p>

        </div>
      )}

      {/* ================================= */}
      {/* CREATE GOAL */}
      {/* ================================= */}

      <section className="mt-8">

        <GoalPlanner
          onCreateGoal={
            handleCreateGoal
          }
        />

      </section>

      {/* ================================= */}
      {/* GOALS */}
      {/* ================================= */}

      <section className="mt-10 pb-10">

        <div className="mb-5">

          <h2 className="text-lg font-medium tracking-tight">
            Your goals
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your progress is based on your
            actual contributions.
          </p>

        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/5 bg-[#111417] px-6 py-12 text-center">

            <p className="text-sm text-zinc-500">
              Loading your goals...
            </p>

          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#111417] px-6 py-12 text-center">

            <p className="text-sm text-zinc-400">
              No savings goals yet.
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Create your first goal above.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddContribution={
                  handleAddContribution
                }
                onDeleteGoal={
                  handleDeleteGoal
                }
              />
            ))}

          </div>
        )}

      </section>

      {/* ================================= */}
      {/* DELETE MODAL */}
      {/* ================================= */}

      {goalToDelete && (
        <DeleteGoalModal
          goal={goalToDelete}
          onCancel={
            cancelDeleteGoal
          }
          onConfirm={
            confirmDeleteGoal
          }
        />
      )}

    </div>
  )
}

/*
 * =========================================
 * GOAL CARD
 * =========================================
 */

function GoalCard({
  goal,
  onAddContribution,
  onDeleteGoal,
}) {
  const {
    formatCurrency,
  } = useCurrency()

  const totalSaved = useMemo(
    () =>
      getTotalSaved(goal),
    [goal],
  )

  const remaining = useMemo(
    () =>
      getRemainingAmount(goal),
    [goal],
  )

  const progress = useMemo(
    () =>
      getProgressPercentage(goal),
    [goal],
  )

  const averageMonthlySaving =
    useMemo(
      () =>
        getAverageMonthlySaving(
          goal,
        ),
      [goal],
    )

  const estimatedCompletionDate =
    useMemo(
      () =>
        getEstimatedCompletionDate(
          goal,
        ),
      [goal],
    )

  const requiredMonthlySaving =
    useMemo(
      () =>
        getRequiredMonthlySaving(
          goal,
        ),
      [goal],
    )

  const goalStatus = useMemo(
    () =>
      getGoalStatus(goal),
    [goal],
  )

  const monthlyContributions =
    useMemo(
      () =>
        getMonthlyContributions(
          goal,
        ),
      [goal],
    )

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <h3 className="truncate text-lg font-medium text-zinc-100">
            {goal.name}
          </h3>

          <p className="mt-1 text-sm text-zinc-600">
            Target{' '}
            {formatCurrency(
              goal.targetAmount,
            )}
          </p>

        </div>

        <div className="flex shrink-0 items-center gap-3">

          <p className="text-sm font-medium text-violet-300">
            {progress.toFixed(0)}%
          </p>

          <button
            type="button"
            onClick={() =>
              onDeleteGoal(
                goal.id,
              )
            }
            className="rounded-lg border border-white/5 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
          >
            Delete
          </button>

        </div>

      </div>

      {/* ================================= */}
      {/* PROGRESS */}
      {/* ================================= */}

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">

        <div
          className={`h-full rounded-full transition-all duration-500 ${
            remaining <= 0
              ? 'bg-emerald-500'
              : 'bg-violet-500'
          }`}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* ================================= */}
      {/* STATISTICS */}
      {/* ================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <GoalStat
          label="Saved"
          value={formatCurrency(
            totalSaved,
          )}
        />

        <GoalStat
          label="Remaining"
          value={formatCurrency(
            remaining,
          )}
        />

        <GoalStat
          label="Avg. monthly saving"
          value={
            averageMonthlySaving > 0
              ? formatCurrency(
                  Math.round(
                    averageMonthlySaving,
                  ),
                )
              : '—'
          }
        />

      </div>

      {/* ================================= */}
      {/* FORECAST */}
      {/* ================================= */}

      <div className="mt-6 rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5">

        <p className="text-sm text-zinc-500">
          Goal forecast
        </p>

        {remaining <= 0 ? (
          <div>

            <p className="mt-2 text-xl font-semibold text-emerald-400">
              Goal completed
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              You've reached your target
              amount.
            </p>

          </div>
        ) : averageMonthlySaving <=
          0 ? (
          <div>

            <p className="mt-2 text-xl font-semibold text-zinc-300">
              Start saving to see your
              forecast
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Add a few contributions and
              BudgetWise will estimate when
              you'll reach this goal.
            </p>

          </div>
        ) : (
          <div>

            {estimatedCompletionDate && (
              <>
                <p className="mt-2 text-xl font-semibold text-violet-300">
                  Around{' '}
                  {formatDateObject(
                    estimatedCompletionDate,
                  )}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Based on your average
                  monthly saving of{' '}
                  {formatCurrency(
                    Math.round(
                      averageMonthlySaving,
                    ),
                  )}
                  .
                </p>
              </>
            )}

            {/* Target date */}

            {goal.targetDate &&
              requiredMonthlySaving !==
                null && (
                <div className="mt-5 border-t border-white/5 pt-5">

                  <p className="text-sm text-zinc-500">
                    Target-date requirement
                  </p>

                  {remaining <= 0 ? (
                    <p className="mt-2 text-lg font-semibold text-emerald-400">
                      Target already reached
                    </p>
                  ) : (
                    <>
                      <p className="mt-2 text-lg font-semibold text-zinc-200">
                        {formatCurrency(
                          Math.ceil(
                            requiredMonthlySaving,
                          ),
                        )}
                        /month
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Required to reach your
                        target by{' '}
                        {formatDate(
                          goal.targetDate,
                        )}
                        .
                      </p>
                    </>
                  )}

                  {/* ON TRACK */}

                  {goalStatus ===
                    'on-track' && (
                    <div className="mt-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3">

                      <p className="text-sm text-emerald-400">
                        You're currently on
                        track.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your average saving pace
                        is enough to meet the
                        target date.
                      </p>

                    </div>
                  )}

                  {/* BEHIND */}

                  {goalStatus ===
                    'behind' && (
                    <div className="mt-4 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3">

                      <p className="text-sm text-amber-400">
                        You may need to increase
                        your saving pace.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your current average is
                        below the amount required
                        for the target date.
                      </p>

                    </div>
                  )}

                  {/* NO HISTORY */}

                  {goalStatus ===
                    'no-history' && (
                    <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">

                      <p className="text-sm text-zinc-400">
                        Not enough saving history
                        yet.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Add contributions to see
                        whether you're on track.
                      </p>

                    </div>
                  )}

                </div>
              )}

          </div>
        )}

      </div>

      {/* ================================= */}
      {/* CONTRIBUTION FORM */}
      {/* ================================= */}

      <GoalContributionForm
        goal={goal}
        onAddContribution={
          onAddContribution
        }
      />

      {/* ================================= */}
      {/* MONTHLY SAVINGS */}
      {/* ================================= */}

      <div className="mt-6">

        <p className="text-sm font-medium text-zinc-300">
          Monthly savings
        </p>

        {monthlyContributions.length ===
        0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            No contributions yet.
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">

            {monthlyContributions.map(
              (item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0d0f11] px-4 py-3"
                >

                  <span className="text-sm text-zinc-500">
                    {formatMonth(
                      item.month,
                    )}
                  </span>

                  <span className="text-sm font-medium text-emerald-400">
                    +
                    {formatCurrency(
                      item.amount,
                    )}
                  </span>

                </div>
              ),
            )}

          </div>
        )}

      </div>

      {/* ================================= */}
      {/* CONTRIBUTION HISTORY */}
      {/* ================================= */}

      <div className="mt-6">

        <p className="text-sm font-medium text-zinc-300">
          Contribution history
        </p>

        {goal.contributions.length ===
        0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            No contributions yet.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/5">

            {goal.contributions
              .slice()
              .reverse()
              .map(
                (contribution) => (
                  <div
                    key={
                      contribution.id
                    }
                    className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-b-0"
                  >

                    <span className="text-sm text-zinc-500">
                      {formatDate(
                        contribution.date,
                      )}
                    </span>

                    <span className="text-sm font-medium text-emerald-400">
                      +
                      {formatCurrency(
                        contribution.amount,
                      )}
                    </span>

                  </div>
                ),
              )}

          </div>
        )}

      </div>

      {/* Target date */}

      {goal.targetDate && (
        <p className="mt-5 text-xs text-zinc-600">
          Target date:{' '}
          {formatDate(
            goal.targetDate,
          )}
        </p>
      )}

    </div>
  )
}

/*
 * =========================================
 * GOAL STAT
 * =========================================
 */

function GoalStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d0f11] p-4">

      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-zinc-200">
        {value}
      </p>

    </div>
  )
}

/*
 * =========================================
 * DELETE MODAL
 * =========================================
 */

function DeleteGoalModal({
  goal,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel()
        }
      }}
    >

      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111417] p-6 shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-goal-title"
      >

        {/* Icon */}

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>

        </div>

        {/* Text */}

        <h2
          id="delete-goal-title"
          className="mt-5 text-lg font-semibold text-zinc-100"
        >
          Delete this goal?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">

          You're about to permanently
          delete

          <span className="font-medium text-zinc-300">
            {' '}
            "{goal.name}"
          </span>

          . Its contribution history will
          also be removed.

        </p>

        <p className="mt-3 text-xs text-zinc-700">
          This action cannot be undone.
        </p>

        {/* Actions */}

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
          >
            Delete goal
          </button>

        </div>

      </div>

    </div>
  )
}

/*
 * =========================================
 * DATE HELPERS
 * =========================================
 */

function formatDate(
  dateString,
) {
  const date = new Date(
    `${dateString}T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )
}

function formatDateObject(
  date,
) {
  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

function formatMonth(
  monthString,
) {
  const date = new Date(
    `${monthString}-01T00:00:00`,
  )

  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  )
}

export default Goals