import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import clsx from "clsx"
import { EProductSize, EProductType, EProductStatus } from "@/enum/product"
import { format, isToday, isYesterday, subDays, isWithinInterval } from "date-fns"

// Size Badges
export const SizeBadge = ({ size }: { size: EProductSize }) => {
    return (
        <Badge
            className={clsx("flex items-center justify-center !px-3 !py-1 !rounded-full !text-xs", {
                "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200": size === EProductSize.S,
                "bg-slate-200 text-slate-800 hover:bg-slate-300 border-slate-300": size === EProductSize.M,
                "bg-slate-300 text-slate-800 hover:bg-slate-400 border-slate-400": size === EProductSize.L,
            })}
        >
            {size}
        </Badge>
    )
}


// Creation Date Badge
export const CreationDateBadge = ({ date }: { date: Date | string }) => {
    const createdDate = typeof date === "string" ? new Date(date) : date

    // Handle invalid dates
    if (isNaN(createdDate.getTime())) {
        return (
            <Badge
                variant="outline"
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 !rounded-full !text-xs"
            >
                <Clock className="h-3 w-3 mr-1" />
                Ngày không hợp lệ
            </Badge>
        )
    }

    const now = new Date()
    const oneWeekAgo = subDays(now, 7)
    const oneMonthAgo = subDays(now, 30)

    let badgeClass = ""
    let badgeText = ""

    if (isToday(createdDate)) {
        badgeClass = "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        badgeText = "Hôm nay"
    } else if (isYesterday(createdDate)) {
        badgeClass = "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
        badgeText = "Hôm qua"
    } else if (isWithinInterval(createdDate, { start: oneWeekAgo, end: now })) {
        badgeClass = "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
        badgeText = "Tuần này"
    } else if (isWithinInterval(createdDate, { start: oneMonthAgo, end: now })) {
        badgeClass = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
        badgeText = "Tháng này"
    } else {
        badgeClass = "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
        badgeText = format(createdDate, "dd/MM/yyyy")
    }

    return (
        <Badge variant="outline" className={`${badgeClass} !rounded-full !text-xs flex items-center`}>
            <Calendar className="h-3 w-3 mr-1" />
            {badgeText}
        </Badge>
    )
}

// Time Since Creation Badge
export const TimeSinceBadge = ({ date }: { date: Date | string }) => {
    const createdDate = typeof date === "string" ? new Date(date) : date

    // Handle invalid dates
    if (isNaN(createdDate.getTime())) {
        return (
            <Badge
                variant="outline"
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 !rounded-full !text-xs"
            >
                Không xác định
            </Badge>
        )
    }

    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInMonths = Math.floor(diffInDays / 30)

    let badgeClass = ""
    let badgeText = ""

    if (diffInMinutes < 5) {
        badgeClass = "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
        badgeText = "Vừa xong"
    } else if (diffInMinutes < 60) {
        badgeClass = "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        badgeText = `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
        badgeClass = "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
        badgeText = `${diffInHours} giờ trước`
    } else if (diffInDays < 30) {
        badgeClass = "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
        badgeText = `${diffInDays} ngày trước`
    } else {
        badgeClass = "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
        badgeText = `${diffInMonths} tháng trước`
    }

    return (
        <Badge variant="outline" className={`${badgeClass} !rounded-full !text-xs flex items-center`}>
            <Clock className="h-3 w-3 mr-1" />
            {badgeText}
        </Badge>
    )
}
