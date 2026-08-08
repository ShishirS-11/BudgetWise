import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getTripItinerary,
} from '../services/tripItineraryService'

import {
  getTrip,
} from '../services/tripService'


function TripCalendar() {
  const navigate = useNavigate()

  const [trip, setTrip] =
    useState(null)

  const [items, setItems] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ),
    )

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(null)

  const tripId =
    localStorage.getItem(
      'tripwise-current-trip-id',
    )


  useEffect(() => {
    if (!tripId) {
      navigate('/tripwise')
      return
    }

    loadData()
  }, [tripId])


  async function loadData() {
    setLoading(true)

    try {
      const [
        tripData,
        itineraryData,
      ] = await Promise.all([
        getTrip(tripId),
        getTripItinerary(tripId),
      ])

      setTrip(tripData)
      setItems(
        itineraryData,
      )

      if (tripData.startDate) {
        setCurrentMonth(
          new Date(
            `${tripData.startDate}T00:00:00`,
          ),
        )
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  const calendarDays =
    useMemo(
      () =>
        buildCalendar(
          currentMonth,
        ),
      [currentMonth],
    )


  const selectedItems =
    selectedDate
      ? items.filter(
          (item) =>
            item.date ===
            selectedDate,
        )
      : []


  function previousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1,
      ),
    )
  }


  function nextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1,
      ),
    )
  }


  if (loading) {
    return <PageLoading />
  }


  return (
    <div className="mx-auto max-w-6xl">

      <button
        type="button"
        onClick={() =>
          navigate('/tripwise')
        }
        className="mb-7 text-sm font-medium text-[#7c8781] hover:text-[#527d71]"
      >
        ← Back to TripWise
      </button>


      <header className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78968b]">
          {trip?.name}
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843] sm:text-5xl">
          Trip calendar
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#7c8781]">
          Every plan, every day, all in one place.
        </p>

      </header>


      <section className="rounded-[30px] border border-[#ddd6ca] bg-[#fffdf8] p-5 shadow-sm sm:p-7">

        {/* MONTH HEADER */}

        <div className="flex items-center justify-between">

          <button
            type="button"
            onClick={
              previousMonth
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8d1c5] text-[#68746f] hover:bg-[#eef5f1]"
          >
            ←
          </button>

          <div className="text-center">

            <p className="font-serif text-2xl font-semibold text-[#334843]">
              {new Intl.DateTimeFormat(
                'en-IN',
                {
                  month: 'long',
                  year: 'numeric',
                },
              ).format(
                currentMonth,
              )}
            </p>

          </div>

          <button
            type="button"
            onClick={
              nextMonth
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8d1c5] text-[#68746f] hover:bg-[#eef5f1]"
          >
            →
          </button>

        </div>


        {/* WEEKDAYS */}

        <div className="mt-7 grid grid-cols-7">

          {[
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
          ].map(
            (day) => (
              <div
                key={day}
                className="pb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#9a9f9b]"
              >
                {day}
              </div>
            ),
          )}

        </div>


        {/* CALENDAR */}

        <div className="grid grid-cols-7 border-l border-t border-[#e5dfd5]">

          {calendarDays.map(
            (day, index) => {

              const dayItems =
                day.date
                  ? items.filter(
                      (item) =>
                        item.date ===
                        day.date,
                    )
                  : []

              const selected =
                selectedDate ===
                day.date

              return (
                <button
                  key={`${day.date}-${index}`}
                  type="button"
                  disabled={!day.date}
                  onClick={() =>
                    day.date &&
                    setSelectedDate(
                      day.date,
                    )
                  }
                  className={[
                    'min-h-[100px] border-b border-r border-[#e5dfd5] p-2 text-left transition sm:min-h-[125px]',
                    !day.date
                      ? 'bg-[#f7f4ee]'
                      : 'bg-[#fffdf8] hover:bg-[#f1f7f4]',
                    selected
                      ? 'bg-[#e7f2ed] ring-2 ring-inset ring-[#7ca194]'
                      : '',
                  ].join(' ')}
                >

                  {day.date && (
                    <>
                      <div className="flex items-center justify-between">

                        <span
                          className={[
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                            isToday(
                              day.date,
                            )
                              ? 'bg-[#527d71] text-white'
                              : 'text-[#68746f]',
                          ].join(' ')}
                        >
                          {day.day}
                        </span>

                        {dayItems.length >
                          0 && (
                          <span className="text-[9px] font-semibold text-[#78968b]">
                            {
                              dayItems.length
                            }
                          </span>
                        )}

                      </div>


                      <div className="mt-2 space-y-1">

                        {dayItems
                          .slice(
                            0,
                            2,
                          )
                          .map(
                            (
                              item,
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                className="truncate rounded-lg bg-[#e4f0eb] px-2 py-1 text-[9px] font-medium text-[#527d71]"
                              >
                                {
                                  item.title
                                }
                              </div>
                            ),
                          )}

                        {dayItems.length >
                          2 && (
                          <p className="px-1 text-[9px] text-[#929b96]">
                            +
                            {dayItems.length -
                              2}{' '}
                            more
                          </p>
                        )}

                      </div>

                    </>
                  )}

                </button>
              )
            },
          )}

        </div>

      </section>


      {/* SELECTED DAY */}

      {selectedDate && (
        <section className="mt-6 rounded-[28px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
                Selected day
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
                {formatDate(
                  selectedDate,
                )}
              </h2>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  '/tripwise/itinerary',
                )
              }
              className="rounded-xl bg-[#527d71] px-5 py-3 text-xs font-semibold text-white"
            >
              Edit itinerary
            </button>

          </div>


          <div className="mt-6 space-y-3">

            {selectedItems.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8d1c5] p-8 text-center">

                <p className="text-sm text-[#7f8984]">
                  Nothing planned for this day yet.
                </p>

              </div>
            ) : (
              selectedItems.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex gap-5 rounded-2xl border border-[#e4ded4] bg-[#faf8f2] p-4"
                  >

                    <div className="min-w-[75px]">

                      <p className="font-serif font-semibold text-[#527d71]">
                        {formatTime(
                          item.time,
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="font-medium text-[#334843]">
                        {item.title}
                      </p>

                      {item.location && (
                        <p className="mt-1 text-xs text-[#7f8984]">
                          📍{' '}
                          {item.location}
                        </p>
                      )}

                    </div>

                  </div>
                ),
              )
            )}

          </div>

        </section>
      )}

    </div>
  )
}


function buildCalendar(
  month,
) {
  const year =
    month.getFullYear()

  const monthIndex =
    month.getMonth()

  const firstDay =
    new Date(
      year,
      monthIndex,
      1,
    ).getDay()

  const daysInMonth =
    new Date(
      year,
      monthIndex + 1,
      0,
    ).getDate()

  const result = []


  for (
    let i = 0;
    i < firstDay;
    i += 1
  ) {
    result.push({
      date: null,
      day: '',
    })
  }


  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    const date =
      `${year}-${String(
        monthIndex + 1,
      ).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`

    result.push({
      date,
      day,
    })
  }


  while (
    result.length % 7 !==
    0
  ) {
    result.push({
      date: null,
      day: '',
    })
  }


  return result
}


function isToday(date) {
  const today =
    new Date()

  const todayString =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`

  return date ===
    todayString
}


function formatDate(date) {
  return new Intl.DateTimeFormat(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}


function formatTime(time) {
  const [
    hour,
    minute,
  ] = time.split(':')

  const date =
    new Date()

  date.setHours(
    Number(hour),
    Number(minute),
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  ).format(date)
}


function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d8e6e0] border-t-[#527d71]" />
    </div>
  )
}


export default TripCalendar