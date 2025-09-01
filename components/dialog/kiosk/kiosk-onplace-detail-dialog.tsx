"use client"

import { Loader2, Monitor, Activity, CheckCircle, AlertCircle, Info, Cpu, TerminalSquare } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ReactNode } from "react"

interface OnplaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any | null
    loading: boolean
    deviceName: string
}

const InfoField = ({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) => (
    <div>
        <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        <div className="text-base font-semibold text-gray-800">{value}</div>
    </div>
)

const formatKey = (key: string) => {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
}

const getWorkingStatusBadge = (status: string, labels: any) => {
    const displayStatus = labels?.[status] || status
    const isActive = status?.toLowerCase().includes("active") || status?.toLowerCase().includes("hoạt động")
    return (
        <Badge
            className={
                isActive
                    ? "bg-green-100 text-green-800 border-green-200 shadow-sm"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm"
            }
        >
            {isActive ? <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> : <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
            <span className="font-medium">{displayStatus}</span>
        </Badge>
    )
}

export const OnplaceDialog = ({ open, onOpenChange, data, loading, deviceName }: OnplaceDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 bg-gray-50 border-0 shadow-2xl rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Thông tin tại máy</VisuallyHidden>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Chi tiết trạng thái và thông số tại máy cho thiết bị "{deviceName}".
                </DialogDescription>

                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center border border-primary-200">
                                <Monitor className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Thông tin tại máy</h1>
                                <p className="text-gray-500 text-sm">
                                    Thiết bị: <span className="font-medium">{deviceName}</span>
                                </p>
                            </div>
                        </div>
                        {data?.status?.CurrentSystemStatus && getWorkingStatusBadge(data.status.CurrentSystemStatus, data.labels)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-gray-50 overflow-y-auto hide-scrollbar">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Đang tải thông tin tại máy...</p>
                                <p className="text-gray-400 text-sm mt-1">Vui lòng chờ trong giây lát</p>
                            </div>
                        </div>
                    ) : data?.status ? (
                        <div className="space-y-6 py-6">
                            {/* Device Status Details */}
                            <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Info className="w-5 h-5 mr-2 text-primary-500" />
                                        Trạng thái Hệ thống
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.status.CurrentSystemStatus && (
                                            <InfoField
                                                label="Trạng thái hệ thống hiện tại"
                                                icon={<Activity className="w-4 h-4 text-primary-500" />}
                                                value={
                                                    <Badge className="bg-primary-100 text-primary-800 text-sm px-3 py-1 border-primary-200">
                                                        {data.labels?.[data.status.CurrentSystemStatus] || data.status.CurrentSystemStatus}
                                                    </Badge>
                                                }
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Other Parameters */}
                            <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <TerminalSquare className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông số Chi tiết
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(data.status as Record<string, any>)
                                            .filter(([key]) => key !== "CurrentSystemStatus")
                                            .map(([key, value]) => (
                                                <InfoField
                                                    key={key}
                                                    label={data.labels?.[key] || formatKey(key)}
                                                    icon={<Cpu className="w-4 h-4 text-primary-500" />}
                                                    value={
                                                        typeof value === "boolean" ? (
                                                            value ? (
                                                                <div className="flex items-center text-red-600">
                                                                    <AlertCircle className="h-5 w-5 mr-2" />
                                                                    <span className="font-semibold">Có vấn đề</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center text-green-600">
                                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                                    <span className="font-semibold">Bình thường</span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                                                {data.labels?.[value] || String(value)}
                                                            </span>
                                                        )
                                                    }
                                                />
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="text-center">
                                <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Chưa có thông tin tại máy</p>
                                <p className="text-gray-400 text-sm mt-1">Thiết bị này chưa có dữ liệu tại máy để hiển thị.</p>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}