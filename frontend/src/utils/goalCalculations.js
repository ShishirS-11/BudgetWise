export function getTotalSaved(
  goal,
) {
  const contributions =
    Array.isArray(
      goal.contributions,
    )
      ? goal.contributions
      : []

  const contributionsTotal =
    contributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amount || 0,
        ),
      0,
    )

  return (
    Number(
      goal.initialSavings || 0,
    ) +
    contributionsTotal
  )
}

export function getRemainingAmount(
  goal,
) {
  const totalSaved =
    getTotalSaved(goal)

  return Math.max(
    Number(
      goal.targetAmount || 0,
    ) - totalSaved,
    0,
  )
}

export function getProgressPercentage(
  goal,
) {
  const target =
    Number(
      goal.targetAmount || 0,
    )

  if (target <= 0) {
    return 0
  }

  const totalSaved =
    getTotalSaved(goal)

  return Math.min(
    (totalSaved / target) *
      100,
    100,
  )
}

export function getMonthlyContributions(
  goal,
) {
  const monthlyTotals = {}

  const contributions =
    Array.isArray(
      goal.contributions,
    )
      ? goal.contributions
      : []

  contributions.forEach(
    (contribution) => {
      if (!contribution.date) {
        return
      }

      const month =
        contribution.date.slice(
          0,
          7,
        )

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0
      }

      monthlyTotals[month] +=
        Number(
          contribution.amount || 0,
        )
    },
  )

  return Object.entries(
    monthlyTotals,
  )
    .sort(
      ([monthA], [monthB]) =>
        monthA.localeCompare(
          monthB,
        ),
    )
    .map(
      ([
        month,
        amount,
      ]) => ({
        month,
        amount,
      }),
    )
}

export function getAverageMonthlySaving(
  goal,
) {
  const monthlyContributions =
    getMonthlyContributions(
      goal,
    )

  if (
    monthlyContributions.length ===
    0
  ) {
    return 0
  }

  const total =
    monthlyContributions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0,
        ),
      0,
    )

  return (
    total /
    monthlyContributions.length
  )
}

export function getEstimatedMonths(
  goal,
) {
  const remaining =
    getRemainingAmount(goal)

  if (remaining <= 0) {
    return 0
  }

  const averageMonthlySaving =
    getAverageMonthlySaving(
      goal,
    )

  if (
    averageMonthlySaving <= 0
  ) {
    return null
  }

  return Math.ceil(
    remaining /
      averageMonthlySaving,
  )
}

export function getEstimatedCompletionDate(
  goal,
) {
  const remaining =
    getRemainingAmount(goal)

  if (remaining <= 0) {
    return new Date()
  }

  const averageMonthlySaving =
    getAverageMonthlySaving(
      goal,
    )

  if (
    averageMonthlySaving <= 0
  ) {
    return null
  }

  const months =
    Math.ceil(
      remaining /
        averageMonthlySaving,
    )

  const date = new Date()

  date.setMonth(
    date.getMonth() +
      months,
  )

  return date
}

export function getRequiredMonthlySaving(
  goal,
) {
  if (!goal.targetDate) {
    return null
  }

  const remaining =
    getRemainingAmount(goal)

  if (remaining <= 0) {
    return 0
  }

  const today = new Date()

  const targetDate =
    new Date(
      `${goal.targetDate}T00:00:00`,
    )

  if (targetDate <= today) {
    return remaining
  }

  const months =
    (
      targetDate.getFullYear() -
      today.getFullYear()
    ) *
      12 +
    (
      targetDate.getMonth() -
      today.getMonth()
    )

  const effectiveMonths =
    Math.max(
      months,
      1,
    )

  return (
    remaining /
    effectiveMonths
  )
}

export function getGoalStatus(
  goal,
) {
  if (
    getRemainingAmount(goal) <=
    0
  ) {
    return 'completed'
  }

  if (!goal.targetDate) {
    return 'no-target'
  }

  const averageMonthlySaving =
    getAverageMonthlySaving(
      goal,
    )

  const requiredMonthlySaving =
    getRequiredMonthlySaving(
      goal,
    )

  if (
    averageMonthlySaving <= 0
  ) {
    return 'no-history'
  }

  if (
    requiredMonthlySaving !==
      null &&
    averageMonthlySaving >=
      requiredMonthlySaving
  ) {
    return 'on-track'
  }

  return 'behind'
}