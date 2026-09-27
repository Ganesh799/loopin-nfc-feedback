'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'

export function RatingDistributionChart({ data }: { data: { rating: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="rating" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FeedbackTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
        <Tooltip cursor={{ stroke: '#e2e8f0' }} />
        <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
