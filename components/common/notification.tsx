"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Mock data based on your interfaces
const mockNotifications = [
    {
        notificationId: "1",
        title: "Đơn hàng mới",
        message: "Bạn có một đơn hàng mới từ khách hàng Nguyễn Văn A",
        notificationType: "ORDER",
        referenceId: "ORD-001",
        referenceType: "ORDER",
        severity: "HIGH",
        createdBy: "system",
        createdAt: "2024-01-15T10:30:00Z",
        notificationRecipients: [
            {
                notificationRecipientId: "1",
                notificationId: "1",
                accountRole: "ADMIN",
                accountId: "admin-1",
                isRead: false,
                account: {
                    accountId: "admin-1",
                    username: "admin",
                    email: "admin@example.com",
                },
            },
        ],
    },
    {
        notificationId: "2",
        title: "Thanh toán thành công",
        message: "Thanh toán cho đơn hàng #ORD-002 đã được xử lý thành công",
        notificationType: "PAYMENT",
        referenceId: "PAY-001",
        referenceType: "PAYMENT",
        severity: "MEDIUM",
        createdBy: "system",
        createdAt: "2024-01-15T09:15:00Z",
        notificationRecipients: [
            {
                notificationRecipientId: "2",
                notificationId: "2",
                accountRole: "ADMIN",
                accountId: "admin-1",
                isRead: false,
                account: {
                    accountId: "admin-1",
                    username: "admin",
                    email: "admin@example.com",
                },
            },
        ],
    },
    {
        notificationId: "3",
        title: "Cập nhật hệ thống",
        message: "Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai",
        notificationType: "SYSTEM",
        referenceId: "SYS-001",
        referenceType: "SYSTEM",
        severity: "LOW",
        createdBy: "system",
        createdAt: "2024-01-15T08:00:00Z",
        notificationRecipients: [
            {
                notificationRecipientId: "3",
                notificationId: "3",
                accountRole: "ADMIN",
                accountId: "admin-1",
                isRead: true,
                readDate: "2024-01-15T08:30:00Z",
                account: {
                    accountId: "admin-1",
                    username: "admin",
                    email: "admin@example.com",
                },
            },
        ],
    },
    {
        notificationId: "4",
        title: "Khách hàng mới đăng ký",
        message: "Khách hàng Trần Thị B vừa đăng ký tài khoản mới",
        notificationType: "USER",
        referenceId: "USER-001",
        referenceType: "USER",
        severity: "MEDIUM",
        createdBy: "system",
        createdAt: "2024-01-15T07:45:00Z",
        notificationRecipients: [
            {
                notificationRecipientId: "4",
                notificationId: "4",
                accountRole: "ADMIN",
                accountId: "admin-1",
                isRead: false,
                account: {
                    accountId: "admin-1",
                    username: "admin",
                    email: "admin@example.com",
                },
            },
        ],
    },
    {
        notificationId: "5",
        title: "Báo cáo doanh thu",
        message: "Báo cáo doanh thu tháng 1 đã sẵn sàng để xem",
        notificationType: "REPORT",
        referenceId: "RPT-001",
        referenceType: "REPORT",
        severity: "LOW",
        createdBy: "system",
        createdAt: "2024-01-15T06:00:00Z",
        notificationRecipients: [
            {
                notificationRecipientId: "5",
                notificationId: "5",
                accountRole: "ADMIN",
                accountId: "admin-1",
                isRead: false,
                account: {
                    accountId: "admin-1",
                    username: "admin",
                    email: "admin@example.com",
                },
            },
        ],
    },
]

interface NotificationBellProps {
    className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
    const [notifications, setNotifications] = useState(mockNotifications)
    const [isOpen, setIsOpen] = useState(false)

    const unreadCount = notifications.filter((n) => !n.notificationRecipients[0]?.isRead).length

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return "Vừa xong"
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "HIGH":
                return "bg-red-100 text-red-800 border-red-200"
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "LOW":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "ORDER":
                return "🛒"
            case "PAYMENT":
                return "💳"
            case "SYSTEM":
                return "⚙️"
            case "USER":
                return "👤"
            case "REPORT":
                return "📊"
            default:
                return "📢"
        }
    }

    const markAsRead = (notificationId: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.notificationId === notificationId
                    ? {
                        ...notification,
                        notificationRecipients: notification.notificationRecipients.map((recipient) => ({
                            ...recipient,
                            isRead: true,
                            readDate: new Date().toISOString(),
                        })),
                    }
                    : notification,
            ),
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({
                ...notification,
                notificationRecipients: notification.notificationRecipients.map((recipient) => ({
                    ...recipient,
                    isRead: true,
                    readDate: new Date().toISOString(),
                })),
            })),
        )
    }

    const removeNotification = (notificationId: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.notificationId !== notificationId))
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("relative h-9 w-9", className)}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Thông báo</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Không có thông báo nào</div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const recipient = notification.notificationRecipients[0]
                                const isRead = recipient?.isRead

                                return (
                                    <div
                                        key={notification.notificationId}
                                        className={cn("p-4 hover:bg-muted/50 transition-colors relative group", !isRead && "bg-blue-50/50")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-lg flex-shrink-0 mt-0.5">{getTypeIcon(notification.notificationType)}</div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={cn("text-sm font-medium truncate", !isRead && "font-semibold")}>
                                                        {notification.title}
                                                    </h4>

                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Badge variant="outline" className={cn("text-xs", getSeverityColor(notification.severity))}>
                                                            {notification.severity}
                                                        </Badge>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeNotification(notification.notificationId)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</span>

                                                    {!isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.notificationId)}
                                                            className="text-xs h-6 px-2"
                                                        >
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Đánh dấu đã đọc
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {!isRead && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button variant="ghost" className="w-full text-sm">
                                Xem tất cả thông báo
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    )
}
