"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Path } from "@/constants/path.constant"
import { ENotificationType, ESeverity, ENotificationTypeViMap, ESeverityViMap, EReferenceType } from "@/enum/notification"
import { Notification } from "@/interfaces/notification"
import { formatDate } from "@/utils/date"
import { Skeleton } from "@/components/ui/skeleton"
import { getNotification } from "@/services/notification.service"

const NotificationDetail = () => {
    const { toast } = useToast()
    const router = useRouter()
    const params = useParams()
    const slug = params.slug as string;

    const [notification, setNotification] = useState<Notification | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchNotification = async () => {
        try {
            setLoading(true)
            const data = await getNotification(slug)
            setNotification(data.response)
        } catch (err) {
            toast({
                title: "Lỗi khi lấy chi tiết thông báo",
                description: "Không thể tải thông tin thông báo",
                variant: "destructive",
            })
            router.push(Path.MANAGE_NOTIFICATIONS)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (slug) {
            fetchNotification()
        }
    }, [slug])

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case ESeverity.Critical:
                return <AlertTriangle className="h-4 w-4 text-red-500" />
            case ESeverity.Warning:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case ESeverity.Info:
                return <Clock className="h-4 w-4 text-blue-500" />
            default:
                return <Info className="h-4 w-4 text-gray-500" />
        }
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

    const getTypeIcon = (type: ENotificationType | string): string => {
        switch (type) {
            case ENotificationType.KioskBusy:
                return "⏳"
            case ENotificationType.KioskNotWorking:
                return "🛠️"
            case ENotificationType.OrderCreateFailed:
                return "❌"
            case ENotificationType.OrderExecuteFailed:
                return "🚫"
            default:
                return "🔔"
        }
    }

    const handleBack = () => {
        router.push(Path.MANAGE_NOTIFICATIONS)
    }

    if (loading) {
        return (
            <div className="w-full p-4 sm:p-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!notification) {
        return (
            <div className="w-full p-4 sm:p-6 text-center">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-gray-500">Không tìm thấy thông báo</p>
                        <Button variant="outline" className="mt-4" onClick={handleBack}>
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full p-4 sm:p-6">
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl">
                            {getTypeIcon(notification.notificationType)}
                        </div>
                        <CardTitle className="text-2xl font-bold">{notification.title}</CardTitle>
                    </div>
                    <Button variant="outline" onClick={handleBack}>
                        Quay lại
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Message */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Nội dung</h3>
                        <p className="text-gray-600">{notification.message}</p>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs font-medium", getSeverityColor(notification.severity))}>
                                {getSeverityIcon(notification.severity)}
                                <span className="ml-1">{ESeverityViMap[notification.severity]}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {ENotificationTypeViMap[notification.notificationType]}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Thời gian tạo</p>
                                <p className="text-sm font-medium">{formatDate(notification.createdDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Người tạo</p>
                                <p className="text-sm font-medium">{notification.createdBy}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    {notification.referenceType === EReferenceType.Kiosk && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`${Path.MANAGE_KIOSKS}/${notification.referenceId}`)}
                                        >
                                            Xem
                                        </Button>
                                    )}
                                    {notification.referenceType === EReferenceType.Order && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`${Path.MANAGE_ORDERS}/${notification.referenceId}`)}
                                        >
                                            Xem
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {notification.isRead && (
                                <div>
                                    <p className="text-sm text-gray-500">Thời gian đọc</p>
                                    <p className="text-sm font-medium">
                                        {notification.notificationRecipients[0]?.readDate
                                            ? formatDate(notification.notificationRecipients[0].readDate)
                                            : "Chưa có"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>


                </CardContent>
            </Card>
        </div>
    )
}

export default NotificationDetail