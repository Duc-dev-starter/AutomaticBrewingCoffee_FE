"use client"

import React, { useState, useMemo, useCallback } from "react"
import { DayTimeChart, PieChartComponent, SalesPeakChart } from "@/components/chart"
import { SectionCards } from "@/components/section-card"
import RecentSalesCard from "@/components/recent-sales-card"
import { useDashboardSummary } from "@/hooks"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DateFilterGroup } from "@/components/dashboard/date-filter-group"

const MemoizedPieChart = React.memo(PieChartComponent)
const MemoizedDayTimeChart = React.memo(DayTimeChart)
const MemoizedRecentSalesCard = React.memo(RecentSalesCard)
const MemoizedSalesPeakChart = React.memo(SalesPeakChart)
const MemoizedSectionCards = React.memo(SectionCards)

const Dashboard = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    const params = useMemo(
        () => ({
            organizationId: "",
            storeId: "",
            kioskId: "",
            startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss") : "",
            endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss") : "",
            includeSunday: true,
        }),
        [dateRange],
    )

    const { order, kiosk, revenue, isLoading, error, account, orderTraffic, hourlyPeak, store } = useDashboardSummary(params)

    const handleDateChange = useCallback((range: DateRange) => {
        setDateRange(range)
    }, [])


    const errorComponent = useMemo(
        () => <div className="flex justify-center items-center h-screen">Lỗi tải dữ liệu: {error?.message}</div>,
        [error],
    )

    const SectionCardSkeleton = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </CardContent>
        </Card>
    );

    const SectionCardsSkeleton = () => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => <SectionCardSkeleton key={i} />)}
        </div>
    );

    const PieChartSkeleton = () => (
        <Card className="flex flex-col">
            <CardHeader className="items-start pb-0">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </CardContent>
            <CardFooter className="flex items-center justify-center flex-wrap gap-7 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-10" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </CardFooter>
        </Card>
    );

    const DayTimeChartSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[250px] w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    );

    const RecentSalesCardSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid gap-8">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="grid gap-1 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    const SalesPeakChartSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full" />
            </CardContent>
        </Card>
    );

    if (error) {
        return errorComponent
    }

    return (
        <div>
            <div className="flex justify-between items-center px-6 py-5">
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Dashboard</h2>

                <DateFilterGroup onDateChange={handleDateChange} dateRange={dateRange} />
            </div>

            <div className="mb-5 px-4 lg:px-6">
                {isLoading ? (
                    <SectionCardsSkeleton />
                ) : (
                    <MemoizedSectionCards order={order.data} kiosk={kiosk.data} revenue={revenue.data} account={account.data} store={store.data} />
                )}
            </div>

            <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {isLoading ? <PieChartSkeleton /> : <MemoizedPieChart data={order.data} />}
                    {isLoading ? <DayTimeChartSkeleton /> : <MemoizedDayTimeChart data={orderTraffic.data} />}
                    {isLoading ? <RecentSalesCardSkeleton /> : <MemoizedRecentSalesCard data={order.data?.recentOrders} />}
                </div>

                <div>
                    {isLoading ? <SalesPeakChartSkeleton /> : <MemoizedSalesPeakChart data={hourlyPeak.data} />}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
