'use client'
import React from 'react'

import { AreaChartInteractiveCustom, DayTimeChart, PieChartComponent, SalesPeakChart } from '@/components/chart'
import CalendarPicker from '@/components/calendar-picker'
import { SectionCards } from '@/components/section-card'
import RecentSalesCard from '@/components/recent-sales-card'



const Dashboard = () => {

    return (
        <>
            <div>
                <div>
                    <h2 className="scroll-m-20 py-5 text-3xl font-semibold tracking-tight first:mt-0 px-6">
                        Dashboard
                    </h2>
                </div>
                {/* <div className='my-5 mr-5 flex justify-end'>
                <CalendarPicker />
                </div> */}
                <div className='mb-5'>
                    <SectionCards />
                </div>
                <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <PieChartComponent />
                        <DayTimeChart />
                        <RecentSalesCard />
                    </div>
                    <AreaChartInteractiveCustom />
                    <div>
                        <SalesPeakChart />
                    </div>

                    <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>

            </div>
        </>
    )
}

export default Dashboard