"use client"

import { TrendingUp } from "lucide-react"
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    Legend,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { time: "Hai", day: 150, night: 134 },
    { time: "Ba", day: 180, night: 104 },
    { time: "Tư", day: 200, night: 84 },
    { time: "Năm", day: 170, night: 114 },
    { time: "Sáu", day: 190, night: 94 },
    { time: "Bảy", day: 220, night: 64 },
]

const chartConfig = {
    day: {
        label: "Ban ngày",
        color: "hsl(var(--chart-1))",
    },
    night: {
        label: "Ban đêm",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function DayTimeChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Biểu đồ khách hàng</CardTitle>
                <CardDescription>So sánh ban ngày và ban đêm (Thứ 2 - Thứ 7)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            bottom: 30,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                        <Line
                            dataKey="day"
                            name={chartConfig.day.label}
                            type="monotone"
                            stroke={chartConfig.day.color}
                            strokeWidth={2}
                            dot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: chartConfig.day.color,
                                fill: "white",
                            }}
                        />
                        <Line
                            dataKey="night"
                            name={chartConfig.night.label}
                            type="monotone"
                            stroke={chartConfig.night.color}
                            strokeWidth={2}
                            dot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: chartConfig.night.color,
                                fill: "white",
                            }}
                        />

                        <Legend
                            verticalAlign="top"
                            align="left"
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: 20 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Tăng 5.2% trong tháng này <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Hiển thị tổng số khách hàng trong 6 ngày qua
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
