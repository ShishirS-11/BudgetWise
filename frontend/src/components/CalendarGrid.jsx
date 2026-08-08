import { useMemo, useState } from 'react'

function CalendarGrid({ expenses }) {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 7, 1),
  )

  const [selectedDate, setSelectedDate] = useState(
    '2026-08-08',
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate()

  const firstDayOfMonth = new Date(
    year,
    month,
    1,
  ).getDay()

  const monthName = currentDate.toLocaleString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  )

  const calendarDays = useMemo(() => {
    const days = []

    for (let i = 0; i < firstDayOfMonth; i += 1) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day)
    }

    return days
  }, [firstDayOfMonth, daysInMonth])

  function formatDate(day) {
    const monthNumber = String(month + 1).padStart(2, '0')
    const dayNumber = String(day).padStart(2, '0')

    return `${year}-${monthNumber}-${dayNumber}`
  }

  function getDayTotal(day) {
    if (!day) return 0

    const date = formatDate(day)

    return expenses
      .filter((expense) => expense.date === date)
      .reduce(
        (total, expense) => total + expense.amount,
        0,
      )
  }

  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1),
    )
  }

  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1),
    )
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight">
          {monthName}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 text-zinc-500 transition hover:border-white/10 hover:text-zinc-200"
          >
            ←
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 text-zinc-500 transition hover:border-white/10 hover:text-zinc-200"
          >
            →
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="mt-6 grid grid-cols-7 gap-2">
        {[
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
        ].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs text-zinc-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-20 rounded-xl"
              />
            )
          }

          const date = formatDate(day)
          const total = getDayTotal(day)
          const isSelected = date === selectedDate

          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`min-h-20 rounded-xl border p-3 text-left transition ${
                isSelected
                  ? 'border-violet-500/40 bg-violet-500/10'
                  : 'border-white/5 bg-[#0d0f11] hover:border-white/10'
              }`}
            >
              <span
                className={`text-sm ${
                  isSelected
                    ? 'text-violet-300'
                    : 'text-zinc-400'
                }`}
              >
                {day}
              </span>

              {total > 0 && (
                <p className="mt-4 truncate text-xs font-medium text-zinc-300">
                  ₹{total.toLocaleString('en-IN')}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid