"use client"
import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
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
import { textPieChart } from "@/utils/text"
import { OrderSummary } from "@/interfaces/dashboard"

const chartConfig = {
    value: { label: "Total" },
    pending: { label: "Đang chờ", color: "hsl(var(--warning))" },
    preparing: { label: "Đang chuẩn bị", color: "hsl(var(--chart-1))" },
    completed: { label: "Hoàn tất", color: "hsl(var(--success))" },
    cancelled: { label: "Đã hủy", color: "hsl(var(--muted))" },
    failed: { label: "Thất bại", color: "hsl(var(--destructive))" },
} satisfies ChartConfig



export function PieChartComponent({ data }: { data?: OrderSummary }) {
    const chartData = React.useMemo(() => {
        if (!data) return []
        return [
            { status: "pending", value: data.pending, fill: "hsl(var(--warning))" },
            { status: "preparing", value: data.preparing, fill: "hsl(var(--chart-1))" },
            { status: "completed", value: data.completed, fill: "hsl(var(--success))" },
            { status: "cancelled", value: data.cancelled, fill: "hsl(var(--muted))" },
            { status: "failed", value: data.failed, fill: "hsl(var(--destructive))" },
        ]
    }, [data])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-start pb-0">
                <div className="flex gap-5 mb-4">
                    <CardTitle>Đơn đặt hàng</CardTitle>
                    <CardDescription>Thống kê theo thời gian</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {data?.total ?? 0}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Đơn đặt hàng
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex items-center justify-center flex-wrap gap-7 text-sm mt-4">
                {chartData.map(item => (
                    <div key={item.status} className="flex items-center gap-4 text-sm">
                        <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-xl">{item.value}</span>
                            <span className="capitalize">{textPieChart(item.status)}</span>
                        </div>
                    </div>
                ))}
            </CardFooter>
        </Card>
    )
}
