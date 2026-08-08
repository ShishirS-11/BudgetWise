import { supabase } from '../lib/supabaseClient'

function getMonthStart(date = new Date()) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  return `${year}-${month}-01`
}

function mapBudget(budget) {
  return {
    id: budget.id,
    amount: Number(budget.amount),
    month: budget.month,
  }
}

export async function getBudget(
  month = getMonthStart(),
) {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
    ? mapBudget(data)
    : null
}

export async function getBudgets() {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('month', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data || []).map(mapBudget)
}

export async function saveBudget(
  amount,
  month = getMonthStart(),
) {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  const budgetAmount =
    Number(amount)

  if (
    !Number.isFinite(
      budgetAmount,
    ) ||
    budgetAmount <= 0
  ) {
    throw new Error(
      'Budget amount must be greater than zero.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: user.id,
        month,
        amount: budgetAmount,
      },
      {
        onConflict:
          'user_id,month',
      },
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapBudget(data)
}