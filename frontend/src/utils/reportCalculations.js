export function getTotalSpent(expenses) {
  return expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0,
  )
}

export function getAverageDailySpending(
  expenses,
  days,
) {
  if (days <= 0) {
    return 0
  }

  return (
    getTotalSpent(expenses) / days
  )
}

export function getCategoryTotals(
  expenses,
) {
  const totals = {}

  expenses.forEach((expense) => {
    const category =
      expense.category || 'Other'

    if (!totals[category]) {
      totals[category] = 0
    }

    totals[category] += Number(
      expense.amount || 0,
    )
  })

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort(
      (a, b) => b.amount - a.amount,
    )
}

export function getTopCategory(
  expenses,
) {
  const categories =
    getCategoryTotals(expenses)

  if (categories.length === 0) {
    return null
  }

  return categories[0]
}

export function getHighestSpendingDay(
  expenses,
) {
  const dailyTotals = {}

  expenses.forEach((expense) => {
    if (!expense.date) {
      return
    }

    if (!dailyTotals[expense.date]) {
      dailyTotals[expense.date] = 0
    }

    dailyTotals[expense.date] +=
      Number(expense.amount || 0)
  })

  const days =
    Object.entries(dailyTotals)

  if (days.length === 0) {
    return null
  }

  const [date, amount] = days.reduce(
    (highest, current) =>
      current[1] > highest[1]
        ? current
        : highest,
  )

  return {
    date,
    amount,
  }
}

export function getDailyTotals(
  expenses,
) {
  const dailyTotals = {}

  expenses.forEach((expense) => {
    if (!expense.date) {
      return
    }

    if (!dailyTotals[expense.date]) {
      dailyTotals[expense.date] = 0
    }

    dailyTotals[expense.date] +=
      Number(expense.amount || 0)
  })

  return Object.entries(dailyTotals)
    .sort(([dateA], [dateB]) =>
      dateA.localeCompare(dateB),
    )
    .map(([date, amount]) => ({
      date,
      amount,
    }))
}

export function getPeriodExpenses(
  expenses,
  startDate,
  endDate,
) {
  return expenses.filter(
    (expense) => {
      if (!expense.date) {
        return false
      }

      return (
        expense.date >= startDate &&
        expense.date <= endDate
      )
    },
  )
}

/*
 * Previous month
 */

export function getPreviousMonthRange(
  date,
) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const previousMonth = new Date(
    year,
    month - 1,
    1,
  )

  const previousYear =
    previousMonth.getFullYear()

  const previousMonthNumber =
    previousMonth.getMonth()

  const lastDay = new Date(
    previousYear,
    previousMonthNumber + 1,
    0,
  ).getDate()

  return {
    start: `${previousYear}-${String(
      previousMonthNumber + 1,
    ).padStart(2, '0')}-01`,

    end: `${previousYear}-${String(
      previousMonthNumber + 1,
    ).padStart(2, '0')}-${String(
      lastDay,
    ).padStart(2, '0')}`,
  }
}

/*
 * Spending percentage change
 */

export function getSpendingChange(
  currentAmount,
  previousAmount,
) {
  if (previousAmount === 0) {
    return null
  }

  return (
    ((currentAmount - previousAmount) /
      previousAmount) *
    100
  )
}

/*
 * Category comparison
 */

export function getCategoryChanges(
  currentExpenses,
  previousExpenses,
) {
  const currentCategories =
    getCategoryTotals(
      currentExpenses,
    )

  const previousCategories =
    getCategoryTotals(
      previousExpenses,
    )

  const currentMap = {}
  const previousMap = {}

  currentCategories.forEach(
    (category) => {
      currentMap[category.category] =
        category.amount
    },
  )

  previousCategories.forEach(
    (category) => {
      previousMap[category.category] =
        category.amount
    },
  )

  const allCategories = [
    ...new Set([
      ...Object.keys(currentMap),
      ...Object.keys(previousMap),
    ]),
  ]

  return allCategories
    .map((category) => {
      const currentAmount =
        currentMap[category] || 0

      const previousAmount =
        previousMap[category] || 0

      const change =
        getSpendingChange(
          currentAmount,
          previousAmount,
        )

      return {
        category,
        currentAmount,
        previousAmount,
        change,
      }
    })
    .sort(
      (a, b) =>
        b.currentAmount -
        a.currentAmount,
    )
}