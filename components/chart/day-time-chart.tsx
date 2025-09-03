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
import { OrderTrafficSummary } from "@/interfaces/dashboard"

interface DayTimeChartProps {
    data?: OrderTrafficSummary;
}

export function DayTimeChart({ data }: DayTimeChartProps) {
    // Lấy danh sách ngày duy nhất từ API
    const uniqueDays = Array.from(new Set(data?.trafficByShift.map(d => d.dowLabel)))

    // Tạo dữ liệu chart ban đầu
    const chartData = uniqueDays.map(day => ({
        time: day,
        day: 0,
        night: 0,
    }))

    // Fill dữ liệu vào chartData
    data?.trafficByShift.forEach((item) => {
        const dayIndex = chartData.findIndex((d) => d.time === item.dowLabel)
        if (dayIndex !== -1) {
            if (item.shift === "day") {
                chartData[dayIndex].day = item.count
            } else if (item.shift === "night") {
                chartData[dayIndex].night = item.count
            }
        }
    })

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Biểu đồ khách hàng</CardTitle>
                <CardDescription>
                    {data
                        ? `So sánh ban ngày và ban đêm (${data.windowDayType})`
                        : "So sánh ban ngày và ban đêm"}
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
                            Tăng {data?.growthRate} trong {data?.windowDayType} <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Hiển thị tổng số khách hàng trong {data?.windowDayType || "khoảng thời gian"}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
