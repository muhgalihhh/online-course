"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
    label: string
  }
}

export function ChartCard({ title, description, children, trend }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm shrink-0">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
                {trend.value}
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
}

export function BarChartComponent({
  data,
  index,
  categories,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 50
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
          width={yAxisWidth}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {label}
                      </span>
                      {payload.map((entry: any, index: number) => (
                        <span key={index} className="font-bold text-muted-foreground">
                          {entry.name}: {valueFormatter(entry.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

interface LineChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
}

export function LineChartComponent({
  data,
  index,
  categories,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 50
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
          width={yAxisWidth}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {label}
                      </span>
                      {payload.map((entry: any, index: number) => (
                        <span key={index} className="font-bold text-muted-foreground">
                          {entry.name}: {valueFormatter(entry.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data: { name: string; value: number }[]
  colors?: string[]
}

export function PieChartComponent({
  data,
  colors = ["#1e3a8a", "#1e40af", "#3730a3", "#312e81", "#1e3a8a", "#06b6d4"]
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      {payload[0].name}
                    </span>
                    <span className="font-bold text-muted-foreground">
                      {payload[0].value}
                    </span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
