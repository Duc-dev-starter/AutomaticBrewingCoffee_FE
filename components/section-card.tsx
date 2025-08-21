import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { AccountSummary, KioskSummary, OrderSummary, RevenueSummary } from "@/interfaces/dashboard"

interface SectionCardsProps {
    order?: OrderSummary
    kiosk?: KioskSummary
    revenue?: RevenueSummary
    account?: AccountSummary
}

export function SectionCards({ order, kiosk, revenue, account }: SectionCardsProps) {
    const isRevenueUp = (revenue?.growthRatePercent ?? 0) > 0
    const TrendIcon = isRevenueUp ? TrendingUpIcon : TrendingDownIcon

    const activeKioskRate =
        kiosk && typeof kiosk.total === "number" && kiosk.total > 0 ? ((kiosk.active / kiosk.total) * 100).toFixed(1) : "0"
    const activeAccountRate =
        account && typeof account.total === "number" && account.total > 0
            ? ((account.active / account.total) * 100).toFixed(1)
            : "0"

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Tổng Doanh Thu</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        ${revenue?.revenue.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendIcon className="size-3" />
                            {isRevenueUp ? "+" : ""}
                            {revenue?.growthRatePercent}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Xu hướng {isRevenueUp ? "tăng" : "giảm"} tháng này <TrendIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Doanh thu trong kỳ trước</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Tổng Đơn Hàng</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {order?.total.toLocaleString("vi-VN")}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +0%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Ổn định trong kỳ này <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Tổng số đơn hàng đã xử lý</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Tài Khoản Hoạt Động</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {account?.active.toLocaleString("vi-VN")}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            {activeAccountRate}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {activeAccountRate}% hoạt động <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Mức độ tương tác vượt mục tiêu</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Kiosk Hoạt Động</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {kiosk?.active.toLocaleString("vi-VN")}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            {activeKioskRate}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {activeKioskRate}% hoạt động <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Mức độ tương tác kiosk tốt</div>
                </CardFooter>
            </Card>
        </div>
    )
}
