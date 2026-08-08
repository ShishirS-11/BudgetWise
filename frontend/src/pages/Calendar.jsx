import CalendarGrid from '../components/CalendarGrid'
import { getExpenses } from '../services/expenseService'

function Calendar() {
  const expenses = getExpenses()

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section>
        <p className="text-sm text-zinc-500">
          Daily spending
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Calendar
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          See your spending day by day.
        </p>
      </section>

      {/* Calendar */}
      <section className="mt-8">
        <CalendarGrid expenses={expenses} />
      </section>
    </div>
  )
}

export default Calendar