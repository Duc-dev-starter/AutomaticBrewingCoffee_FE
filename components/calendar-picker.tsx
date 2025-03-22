"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const CalendarPicker = () => {
    // State để lưu ngày được chọn
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Hàm gọi API khi chọn ngày
    const fetchDashboardData = async (selectedDate: Date | undefined) => {
        if (!selectedDate) return
        const formattedDate = format(selectedDate, "yyyy-MM-dd") // Định dạng ngày gửi lên API
        try {
            const response = await fetch(`/api/dashboard?date=${formattedDate}`)
            const data = await response.json()

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        {date ? format(date, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                            setDate(selectedDate) // Cập nhật ngày
                            fetchDashboardData(selectedDate) // Fetch API ngay khi chọn
                        }}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        locale={vi}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
export default CalendarPicker