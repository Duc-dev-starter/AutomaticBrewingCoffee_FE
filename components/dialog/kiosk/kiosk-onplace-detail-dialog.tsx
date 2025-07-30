"use client"

import { Loader2, Monitor, Activity, CheckCircle, AlertCircle, Info, Sparkles, Cpu } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface OnplaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any | null
    loading: boolean
    deviceName: string
}

const formatKey = (key: string) => {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
}

const getWorkingStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase().includes("active") || status?.toLowerCase().includes("hoạt động")
    return (
        <Badge
            className={
                isActive
                    ? "bg-primary-300 text-white border-0 shadow-md px-4 py-1.5"
                    : "bg-gray-400 text-white border-0 shadow-md px-4 py-1.5"
            }
        >
            {isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
            {status}
        </Badge>
    )
}

export const OnplaceDialog = ({ open, onOpenChange, data, loading, deviceName }: OnplaceDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 bg-white border-0 shadow-2xl">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết</VisuallyHidden>
                </DialogTitle>
                {/* Header */}
                <div className="bg-primary-300 px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <Monitor className="w-8 h-8 text-primary-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Thông tin OnPlace</h1>
                                <p className="text-white/80 text-lg">Chi tiết trạng thái và thông số thiết bị</p>
                            </div>
                        </div>
                        {data?.workingStatus && getWorkingStatusBadge(data.workingStatus)}
                    </div>

                    <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Tên thiết bị</p>
                                    <p className="font-bold text-lg">{deviceName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-300" />
                            </div>
                            <p className="text-gray-600 font-medium">Đang tải thông tin OnPlace...</p>
                            <p className="text-gray-400 text-sm mt-1">Vui lòng chờ trong giây lát</p>
                        </div>
                    </div>
                ) : data ? (
                    <ScrollArea className="flex-1 px-8 bg-gray-50 overflow-y-auto hide-scrollbar">
                        <div className="space-y-6 py-6">
                            {/* Device Status Details */}
                            {data.status && (
                                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="bg-primary-300 p-6">
                                            <h3 className="font-bold text-xl text-white flex items-center">
                                                <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                                    <Info className="w-5 h-5 text-white" />
                                                </div>
                                                Chi tiết trạng thái thiết bị
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Current System Status */}
                                            {data.status.CurrentSystemStatus && (
                                                <div className="group">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống hiện tại</p>
                                                            <p className="text-xs text-gray-400">Tình trạng tổng thể của hệ thống</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                        <Badge className="bg-primary-200 text-white border-0 shadow-sm text-base px-3 py-1">
                                                            {data.status.CurrentSystemStatus}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Other Status */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-700 text-lg flex items-center">
                                                    <div className="w-6 h-6 bg-primary-200 rounded-lg flex items-center justify-center mr-2">
                                                        <Info className="w-4 h-4 text-white" />
                                                    </div>
                                                    Thông số chi tiết
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {Object.entries(data.status as Record<string, any>)
                                                        .filter(([key]) => key !== "CurrentSystemStatus")
                                                        .map(([key, value]) => (
                                                            <div key={key} className="group">
                                                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 group-hover:border-primary-200 group-hover:shadow-md transition-all duration-300">
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-600 mb-1">{formatKey(key)}</p>
                                                                            <p className="text-lg font-semibold text-gray-800">{String(value)}</p>
                                                                        </div>
                                                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                                            <Activity className="w-4 h-4 text-primary-300" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">Không có thông tin OnPlace</p>
                            <p className="text-gray-400 text-sm mt-1">Thiết bị này chưa có dữ liệu OnPlace</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
