import { useMemo, useState } from 'react'
import GoalPlanner from '../components/GoalPlanner'
import GoalContributionForm from '../components/GoalContributionForm'
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

function Goals() {
  const [goals, setGoals] = useState([])

  function handleCreateGoal(goal) {
    setGoals((currentGoals) => [
      goal,
      ...currentGoals,
    ])
  }

  function handleAddContribution(
    goalId,
    contribution,
  ) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) {
          return goal
        }

        return {
          ...goal,
          contributions: [
            ...goal.contributions,
            contribution,
          ],
        }
      }),
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <section>
        <p className="text-sm text-zinc-500">
          Future purchases
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Goals
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Save at your own pace and see when you can reach your goals.
        </p>
      </section>

      {/* Create goal */}
      <section className="mt-8">
        <GoalPlanner
          onCreateGoal={handleCreateGoal}
        />
      </section>

      {/* Goals */}
      <section className="mt-10 pb-10">
        <div className="mb-5">
          <h2 className="text-lg font-medium tracking-tight">
            Your goals
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your progress is based on your actual contributions.
          </p>
        </div>

        {goals.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function GoalCard({
  goal,
  onAddContribution,
}) {
  const totalSaved = useMemo(
    () => getTotalSaved(goal),
    [goal],
  )

  const remaining = useMemo(
    () => getRemainingAmount(goal),
    [goal],
  )

  const progress = useMemo(
    () => getProgressPercentage(goal),
    [goal],
  )

  const averageMonthlySaving = useMemo(
    () => getAverageMonthlySaving(goal),
    [goal],
  )

  const estimatedCompletionDate = useMemo(
    () => getEstimatedCompletionDate(goal),
    [goal],
  )

  const requiredMonthlySaving = useMemo(
    () => getRequiredMonthlySaving(goal),
    [goal],
  )

  const goalStatus = useMemo(
    () => getGoalStatus(goal),
    [goal],
  )

  const monthlyContributions = useMemo(
    () => getMonthlyContributions(goal),
    [goal],
  )

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
      {/* Goal header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-zinc-100">
            {goal.name}
          </h3>

          <p className="mt-1 text-sm text-zinc-600">
            Target ₹
            {goal.targetAmount.toLocaleString(
              'en-IN',
            )}
          </p>
        </div>

        <p className="text-sm font-medium text-violet-300">
          {progress.toFixed(0)}%
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Main statistics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <GoalStat
          label="Saved"
          value={`₹${totalSaved.toLocaleString(
            'en-IN',
          )}`}
        />

        <GoalStat
          label="Remaining"
          value={`₹${remaining.toLocaleString(
            'en-IN',
          )}`}
        />

        <GoalStat
          label="Avg. monthly saving"
          value={
            averageMonthlySaving > 0
              ? `₹${Math.round(
                  averageMonthlySaving,
                ).toLocaleString('en-IN')}`
              : '—'
          }
        />
      </div>

      {/* Goal forecast */}
      <div className="mt-6 rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
        <p className="text-sm text-zinc-500">
          Goal forecast
        </p>

        {remaining <= 0 ? (
          <div>
            <p className="mt-2 text-xl font-semibold text-violet-300">
              Goal completed
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              You've reached your target amount.
            </p>
          </div>
        ) : averageMonthlySaving <= 0 ? (
          <div>
            <p className="mt-2 text-xl font-semibold text-zinc-300">
              Start saving to see your forecast
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Add a few contributions and BudgetWise
              will estimate when you'll reach this goal.
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
                  Based on your average monthly saving of ₹
                  {Math.round(
                    averageMonthlySaving,
                  ).toLocaleString('en-IN')}
                  .
                </p>
              </>
            )}

            {/* Target date analysis */}
            {goal.targetDate &&
              requiredMonthlySaving !== null && (
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
                        ₹
                        {Math.ceil(
                          requiredMonthlySaving,
                        ).toLocaleString('en-IN')}
                        /month
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Required to reach your target by{' '}
                        {formatDate(goal.targetDate)}.
                      </p>
                    </>
                  )}

                  {/* Status */}
                  {goalStatus === 'on-track' && (
                    <div className="mt-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3">
                      <p className="text-sm text-emerald-400">
                        You're currently on track.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your average saving pace is enough
                        to meet the target date.
                      </p>
                    </div>
                  )}

                  {goalStatus === 'behind' && (
                    <div className="mt-4 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3">
                      <p className="text-sm text-amber-400">
                        You may need to increase your saving pace.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your current average is below the
                        amount required for the target date.
                      </p>
                    </div>
                  )}

                  {goalStatus === 'no-history' && (
                    <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="text-sm text-zinc-400">
                        Not enough saving history yet.
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Add contributions to see whether
                        you're on track.
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Add contribution */}
      <GoalContributionForm
        goal={goal}
        onAddContribution={onAddContribution}
      />

      {/* Monthly savings */}
      <div className="mt-6">
        <p className="text-sm font-medium text-zinc-300">
          Monthly savings
        </p>

        {monthlyContributions.length === 0 ? (
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
                    {formatMonth(item.month)}
                  </span>

                  <span className="text-sm font-medium text-zinc-200">
                    ₹
                    {item.amount.toLocaleString(
                      'en-IN',
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Contribution history */}
      <div className="mt-6">
        <p className="text-sm font-medium text-zinc-300">
          Contribution history
        </p>

        {goal.contributions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            No contributions yet.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
            {goal.contributions
              .slice()
              .reverse()
              .map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm text-zinc-500">
                    {formatDate(
                      contribution.date,
                    )}
                  </span>

                  <span className="text-sm font-medium text-zinc-200">
                    +₹
                    {contribution.amount.toLocaleString(
                      'en-IN',
                    )}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Target date */}
      {goal.targetDate && (
        <p className="mt-5 text-xs text-zinc-600">
          Target date:{' '}
          {formatDate(goal.targetDate)}
        </p>
      )}
    </div>
  )
}

function GoalStat({ label, value }) {
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

function formatDate(dateString) {
  const date = new Date(
    `${dateString}T00:00:00`,
  )

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateObject(date) {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMonth(monthString) {
  const date = new Date(
    `${monthString}-01T00:00:00`,
  )

  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

export default Goals