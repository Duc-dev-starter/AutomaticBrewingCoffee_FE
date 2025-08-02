"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useDebounce, useNotifications, useToast } from "@/hooks"
import { useRouter } from "next/navigation"
import { Path } from "@/constants/path.constant"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExportButton, RefreshButton, SearchInput, BaseStatusFilter, Pagination } from "@/components/common"
import { ENotificationType, ESeverity, ENotificationTypeViMap, ESeverityViMap } from "@/enum/notification"
import type { Notification } from "@/interfaces/notification"
import { markReadNotification, markReadNotifications } from "@/services/notification.service"
import { Bell, CheckCircle2, Clock, AlertTriangle, Info, User, Check, X } from "lucide-react"
import { formatDate } from "@/utils/date"

const ManageNotifications = () => {
    const { toast } = useToast()
    const router = useRouter()
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [severityFilter, setSeverityFilter] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)

    const debouncedSearchValue = useDebounce(searchValue, 500)

    const params = {
        filterBy: debouncedSearchValue ? "title" : undefined,
        filterQuery: debouncedSearchValue || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: "createdDate",
        isAsc: false,
        status: statusFilter || undefined,
        notificationType: typeFilter || undefined,
        severity: severityFilter || undefined,
    }

    const { data, error, isLoading, mutate } = useNotifications(params)

    useEffect(() => {
        if (error) {
            toast({
                title: "Lỗi khi lấy danh sách thông báo",
                description: error.message || "Đã xảy ra lỗi không xác định",
                variant: "destructive",
            })
        }
    }, [error, toast])

    const handleViewDetails = useCallback(
        async (notification: Notification, event: React.MouseEvent) => {
            // Prevent navigation if clicking on checkbox
            if ((event.target as HTMLElement).closest("[data-checkbox]")) {
                return
            }

            router.push(`${Path.MANAGE_NOTIFICATIONS}/${notification.notificationId}`)
            try {
                await markReadNotification(notification.notificationId)
                mutate()
            } catch (err) {
                toast({
                    title: "Lỗi khi đánh dấu đã đọc",
                    description: "Không thể đánh dấu thông báo đã đọc",
                    variant: "destructive",
                })
            }
        },
        [router, toast, mutate],
    )

    const handleClearFilters = () => {
        setStatusFilter("")
        setTypeFilter("")
        setSeverityFilter("")
        setSearchValue("")
        setCurrentPage(1)
    }

    const handleSelectNotification = (notificationId: string, checked: boolean) => {
        if (checked) {
            setSelectedNotifications((prev) => [...prev, notificationId])
        } else {
            setSelectedNotifications((prev) => prev.filter((id) => id !== notificationId))
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = data?.items?.map((n) => n.notificationId) || []
            setSelectedNotifications(allIds)
        } else {
            setSelectedNotifications([])
        }
    }

    const handleMarkSelectedAsRead = async () => {
        if (selectedNotifications.length === 0) return

        setIsMarkingAsRead(true)
        try {
            await markReadNotifications(selectedNotifications)
            setSelectedNotifications([])
            mutate()
            toast({
                title: "Thành công",
                description: `Đã đánh dấu ${selectedNotifications.length} thông báo là đã đọc`,
            })
        } catch (err) {
            toast({
                title: "Lỗi khi đánh dấu đã đọc",
                description: "Không thể đánh dấu các thông báo đã chọn",
                variant: "destructive",
            })
        } finally {
            setIsMarkingAsRead(false)
        }
    }

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
                return "⏳";
            case ENotificationType.KioskNotWorking:
                return "🛠️";
            case ENotificationType.OrderCreateFailed:
                return "❌";
            case ENotificationType.OrderExecuteFailed:
                return "🚫";
            default:
                return "🔔"; // Thông báo mặc định
        }
    };


    const hasActiveFilters = statusFilter !== "" || typeFilter !== "" || severityFilter !== "" || searchValue !== ""
    const allSelected = (data?.items?.length ?? 0) > 0 && selectedNotifications.length === (data?.items?.length ?? 0)
    const someSelected = selectedNotifications.length > 0 && selectedNotifications.length < (data?.items?.length || 0)

    return (
        <div className="w-full">
            <div className="flex flex-col space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý thông báo</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát tất cả thông báo trong hệ thống.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={isLoading} />
                        <RefreshButton loading={isLoading} toggleLoading={mutate} />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={isLoading}
                            placeHolderText="Tìm kiếm tiêu đề thông báo..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <BaseStatusFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={handleClearFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={isLoading}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Lọc <ChevronDownIcon className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {Object.values(ENotificationType).map((type) => (
                                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                                        Loại: {ENotificationTypeViMap[type]}
                                    </DropdownMenuItem>
                                ))}
                                {Object.values(ESeverity).map((severity) => (
                                    <DropdownMenuItem key={severity} onClick={() => setSeverityFilter(severity)}>
                                        Mức độ: {ESeverityViMap[severity]}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={handleClearFilters}>Xóa bộ lọc</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedNotifications.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                Đã chọn {selectedNotifications.length} thông báo
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkSelectedAsRead}
                                disabled={isMarkingAsRead}
                                className="bg-white"
                            >
                                {isMarkingAsRead ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Đánh dấu đã đọc
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedNotifications([])} className="bg-white">
                                <X className="h-4 w-4 mr-2" />
                                Bỏ chọn
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                <div className="space-y-4">
                    {/* Select All Header */}
                    {(data?.items?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                            <Checkbox
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) (el as HTMLInputElement).indeterminate = someSelected
                                }}
                                onCheckedChange={handleSelectAll}
                                data-checkbox
                            />
                            <span className="text-sm text-muted-foreground">
                                {allSelected
                                    ? "Đã chọn tất cả"
                                    : someSelected
                                        ? `Đã chọn ${selectedNotifications.length}/${data?.items?.length ?? 0}`
                                        : `Chọn tất cả ${data?.items?.length ?? 0} thông báo`}
                            </span>
                        </div>
                    )}

                    <ScrollArea className="flex-1">
                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <div key={index} className="p-6 border rounded-xl bg-white shadow-sm animate-pulse">
                                        <div className="flex items-start gap-4">
                                            <div className="w-5 h-5 bg-gray-200 rounded" />
                                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="h-5 w-1/3 bg-gray-200 rounded" />
                                                    <div className="h-4 w-20 bg-gray-200 rounded" />
                                                </div>
                                                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                                                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : data?.items?.length ? (
                                data.items.map((notification) => {
                                    const isUnread = notification.notificationRecipients.some((r) => !r.isRead)
                                    const isSelected = selectedNotifications.includes(notification.notificationId)

                                    return (
                                        <div
                                            key={notification.notificationId}
                                            className={cn(
                                                "group p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
                                            )}
                                            onClick={(e) => handleViewDetails(notification, e)}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox */}
                                                <div className="pt-1" data-checkbox>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectNotification(notification.notificationId, checked as boolean)
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>

                                                {/* Type Icon */}
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl">
                                                    {getTypeIcon(notification.notificationType)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <h3
                                                                className={cn("text-lg font-semibold text-gray-900 truncate", isUnread && "font-bold")}
                                                            >
                                                                {notification.title}
                                                            </h3>
                                                            {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-sm text-gray-500">{formatDate(notification.createdDate)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Message */}
                                                    <div className="text-gray-600 text-sm leading-relaxed mb-3">
                                                        <p
                                                            className={cn(
                                                                "text-sm",
                                                                isUnread ? "text-gray-900 font-bold" : "text-gray-600"
                                                            )}
                                                        >
                                                            {notification.message.length > 120
                                                                ? notification.message.slice(0, 120) + "..."
                                                                : notification.message}
                                                        </p>
                                                    </div>



                                                    {/* Metadata */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {/* Badges */}
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn("text-xs font-medium", getSeverityColor(notification.severity))}
                                                                >
                                                                    {getSeverityIcon(notification.severity)}
                                                                    <span className="ml-1">{ESeverityViMap[notification.severity]}</span>
                                                                </Badge>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {ENotificationTypeViMap[notification.notificationType]}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Creator Info */}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <User className="h-3 w-3" />
                                                            <span>{notification.createdBy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center p-12 bg-white rounded-xl border border-dashed">
                                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo nào</h3>
                                    <p className="text-gray-500">Hiện tại không có thông báo nào phù hợp với bộ lọc của bạn.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Pagination */}
                <Pagination
                    loading={isLoading}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={data?.total || 0}
                    totalPages={data?.totalPages || 1}
                />
            </div>
        </div>
    )
}

export default ManageNotifications
