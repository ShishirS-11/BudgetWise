import { supabase } from '../lib/supabaseClient'

/*
 * Convert a database transaction into
 * the format used by the frontend.
 */
function mapExpenseFromDatabase(expense) {
  return {
    id: expense.id,
    name: expense.name,
    amount: Number(expense.amount),
    category: expense.category,
    date: expense.expense_date,
    notes: expense.notes || '',
    transactionType:
      expense.transaction_type ||
      'expense',
  }
}

/*
 * Convert a frontend transaction into
 * the format expected by Supabase.
 */
function mapExpenseToDatabase(
  expense,
  userId,
) {
  return {
    user_id: userId,

    /*
     * Your form may use either
     * name or description.
     */
    name:
      expense.name ||
      expense.description ||
      'Transaction',

    amount: Number(
      expense.amount,
    ),

    category:
      expense.category ||
      'Other',

    expense_date:
      expense.date ||
      new Date()
        .toISOString()
        .split('T')[0],

    notes:
      expense.notes ||
      null,

    /*
     * New transaction type.
     *
     * expense = money spent
     * credit  = money received
     */
    transaction_type:
      expense.transactionType ||
      'expense',
  }
}

/*
 * Get all transactions belonging
 * to the currently logged-in user.
 */
export async function getExpenses() {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    return []
  }

  const {
    data,
    error,
  } = await supabase
    .from('expenses')
    .select('*')
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

  return (data || []).map(
    mapExpenseFromDatabase,
  )
}

/*
 * Add either an expense or
 * a credit.
 */
export async function addExpense(
  expense,
) {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be signed in to add a transaction.',
    )
  }

  /*
   * Validate amount.
   */
  const amount = Number(
    expense.amount,
  )

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Please enter a valid amount.',
    )
  }

  /*
   * Only allow our two
   * transaction types.
   */
  const transactionType =
    expense.transactionType ===
    'credit'
      ? 'credit'
      : 'expense'

  const expenseData =
    mapExpenseToDatabase(
      {
        ...expense,
        transactionType,
      },
      user.id,
    )

  const {
    data,
    error,
  } = await supabase
    .from('expenses')
    .insert(
      expenseData,
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapExpenseFromDatabase(
    data,
  )
}

/*
 * Delete a transaction.
 */
export async function deleteExpense(
  id,
) {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be signed in to delete a transaction.',
    )
  }

  const {
    error,
  } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq(
      'user_id',
      user.id,
    )

  if (error) {
    throw error
  }
}

/*
 * Get total expenses only.
 *
 * Credits are NOT included here.
 */
export async function getTotalExpenses() {
  const transactions =
    await getExpenses()

  return transactions
    .filter(
      (transaction) =>
        transaction.transactionType ===
        'expense',
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.amount ||
            0,
        ),
      0,
    )
}

/*
 * Get total credits.
 */
export async function getTotalCredits() {
  const transactions =
    await getExpenses()

  return transactions
    .filter(
      (transaction) =>
        transaction.transactionType ===
        'credit',
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.amount ||
            0,
        ),
      0,
    )
}

/*
 * Get the current balance from
 * credits minus expenses.
 */
export async function getNetBalance() {
  const transactions =
    await getExpenses()

  return transactions.reduce(
    (total, transaction) => {
      const amount =
        Number(
          transaction.amount ||
            0,
        )

      if (
        transaction.transactionType ===
        'credit'
      ) {
        return total + amount
      }

      return total - amount
    },
    0,
  )
}