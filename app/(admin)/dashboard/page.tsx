"use client"
import React from "react"
import {
    AreaChartInteractiveCustom,
    DayTimeChart,
    PieChartComponent,
    SalesPeakChart,
} from "@/components/chart"
import { SectionCards } from "@/components/section-card"
import RecentSalesCard from "@/components/recent-sales-card"
import { useDashboardSummary } from "@/hooks"

const Dashboard = () => {
    const params = {
        organizationId: "",
        storeId: "",
        kioskId: "",
        startDate: "",
        endDate: "",
    }

    const { order, kiosk, revenue, isLoading, error } = useDashboardSummary(params);

    console.log("Dashboard Summary:", { order, kiosk, revenue });


    return (
        <div>
            <h2 className="scroll-m-20 py-5 text-3xl font-semibold tracking-tight first:mt-0 px-6">
                Dashboard
            </h2>

            <div className="mb-5">
                <SectionCards />
            </div>

            <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {isLoading ? (
                        <div>Đang tải...</div>
                    ) : error ? (
                        <div>Lỗi tải dữ liệu</div>
                    ) : (
                        <PieChartComponent data={order.data} />
                    )}

                    <DayTimeChart />
                    <RecentSalesCard data={order.data?.recentOrders} />
                </div>

                <AreaChartInteractiveCustom />
                <div>
                    <SalesPeakChart />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
