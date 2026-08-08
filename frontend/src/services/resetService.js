import { supabase } from '../lib/supabaseClient'

/*
 * Reset all financial data belonging
 * to the currently logged-in user.
 *
 * This does NOT delete the user's
 * Supabase authentication account.
 */

export async function resetAllFinancialData() {
  /*
   * Get current user
   */

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
      'You must be signed in to reset your data.',
    )
  }

  /*
   * =====================================================
   * 1. Delete goal contributions
   * =====================================================
   *
   * Contributions reference goals,
   * so delete them first.
   */

  const {
    error: contributionsError,
  } = await supabase
    .from('goal_contributions')
    .delete()
    .eq('user_id', user.id)

  if (contributionsError) {
    throw contributionsError
  }

  /*
   * =====================================================
   * 2. Delete goals
   * =====================================================
   */

  const {
    error: goalsError,
  } = await supabase
    .from('goals')
    .delete()
    .eq('user_id', user.id)

  if (goalsError) {
    throw goalsError
  }

  /*
   * =====================================================
   * 3. Delete expenses and credits
   * =====================================================
   */

  const {
    error: expensesError,
  } = await supabase
    .from('expenses')
    .delete()
    .eq('user_id', user.id)

  if (expensesError) {
    throw expensesError
  }

  /*
   * =====================================================
   * 4. Delete budgets
   * =====================================================
   */

  const {
    error: budgetsError,
  } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', user.id)

  if (budgetsError) {
    throw budgetsError
  }

  /*
   * Everything was successfully deleted.
   */

  return true
}