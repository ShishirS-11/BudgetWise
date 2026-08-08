import { supabase } from '../lib/supabaseClient'

function mapGoal(goal, contributions = []) {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: Number(
      goal.target_amount || 0,
    ),
    initialSavings: Number(
      goal.initial_savings || 0,
    ),
    targetDate: goal.target_date || '',
    contributions: contributions.map(
      (contribution) => ({
        id: contribution.id,
        amount: Number(
          contribution.amount || 0,
        ),
        date:
          contribution.contribution_date,
      }),
    ),
  }
}

async function getCurrentUser() {
  const {
    data: { user },
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

export async function getGoals() {
  const user =
    await getCurrentUser()

  const {
    data: goals,
    error: goalsError,
  } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })

  if (goalsError) {
    throw goalsError
  }

  if (!goals || goals.length === 0) {
    return []
  }

  const goalIds = goals.map(
    (goal) => goal.id,
  )

  const {
    data: contributions,
    error: contributionsError,
  } = await supabase
    .from('goal_contributions')
    .select('*')
    .eq('user_id', user.id)
    .in('goal_id', goalIds)
    .order('contribution_date', {
      ascending: true,
    })
    .order('created_at', {
      ascending: true,
    })

  if (contributionsError) {
    throw contributionsError
  }

  return goals.map((goal) => {
    const goalContributions =
      (contributions || []).filter(
        (contribution) =>
          contribution.goal_id ===
          goal.id,
      )

    return mapGoal(
      goal,
      goalContributions,
    )
  })
}

export async function createGoal({
  name,
  targetAmount,
  initialSavings,
  targetDate,
}) {
  const user =
    await getCurrentUser()

  const target = Number(
    targetAmount,
  )

  const saved = Number(
    initialSavings || 0,
  )

  if (
    !name?.trim() ||
    !Number.isFinite(target) ||
    target <= 0
  ) {
    throw new Error(
      'Please enter a valid goal and target amount.',
    )
  }

  if (
    !Number.isFinite(saved) ||
    saved < 0 ||
    saved > target
  ) {
    throw new Error(
      'Initial savings must be between zero and the target amount.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      name: name.trim(),
      target_amount: target,
      initial_savings: saved,
      target_date:
        targetDate || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapGoal(data, [])
}

export async function addGoalContribution(
  goalId,
  amount,
  date,
) {
  const user =
    await getCurrentUser()

  const contributionAmount =
    Number(amount)

  if (
    !Number.isFinite(
      contributionAmount,
    ) ||
    contributionAmount <= 0
  ) {
    throw new Error(
      'Contribution amount must be greater than zero.',
    )
  }

  const {
    data: goal,
    error: goalError,
  } = await supabase
    .from('goals')
    .select('id, user_id')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single()

  if (goalError) {
    throw goalError
  }

  if (!goal) {
    throw new Error(
      'Goal not found.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('goal_contributions')
    .insert({
      goal_id: goalId,
      user_id: user.id,
      amount: contributionAmount,
      contribution_date:
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

  return {
    id: data.id,
    amount: Number(
      data.amount,
    ),
    date:
      data.contribution_date,
  }
}

export async function deleteGoal(
  goalId,
) {
  const user =
    await getCurrentUser()

  const {
    error,
  } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw error
  }
}