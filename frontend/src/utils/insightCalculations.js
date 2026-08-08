export function getSpendingPercentage(
  totalSpent,
  categoryAmount,
) {
  if (totalSpent <= 0) {
    return 0
  }

  return (
    (categoryAmount / totalSpent) *
    100
  )
}

export function getBudgetUsage(
  totalSpent,
  monthlyBudget,
) {
  if (monthlyBudget <= 0) {
    return 0
  }

  return (
    (totalSpent / monthlyBudget) *
    100
  )
}

export function getProjectedMonthlySpending(
  totalSpent,
  daysElapsed,
  daysInMonth,
) {
  if (
    daysElapsed <= 0 ||
    daysInMonth <= 0
  ) {
    return 0
  }

  return (
    (totalSpent / daysElapsed) *
    daysInMonth
  )
}

export function getProjectedBudgetDifference(
  totalSpent,
  monthlyBudget,
  daysElapsed,
  daysInMonth,
) {
  const projected =
    getProjectedMonthlySpending(
      totalSpent,
      daysElapsed,
      daysInMonth,
    )

  return monthlyBudget - projected
}

export function getAverageExpense(
  expenses,
) {
  if (expenses.length === 0) {
    return 0
  }

  const total = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0,
  )

  return total / expenses.length
}

export function getLargestExpense(
  expenses,
) {
  if (expenses.length === 0) {
    return null
  }

  return expenses.reduce(
    (largest, expense) =>
      Number(expense.amount || 0) >
      Number(largest.amount || 0)
        ? expense
        : largest,
  )
}

export function getCategoryShare(
  categoryTotals,
  totalSpent,
) {
  return categoryTotals.map(
    (category) => ({
      ...category,
      percentage:
        getSpendingPercentage(
          totalSpent,
          category.amount,
        ),
    }),
  )
}

export function getSpendingStatus(
  totalSpent,
  monthlyBudget,
) {
  if (monthlyBudget <= 0) {
    return 'unknown'
  }

  const percentage =
    getBudgetUsage(
      totalSpent,
      monthlyBudget,
    )

  if (percentage >= 100) {
    return 'over'
  }

  if (percentage >= 85) {
    return 'warning'
  }

  return 'healthy'
}

export function getBudgetInsight(
  totalSpent,
  monthlyBudget,
) {
  const status =
    getSpendingStatus(
      totalSpent,
      monthlyBudget,
    )

  if (status === 'over') {
    return 'You have exceeded your monthly budget. Consider slowing discretionary spending for the rest of the month.'
  }

  if (status === 'warning') {
    return 'You are getting close to your monthly budget. Keep an eye on discretionary spending.'
  }

  if (status === 'healthy') {
    return 'Your spending is currently within a healthy range compared with your monthly budget.'
  }

  return 'Set a monthly budget to start receiving budget insights.'
}

export function getProjectionInsight(
  projectedSpending,
  monthlyBudget,
) {
  if (monthlyBudget <= 0) {
    return 'Set a monthly budget to receive an end-of-month spending projection.'
  }

  const difference =
    monthlyBudget -
    projectedSpending

  if (difference > 0) {
    return `At your current spending rate, you are projected to finish about ₹${Math.round(
      difference,
    ).toLocaleString(
      'en-IN',
    )} under budget.`
  }

  if (difference < 0) {
    return `At your current spending rate, you may exceed your budget by about ₹${Math.abs(
      Math.round(difference),
    ).toLocaleString(
      'en-IN',
    )}.`
  }

  return 'At your current spending rate, you are projected to finish exactly around your budget.'
}