"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { month: "December", actual: 100, expected: 80 },
    { month: "January", actual: 100, expected: 80 },
    { month: "February", actual: 200, expected: 50 },
]

const chartConfig = {
    actual: {
        label: "Actual Result",
        color: "hsl(var(--chart-1))",
    },
    expected: {
        label: "Expected Result",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function BarChartComponent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Stacked + Legend</CardTitle>
                <CardDescription>December - February 2024-2025</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="actual"
                            stackId="a"
                            fill={chartConfig.actual.color}
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="expected"
                            stackId="a"
                            fill={chartConfig.expected.color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="size-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 3 months
                </div>
            </CardFooter>
        </Card>
    )
}