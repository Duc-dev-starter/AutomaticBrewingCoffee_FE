"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Monitor, Calendar, FileText, Smartphone, Sparkles } from "lucide-react"
import { format } from "date-fns"
import type { DeviceDialogProps } from "@/types/dialog"
import { type EBaseStatus, EBaseStatusViMap } from "@/enum/base"

const DeviceTypeDetailDialog = ({ deviceType, open, onOpenChange }: DeviceDialogProps) => {
    if (!deviceType) return null

    const getStatusBadge = (status: EBaseStatus) => {
        const isActive = status?.toLowerCase() === "active"
        return (
            <Badge
                className={
                    isActive
                        ? "bg-primary-300 text-white border-0 shadow-md px-4 py-1.5"
                        : "bg-gray-400 text-white border-0 shadow-md px-4 py-1.5"
                }
            >
                {EBaseStatusViMap[status] || status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white border-0 shadow-2xl">
                {/* Clean Header */}
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
                                <h1 className="text-3xl font-bold text-white mb-1">Chi tiết loại thiết bị</h1>
                                <p className="text-white/80 text-lg">Xem thông tin chi tiết loại thiết bị</p>
                            </div>
                        </div>
                        {getStatusBadge(deviceType.status)}
                    </div>

                    <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Mã loại thiết bị</p>
                                    <p className="font-mono font-bold text-lg">{deviceType.deviceTypeId}</p>
                                </div>
                            </div>
                            {deviceType.createdDate && (
                                <div className="flex items-center text-white/80">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-8 bg-gray-50">
                    <div className="space-y-6 py-6">
                        {/* Basic Information */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-200 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin thiết bị
                                    </h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Device Type Name */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Monitor className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Tên thiết bị</p>
                                                    <p className="text-xs text-gray-400">Tên loại thiết bị</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-bold text-gray-800">{deviceType.name}</p>
                                            </div>
                                        </div>

                                        {/* Mobile Device */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Smartphone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Thiết bị di động</p>
                                                    <p className="text-xs text-gray-400">Có phải thiết bị di động</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <Badge
                                                    className={
                                                        deviceType.isMobileDevice
                                                            ? "bg-primary-200 text-white border-0 shadow-sm"
                                                            : "bg-gray-400 text-white border-0 shadow-sm"
                                                    }
                                                >
                                                    {deviceType.isMobileDevice ? "Có" : "Không"}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {deviceType.description && (
                                            <div className="group col-span-2">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Mô tả loại thiết bị</p>
                                                        <p className="text-xs text-gray-400">Thông tin bổ sung về loại thiết bị</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-6 group-hover:shadow-md transition-all duration-300">
                                                    <p className="text-gray-700 leading-relaxed text-base">{deviceType.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Time Information */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-300 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin thời gian
                                    </h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Created Date */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
                                                    <p className="text-xs text-gray-400">Thời gian tạo loại thiết bị</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-medium text-gray-700">
                                                    {deviceType.createdDate
                                                        ? format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")
                                                        : "Không có"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Updated Date */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Ngày cập nhật</p>
                                                    <p className="text-xs text-gray-400">Lần cập nhật cuối cùng</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-medium text-gray-700">
                                                    {deviceType.updatedDate
                                                        ? format(new Date(deviceType.updatedDate), "dd/MM/yyyy HH:mm")
                                                        : "Chưa cập nhật"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                {/* Clean Footer */}
                <div className="bg-white border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">Thông tin loại thiết bị được hiển thị đầy đủ</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceTypeDetailDialog
