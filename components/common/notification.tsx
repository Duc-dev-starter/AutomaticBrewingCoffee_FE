"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Notification } from "@/interfaces/notification"
import { markReadNotification, markReadNotifications } from "@/services/notification.service"
import { useToast } from "@/hooks/use-toast"
import { Path } from "@/constants/path.constant"
import { useRouter } from "next/navigation"
import { ENotificationType, ESeverity } from "@/enum/notification"

interface NotificationBellProps {
    className?: string
    notifications: Notification[]
    isLoading: boolean
    mutate: () => void
}

export function NotificationBell({ className, notifications, isLoading, mutate }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const unreadCount = notifications.filter((n) => !n.isRead).length

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
            case ESeverity.Critical:
                return "bg-red-100 text-red-800 border-red-200"
            case ESeverity.Warning:
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case ESeverity.Info:
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case ENotificationType.KioskBusy:
                return "⏳";
            case ENotificationType.KioskNotWorking:
                return "🛠️";
            case ENotificationType.OrderCreateFailed:
                return "❌";
            case ENotificationType.OrderExecuteFailed:
                return "🚫";
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
                return "🔔"
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await markReadNotification(notificationId)
            mutate()
        } catch (err) {
            toast({
                title: "Lỗi khi đánh dấu đã đọc",
                description: "Không thể đánh dấu thông báo đã đọc",
                variant: "destructive",
            })
        }
    }

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.notificationId)
        if (unreadIds.length === 0) return

        try {
            await markReadNotifications(unreadIds)
            mutate()
        } catch (err) {
            toast({
                title: "Lỗi khi đánh dấu đã đọc",
                description: "Không thể đánh dấu các thông báo đã đọc",
                variant: "destructive",
            })
        }
    }



    const handleViewAll = () => {
        setIsOpen(false)
        router.push(Path.MANAGE_NOTIFICATIONS)
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
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Không có thông báo nào</div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const isRead = notification.isRead

                                return (
                                    <div
                                        key={notification.notificationId}
                                        className={cn("p-4 hover:bg-muted/50 transition-colors relative group", !isRead && "bg-blue-50/50")}
                                        onClick={() => {
                                            if (!isRead) markAsRead(notification.notificationId)
                                            router.push(`${Path.MANAGE_NOTIFICATIONS}/${notification.notificationId}`)
                                        }}
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

                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdDate)}</span>

                                                    {!isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                markAsRead(notification.notificationId)
                                                            }}
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
                            <Button variant="ghost" className="w-full text-sm" onClick={handleViewAll}>
                                Xem tất cả thông báo
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    )
}