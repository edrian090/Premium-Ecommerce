'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: ChartPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-2xl shadow-xl p-4 text-sm min-w-[160px]">
        <p className="font-bold text-neutral-800 mb-2.5 pb-2 border-b border-neutral-100">
          {new Date(label + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-neutral-500 capitalize text-xs">{entry.name}</span>
            </div>
            <span className="font-bold text-neutral-800 text-sm">
              {entry.name === 'revenue' ? `$${entry.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data }: SalesChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F3460" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0F3460" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E94560" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#E94560" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval={4}
          dy={8}
        />
        <YAxis
          yAxisId="revenue"
          orientation="left"
          tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          width={55}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#0F3460', strokeWidth: 1, strokeDasharray: '5 5', strokeOpacity: 0.3 }}
        />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="#0F3460"
          strokeWidth={2.5}
          fill="url(#colorRevenue)"
          dot={false}
          activeDot={{
            r: 5,
            strokeWidth: 2,
            stroke: '#fff',
            fill: '#0F3460',
          }}
        />
        <Area
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="#E94560"
          strokeWidth={2}
          fill="url(#colorOrders)"
          dot={false}
          activeDot={{
            r: 5,
            strokeWidth: 2,
            stroke: '#fff',
            fill: '#E94560',
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
