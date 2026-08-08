import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const spendingData = [
  { day: '1', amount: 450 },
  { day: '2', amount: 320 },
  { day: '3', amount: 780 },
  { day: '4', amount: 520 },
  { day: '5', amount: 950 },
  { day: '6', amount: 420 },
  { day: '7', amount: 680 },
  { day: '8', amount: 1_250 },
  { day: '9', amount: 0 },
  { day: '10', amount: 820 },
  { day: '11', amount: 1_100 },
  { day: '12', amount: 560 },
  { day: '13', amount: 900 },
  { day: '14', amount: 740 },
  { day: '15', amount: 1_300 },
]

function SpendingChart() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-zinc-100">
          Spending trend
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Daily spending throughout August.
        </p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={spendingData}
            margin={{
              top: 10,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="spendingGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#71717a',
                fontSize: 12,
              }}
              tickFormatter={(value) => `${value}`}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#71717a',
                fontSize: 12,
              }}
              tickFormatter={(value) => `₹${value}`}
            />

            <Tooltip
              cursor={{
                stroke: 'rgba(255,255,255,0.1)',
              }}
              contentStyle={{
                backgroundColor: '#181b1f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#f4f4f5',
              }}
              labelFormatter={(day) => `August ${day}`}
              formatter={(value) => [
                `₹${Number(value).toLocaleString('en-IN')}`,
                'Spent',
              ]}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#spendingGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#8b5cf6',
                stroke: '#111417',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SpendingChart