"use client"

import React, { useState, useMemo, useCallback } from "react"
import { AreaChartInteractiveCustom, DayTimeChart, PieChartComponent, SalesPeakChart } from "@/components/chart"
import { SectionCards } from "@/components/section-card"
import RecentSalesCard from "@/components/recent-sales-card"
import { useDashboardSummary } from "@/hooks"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import DateFilterGroup from "@/components/dashboard/date-filter-group"

const MemoizedPieChart = React.memo(PieChartComponent)
const MemoizedDayTimeChart = React.memo(DayTimeChart)
const MemoizedRecentSalesCard = React.memo(RecentSalesCard)
const MemoizedAreaChart = React.memo(AreaChartInteractiveCustom)
const MemoizedSalesPeakChart = React.memo(SalesPeakChart)
const MemoizedSectionCards = React.memo(SectionCards)

const Dashboard = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    const params = useMemo(
        () => ({
            organizationId: "",
            storeId: "",
            kioskId: "",
            startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
            endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
        }),
        [dateRange],
    )

    const { order, kiosk, revenue, isLoading, error, account, orderTraffic } = useDashboardSummary(params)

    const handleDateChange = useCallback((range: DateRange) => {
        setDateRange(range)
    }, [])

    const loadingComponent = useMemo(
        () => <div className="flex justify-center items-center h-screen">Đang tải...</div>,
        [],
    )

    const errorComponent = useMemo(
        () => <div className="flex justify-center items-center h-screen">Lỗi tải dữ liệu: {error?.message}</div>,
        [error],
    )

    if (isLoading) {
        return loadingComponent
    }

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
                <MemoizedSectionCards order={order.data} kiosk={kiosk.data} revenue={revenue.data} account={account.data} />
            </div>

            <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <MemoizedPieChart data={order.data} />
                    <MemoizedDayTimeChart data={orderTraffic.data} />
                    <MemoizedRecentSalesCard data={order.data?.recentOrders} />
                </div>

                <MemoizedAreaChart />
                <div>
                    <MemoizedSalesPeakChart />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
