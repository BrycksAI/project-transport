'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS: Record<string, string> = {
  created: '#9CA3AF',
  assigned: '#3B82F6',
  loading: '#EAB308',
  in_transit: '#22C55E',
  delivered: '#16A34A',
  cancelled: '#EF4444',
}

const LABELS: Record<string, string> = {
  created: 'Aangemaakt',
  assigned: 'Toegewezen',
  loading: 'Laden',
  in_transit: 'Onderweg',
  delivered: 'Afgeleverd',
  cancelled: 'Geannuleerd',
}

export function OrdersChart({ data }: {
  data?: Record<string, number>
}) {
  if (!data) return <p className="text-sm text-muted-foreground">Geen data</p>

  const chartData = Object.entries(data)
    .filter(([key]) => key !== 'cancelled')
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      waarde: value,
      color: COLORS[key] || '#9CA3AF',
    }))

  if (chartData.every(d => d.waarde === 0)) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Nog geen ritten om weer te geven.</p>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="waarde" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
