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
import { useOrderSummary } from "@/hooks"

const Dashboard = () => {
    const params = {
        organizationId: "",
        storeId: "",
        kioskId: "",
        startDate: "",
        endDate: "",
    }

    const { data, isLoading, error } = useOrderSummary(params)

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
                        <PieChartComponent data={data} />
                    )}

                    <DayTimeChart />
                    <RecentSalesCard />
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
