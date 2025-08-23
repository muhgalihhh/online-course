"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewChartProps {
  data: any[]
  title: string
  description?: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
}

export function OverviewChart({ 
  data, 
  title, 
  description, 
  categories, 
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString()
}: OverviewChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {categories.map((category, index) => (
                <linearGradient key={category} id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <XAxis 
              dataKey="name" 
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
            {categories.map((category, index) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[index % colors.length]}
                fill={`url(#color-${category})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}