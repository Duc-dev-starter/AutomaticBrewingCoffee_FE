"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const presets = [
    { value: "today", label: "Hôm nay", range: { from: new Date(), to: new Date() } },
    { value: "7days", label: "7 ngày qua", range: { from: new Date(Date.now() - 6 * 86400000), to: new Date() } },
    { value: "30days", label: "30 ngày qua", range: { from: new Date(Date.now() - 29 * 86400000), to: new Date() } },
    { value: "90days", label: "90 ngày qua", range: { from: new Date(Date.now() - 89 * 86400000), to: new Date() } },
    {
        value: "thisMonth",
        label: "Tháng này",
        range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() },
    },
    {
        value: "lastMonth",
        label: "Tháng trước",
        range: {
            from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
    },
]

export function DatePresetSelect({
    onChange,
    value,
}: {
    onChange: (range: DateRange) => void
    value?: string
}) {
    const handlePresetChange = useCallback(
        (presetValue: string) => {
            const preset = presets.find((p) => p.value === presetValue)
            if (preset) {
                onChange(preset.range)
            }
        },
        [onChange],
    )

    return (
        <Select value={value} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
                {presets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export function DateCustomFilter({
    onChange,
    value,
}: {
    onChange: (range: DateRange) => void
    value?: DateRange
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    {value?.from && value?.to
                        ? `${format(value.from, "dd/MM/yyyy", { locale: vi })} - ${format(value.to, "dd/MM/yyyy", { locale: vi })}`
                        : "Chọn ngày tùy chỉnh"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                    mode="range"
                    locale={vi}
                    selected={value}
                    onSelect={(range) => range && onChange(range)}
                    numberOfMonths={2}
                    className="rounded-md border"
                />
            </PopoverContent>
        </Popover>
    )
}

export default function DateFilterGroup({
    onDateChange,
    dateRange,
}: {
    onDateChange?: (range: DateRange) => void
    dateRange?: DateRange
}) {
    const [selectedPreset, setSelectedPreset] = useState<string>()

    const handleDateChange = useCallback(
        (range: DateRange) => {
            onDateChange?.(range)
            // Clear preset selection when custom date is selected
            setSelectedPreset(undefined)
        },
        [onDateChange],
    )

    const handlePresetChange = useCallback(
        (range: DateRange) => {
            onDateChange?.(range)
            // Find and set the preset value
            const preset = presets.find(
                (p) =>
                    p.range.from.toDateString() === range.from?.toDateString() &&
                    p.range.to.toDateString() === range.to?.toDateString(),
            )
            setSelectedPreset(preset?.value)
        },
        [onDateChange],
    )

    return (
        <div className="flex flex-wrap items-center gap-3">
            <DatePresetSelect onChange={handlePresetChange} value={selectedPreset} />
            <DateCustomFilter onChange={handleDateChange} value={dateRange} />
        </div>
    )
}
