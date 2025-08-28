"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceDot } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { HourlyPeak } from "@/interfaces/dashboard"


interface SalesPeakChartProps {
    data?: HourlyPeak
}

const chartConfig = {
    totalAmount: {
        label: "Doanh số",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function SalesPeakChart({ data }: SalesPeakChartProps) {
    const chartData = data?.points?.map((point) => ({
        hour: point.hour,
        totalAmount: point.totalAmount,
        isPeak: point.isPeak,
        orderCount: point.orderCount,
    })) || [
            { hour: "06:00", totalAmount: 186000, isPeak: false, orderCount: 12 },
            { hour: "07:00", totalAmount: 305000, isPeak: false, orderCount: 18 },
            { hour: "08:00", totalAmount: 237000, isPeak: false, orderCount: 15 },
            { hour: "09:00", totalAmount: 273000, isPeak: false, orderCount: 16 },
            { hour: "10:00", totalAmount: 209000, isPeak: false, orderCount: 14 },
            { hour: "11:00", totalAmount: 414000, isPeak: true, orderCount: 25 },
            { hour: "12:00", totalAmount: 314000, isPeak: false, orderCount: 20 },
        ]

    const peak = data?.peak || chartData.find((item) => item.isPeak) || chartData[5]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đỉnh doanh số theo giờ</CardTitle>
                <CardDescription>
                    {data ? `Từ ${data.windowStartHour} đến ${data.windowEndHour}` : "Doanh số theo giờ trong ngày"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => [`${(Number(value) / 1000).toFixed(0)}K VNĐ`]}
                                />
                            }
                        />
                        <Line dataKey="totalAmount" type="monotone" stroke="var(--color-totalAmount)" strokeWidth={2} dot={false} />
                        <ReferenceDot
                            x={peak.hour}
                            y={peak.orderCount}
                            r={6}
                            fill="hsl(var(--destructive))"
                            stroke="white"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
