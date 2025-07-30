"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Monitor, Calendar, Smartphone, FileText, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { InfoField } from "@/components/common"
import type { DeviceDialogProps } from "@/types/dialog"
import { type EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const DeviceTypeDetailDialog = ({ deviceType, open, onOpenChange }: DeviceDialogProps) => {
    if (!deviceType) return null

    const getStatusBadge = (status: EBaseStatus) => {
        const isActive = status?.toLowerCase() === "active"
        return (
            <Badge
                className={
                    isActive
                        ? "bg-primary-500 text-white px-3 py-1"
                        : "bg-gray-400 text-white px-3 py-1"
                }
            >
                <CheckCircle className="mr-1 h-3 w-3" />
                {EBaseStatusViMap[status] || status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết</VisuallyHidden>
                </DialogTitle>
                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <Monitor className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết loại thiết bị</h1>
                                <p className="text-gray-500 text-sm">
                                    Thông tin chi tiết của loại thiết bị
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(deviceType.status)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Thông tin thiết bị */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin thiết bị
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên loại thiết bị"
                                        value={deviceType.name}
                                        icon={<Monitor className="w-4 h-4 text-primary-500" />}
                                    />

                                    <InfoField
                                        label="Mã loại thiết bị"
                                        value={deviceType.deviceTypeId}
                                        icon={<FileText className="w-4 h-4 text-primary-500" />}
                                    />

                                    <InfoField
                                        label="Thiết bị di động"
                                        value={deviceType.isMobileDevice ? "Có" : "Không"}
                                        icon={<Smartphone className="w-4 h-4 text-primary-500" />}
                                    />

                                    {deviceType.description && (
                                        <InfoField
                                            label="Mô tả"
                                            value={deviceType.description}
                                            icon={<Info className="w-4 h-4 text-primary-500" />}
                                            className="col-span-2"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thời gian */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Ngày tạo"
                                        value={
                                            deviceType.createdDate
                                                ? format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")
                                                : "Không có"
                                        }
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={
                                            deviceType.updatedDate
                                                ? format(new Date(deviceType.updatedDate), "dd/MM/yyyy HH:mm")
                                                : "Chưa cập nhật"
                                        }
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceTypeDetailDialog
