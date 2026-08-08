import { initialExpenses } from '../data/expenseData'

let expenses = [...initialExpenses]

export function getExpenses() {
  return [...expenses]
}

export function addExpense(expense) {
  const newExpense = {
    ...expense,
    id: Date.now(),
  }

  expenses = [
    newExpense,
    ...expenses,
  ]

  return newExpense
}

export function deleteExpense(id) {
  expenses = expenses.filter(
    (expense) => expense.id !== id,
  )
}

export function getTotalExpenses() {
  return expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    0,
  )
}