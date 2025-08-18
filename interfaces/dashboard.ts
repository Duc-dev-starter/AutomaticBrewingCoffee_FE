import { Order } from "./order"

export interface OrderSummary {
    total: number
    pending: number
    preparing: number
    completed: number
    cancelled: number
    failed: number
    recentOrders: Order[];
}

export interface RevenueSummary {
    growthRatePercent: number
    revenue: number
}

export interface KioskSummary {
    total: number
    active: number
    inactive: number
}