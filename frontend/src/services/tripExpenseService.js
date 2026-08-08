import { supabase } from '../lib/supabaseClient'


async function getCurrentUser() {
  const {
    data: {
      user,
    },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  return user
}


function mapExpense(expense) {
  return {
    id: expense.id,
    tripId: expense.trip_id,
    title: expense.title,
    amount: Number(
      expense.amount || 0,
    ),
    paidBy: expense.paid_by,
    category:
      expense.category ||
      'General',
    date:
      expense.expense_date,
    createdAt:
      expense.created_at,
  }
}


/*
 * Get all expenses
 * for a trip.
 */
export async function getTripExpenses(
  tripId,
) {
  const user =
    await getCurrentUser()

  const {
    data,
    error,
  } = await supabase
    .from('trip_expenses')
    .select('*')
    .eq(
      'trip_id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .order(
      'expense_date',
      {
        ascending: false,
      },
    )
    .order(
      'created_at',
      {
        ascending: false,
      },
    )

  if (error) {
    throw error
  }

  return (
    data || []
  ).map(mapExpense)
}


/*
 * Add a trip expense.
 */
export async function addTripExpense(
  {
    tripId,
    title,
    amount,
    paidBy,
    category,
    date,
  },
) {
  const user =
    await getCurrentUser()

  const numericAmount =
    Number(amount)

  if (!title?.trim()) {
    throw new Error(
      'Expense title is required.',
    )
  }

  if (
    !Number.isFinite(
      numericAmount,
    ) ||
    numericAmount <= 0
  ) {
    throw new Error(
      'Expense amount must be greater than zero.',
    )
  }

  if (!paidBy?.trim()) {
    throw new Error(
      'Please select who paid.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('trip_expenses')
    .insert({
      trip_id:
        tripId,

      user_id:
        user.id,

      title:
        title.trim(),

      amount:
        numericAmount,

      paid_by:
        paidBy.trim(),

      category:
        category?.trim() ||
        'General',

      expense_date:
        date ||
        new Date()
          .toISOString()
          .split('T')[0],
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapExpense(data)
}


/*
 * Update a trip expense.
 */
export async function updateTripExpense(
  expenseId,
  updates,
) {
  const user =
    await getCurrentUser()

  const databaseUpdates = {}

  if (
    updates.title !==
    undefined
  ) {
    databaseUpdates.title =
      updates.title.trim()
  }

  if (
    updates.amount !==
    undefined
  ) {
    const amount =
      Number(updates.amount)

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      throw new Error(
        'Expense amount must be greater than zero.',
      )
    }

    databaseUpdates.amount =
      amount
  }

  if (
    updates.paidBy !==
    undefined
  ) {
    databaseUpdates.paid_by =
      updates.paidBy.trim()
  }

  if (
    updates.category !==
    undefined
  ) {
    databaseUpdates.category =
      updates.category.trim() ||
      'General'
  }

  if (
    updates.date !==
    undefined
  ) {
    databaseUpdates.expense_date =
      updates.date
  }

  const {
    data,
    error,
  } = await supabase
    .from('trip_expenses')
    .update(
      databaseUpdates,
    )
    .eq(
      'id',
      expenseId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapExpense(data)
}


/*
 * Delete a trip expense.
 */
export async function deleteTripExpense(
  expenseId,
) {
  const user =
    await getCurrentUser()

  const {
    error,
  } = await supabase
    .from('trip_expenses')
    .delete()
    .eq(
      'id',
      expenseId,
    )
    .eq(
      'user_id',
      user.id,
    )

  if (error) {
    throw error
  }
}


/*
 * Calculate total trip spending.
 */
export async function getTripExpenseTotal(
  tripId,
) {
  const expenses =
    await getTripExpenses(
      tripId,
    )

  return expenses.reduce(
    (
      total,
      expense,
    ) =>
      total +
      Number(
        expense.amount || 0,
      ),
    0,
  )
}