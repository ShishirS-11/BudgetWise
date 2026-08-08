import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useCurrency } from '../context/CurrencyContext'

function SpendingChart({ data = [] }) {
  const {
    formatCurrency,
  } = useCurrency()

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111417] p-6 transition-colors duration-300">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-400">
            Spending activity
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-zinc-100">
            Spending trend
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Daily spending throughout this month.
          </p>
        </div>

        {data.length > 0 && (
          <div className="hidden items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 sm:flex">

            <span className="h-2 w-2 rounded-full bg-violet-400" />

            <span className="text-[11px] text-zinc-500">
              Daily spending
            </span>

          </div>
        )}

      </div>

      {/* ================================= */}
      {/* CHART */}
      {/* ================================= */}

      <div className="mt-7 h-[300px] w-full">

        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-700"
                >
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="m7 15 3-4 3 2 5-6" />
                </svg>

              </div>

              <p className="mt-3 text-sm text-zinc-500">
                No spending data yet.
              </p>

              <p className="mt-1 text-xs text-zinc-700">
                Your spending activity will appear here.
              </p>

            </div>

          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={data}
              margin={{
                top: 12,
                right: 8,
                left: -20,
                bottom: 4,
              }}
            >

              {/* ================================= */}
              {/* GRADIENT */}
              {/* ================================= */}

              <defs>

                <linearGradient
                  id="budgetwiseSpendingGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.24}
                  />

                  <stop
                    offset="55%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.08}
                  />

                  <stop
                    offset="100%"
                    stopColor="#8b5cf6"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              {/* ================================= */}
              {/* GRID */}
              {/* ================================= */}

              <CartesianGrid
                stroke="rgba(255,255,255,0.045)"
                vertical={false}
                horizontal={true}
              />

              {/* ================================= */}
              {/* X AXIS */}
              {/* ================================= */}

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                padding={{
                  left: 8,
                  right: 8,
                }}
                tick={{
                  fill: '#71717a',
                  fontSize: 11,
                  fontWeight: 400,
                }}
              />

              {/* ================================= */}
              {/* Y AXIS */}
              {/* ================================= */}

              <YAxis
                axisLine={false}
                tickLine={false}
                width={65}
                tick={{
                  fill: '#71717a',
                  fontSize: 11,
                  fontWeight: 400,
                }}
                tickFormatter={(value) =>
                  formatChartValue(
                    value,
                  )
                }
              />

              {/* ================================= */}
              {/* TOOLTIP */}
              {/* ================================= */}

              <Tooltip
                cursor={false}
                wrapperStyle={{
                  outline: 'none',
                  zIndex: 100,
                }}
                contentStyle={{
                  backgroundColor:
                    '#171a1e',
                  border:
                    '1px solid rgba(255,255,255,0.08)',
                  borderRadius:
                    '14px',
                  padding:
                    '12px 14px',
                  boxShadow:
                    '0 18px 45px rgba(0,0,0,0.38)',
                  outline: 'none',
                }}
                labelStyle={{
                  color: '#f4f4f5',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
                itemStyle={{
                  color: '#a78bfa',
                  fontSize: '12px',
                  padding: 0,
                }}
                separator=": "
                labelFormatter={(day) =>
                  `Day ${day}`
                }
                formatter={(value) => [
                  formatCurrency(
                    Number(value || 0),
                  ),
                  'Spent',
                ]}
              />

              {/* ================================= */}
              {/* AREA */}
              {/* ================================= */}

              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2.2}
                fill="url(#budgetwiseSpendingGradient)"
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#a78bfa',
                  stroke: '#171a1e',
                  strokeWidth: 2,
                }}
                animationDuration={700}
                animationEasing="ease-out"
              />

            </AreaChart>

          </ResponsiveContainer>
        )}

      </div>

    </div>
  )
}

/*
 * =========================================
 * COMPACT AXIS VALUE
 * =========================================
 *
 * The actual tooltip uses formatCurrency()
 * so it follows the selected currency.
 *
 * The Y-axis is kept compact to avoid
 * taking too much horizontal space.
 */

function formatChartValue(value) {
  const number = Number(value || 0)

  if (number >= 1000000) {
    return `${(
      number / 1000000
    ).toFixed(1)}M`
  }

  if (number >= 1000) {
    return `${(
      number / 1000
    ).toFixed(1)}K`
  }

  return number.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 0,
    },
  )
}

export default SpendingChart