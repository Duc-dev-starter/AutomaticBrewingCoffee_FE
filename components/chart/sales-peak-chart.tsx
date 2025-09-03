"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceDot } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { HourlyPeak } from "@/interfaces/dashboard"

interface SalesPeakChartProps {
    data?: HourlyPeak
}

const chartConfig = {
    orderCount: {
        label: "Số đơn",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function SalesPeakChart({ data }: SalesPeakChartProps) {
    // Lọc dữ liệu từ 05:00 - 20:00
    const chartData = data?.points
        ?.filter((p) => {
            const hour = parseInt(p.hour.split(":")[0], 10)
            return hour >= 5 && hour <= 20
        })
        .map((point) => ({
            hour: point.hour,
            orderCount: point.orderCount,
            isPeak: point.isPeak,
        })) || []

    // Tìm max orderCount và làm tròn lên bội số 10
    const maxOrder = Math.max(...chartData.map((d) => d.orderCount), 0)
    const yMax = Math.ceil(maxOrder / 10) * 10

    const peak = data?.peak || chartData.find((item) => item.isPeak) || chartData[0]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đỉnh số đơn theo giờ</CardTitle>
                <CardDescription>
                    {data ? `Từ 05:00 đến 20:00` : "Số đơn hàng theo giờ trong ngày"}
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
                            domain={[0, yMax]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(_, __, item) => {
                                        const { orderCount, totalAmount } = item.payload
                                        return [
                                            `${orderCount} đơn - ${(totalAmount / 1000).toFixed(0)}K VNĐ`,
                                            "Chi tiết",
                                        ]
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey="orderCount"
                            type="monotone"
                            stroke="var(--color-orderCount)"
                            strokeWidth={2}
                            dot={false}
                        />
                        {peak && (
                            <ReferenceDot
                                x={peak.hour}
                                y={peak.orderCount}
                                r={6}
                                fill="hsl(var(--destructive))"
                                stroke="white"
                                strokeWidth={2}
                            />
                        )}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
