import { string } from "zod"
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

export interface OrderTrafficSummary {
    windowDays: number;
    totalCurrentPeriod: number;
    totalPreviousPeriod: number;
    trafficByShift: OrderTrafficByShift[];
}

export interface OrderTrafficByShift {
    dow: number;
    dowLabel: string;
    shift: string;
    count: number;
}

export interface StoreSummary {
    total: number
    active: number
    inactive: number
}

export interface AccountSummary {
    total: number
    active: number
    inactive: number
}

export interface OrganizationSummary {
    total: number
    active: number
    inactive: number
}

export interface HourlyPeak {
    windowStartHour: string;
    windowEndHour: string;
    points: Point[];
    peak: Peak;
}

export interface Peak {
    hour: string,
    totalAmount: number,
    isPeak: boolean,
    orderCount: number
}

export interface Point {
    hour: string,
    totalAmount: number,
    isPeak: boolean,
    orderCount: number
}