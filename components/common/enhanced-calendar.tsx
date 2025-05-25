"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Locale } from "date-fns"

interface EnhancedCalendarProps {
    mode: "single"
    selected?: Date | null
    onSelect: (date: Date | null) => void
    locale?: Locale
    disabled?: boolean | ((date: Date) => boolean)
    initialFocus?: boolean
    className?: string
}

export function EnhancedCalendar({
    mode = "single",
    selected,
    onSelect,
    locale = vi,
    disabled,
    initialFocus,
    className,
}: EnhancedCalendarProps) {
    // Khởi tạo với ngày hiện tại hoặc ngày đã chọn
    const [currentDate, setCurrentDate] = useState(selected || new Date())

    // Cập nhật khi selected thay đổi
    useEffect(() => {
        if (selected) {
            setCurrentDate(selected)
        }
    }, [selected])

    // Kiểm tra có disabled function không
    const hasDisabledFunction = typeof disabled === "function"

    // Tạo danh sách năm (chỉ khi không có disabled function)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 110 }, (_, i) => currentYear - 99 + i)

    // Tạo danh sách tháng
    const months = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ]

    // Kiểm tra tháng có hợp lệ không (có ít nhất 1 ngày không bị disabled)
    const isMonthValid = (year: number, month: number) => {
        if (!hasDisabledFunction) return true

        const daysInMonth = new Date(year, month + 1, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            if (!disabled(date)) {
                return true
            }
        }
        return false
    }

    // Kiểm tra năm có hợp lệ không
    const isYearValid = (year: number) => {
        if (!hasDisabledFunction) return true

        for (let month = 0; month < 12; month++) {
            if (isMonthValid(year, month)) {
                return true
            }
        }
        return false
    }

    // Kiểm tra có thể navigate đến tháng trước/sau không
    const canNavigateToPrevMonth = () => {
        if (!hasDisabledFunction) return true
        const prevMonth = subMonths(currentDate, 1)
        return isMonthValid(prevMonth.getFullYear(), prevMonth.getMonth())
    }

    const canNavigateToNextMonth = () => {
        if (!hasDisabledFunction) return true
        const nextMonth = addMonths(currentDate, 1)
        return isMonthValid(nextMonth.getFullYear(), nextMonth.getMonth())
    }

    // Xử lý khi thay đổi tháng
    const handleMonthChange = (monthIndex: number) => {
        const year = currentDate.getFullYear()
        if (isMonthValid(year, monthIndex)) {
            const newDate = new Date(currentDate)
            newDate.setMonth(monthIndex)
            setCurrentDate(newDate)
        }
    }

    // Xử lý khi thay đổi năm
    const handleYearChange = (year: number) => {
        if (isYearValid(year)) {
            const newDate = new Date(currentDate)
            newDate.setFullYear(year)
            // Nếu tháng hiện tại không hợp lệ trong năm mới, chuyển về tháng hợp lệ đầu tiên
            if (!isMonthValid(year, newDate.getMonth())) {
                for (let month = 0; month < 12; month++) {
                    if (isMonthValid(year, month)) {
                        newDate.setMonth(month)
                        break
                    }
                }
            }
            setCurrentDate(newDate)
        }
    }

    // Xử lý khi chọn ngày
    const handleDateSelect = (dayObj: { day: number; month: number; year: number; isCurrentMonth: boolean }) => {
        const newDate = new Date(dayObj.year, dayObj.month, dayObj.day)

        // Cập nhật currentDate nếu chọn ngày từ tháng khác
        if (!dayObj.isCurrentMonth) {
            setCurrentDate(newDate)
        }

        onSelect(newDate)
    }

    // Tạo lưới ngày trong tháng
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        const firstDayOfMonth = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const prevMonthDays = []
        const prevMonth = month === 0 ? 11 : month - 1
        const prevMonthYear = month === 0 ? year - 1 : year
        const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

        for (let i = 0; i < firstDayOfMonth; i++) {
            prevMonthDays.push({
                day: daysInPrevMonth - firstDayOfMonth + i + 1,
                month: prevMonth,
                year: prevMonthYear,
                isCurrentMonth: false,
            })
        }

        const currentMonthDays = []
        for (let i = 1; i <= daysInMonth; i++) {
            currentMonthDays.push({
                day: i,
                month,
                year,
                isCurrentMonth: true,
            })
        }

        const nextMonthDays = []
        const nextMonth = month === 11 ? 0 : month + 1
        const nextMonthYear = month === 11 ? year + 1 : year
        const totalDaysToShow = 42
        const remainingDays = totalDaysToShow - prevMonthDays.length - currentMonthDays.length

        for (let i = 1; i <= remainingDays; i++) {
            nextMonthDays.push({
                day: i,
                month: nextMonth,
                year: nextMonthYear,
                isCurrentMonth: false,
            })
        }

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
    }

    // Kiểm tra ngày có bị vô hiệu hóa không
    const isDateDisabled = (date: Date) => {
        if (typeof disabled === "boolean") return disabled
        if (typeof disabled === "function") return disabled(date)
        return false
    }

    const days = generateCalendarDays()

    return (
        <div className={cn("p-3", className)}>
            {/* Chỉ hiển thị dropdown khi không có disabled function */}
            {!hasDisabledFunction && (
                <div className="flex items-center justify-between mb-2">
                    <Select
                        value={currentDate.getMonth().toString()}
                        onValueChange={(value) => handleMonthChange(Number.parseInt(value))}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Tháng" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={currentDate.getFullYear().toString()}
                        onValueChange={(value) => handleYearChange(Number.parseInt(value))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Năm" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Navigation với validation */}
            <div className="flex items-center justify-between mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="h-7 w-7"
                    disabled={!canNavigateToPrevMonth()}
                >
                    <span className="sr-only">Tháng trước</span>
                    &lt;
                </Button>

                <div className="text-sm font-medium">{format(currentDate, "MMMM yyyy", { locale })}</div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="h-7 w-7"
                    disabled={!canNavigateToNextMonth()}
                >
                    <span className="sr-only">Tháng sau</span>
                    &gt;
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div className="py-1">CN</div>
                <div className="py-1">T2</div>
                <div className="py-1">T3</div>
                <div className="py-1">T4</div>
                <div className="py-1">T5</div>
                <div className="py-1">T6</div>
                <div className="py-1">T7</div>
            </div>

            <div className="grid grid-cols-7 gap-1 mt-1">
                {days.map((day, index) => {
                    const date = new Date(day.year, day.month, day.day)
                    const isSelected =
                        selected &&
                        selected.getDate() === day.day &&
                        selected.getMonth() === day.month &&
                        selected.getFullYear() === day.year

                    const isDisabled = isDateDisabled(date)

                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 p-0 font-normal",
                                !day.isCurrentMonth && "text-muted-foreground opacity-50",
                                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                isDisabled && "opacity-50 cursor-not-allowed",
                            )}
                            disabled={isDisabled}
                            onClick={() => handleDateSelect(day)}
                        >
                            {day.day}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
