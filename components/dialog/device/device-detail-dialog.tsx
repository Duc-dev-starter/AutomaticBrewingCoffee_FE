"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Monitor, Calendar, FileText, Cpu, Tag, Wrench, HardDrive, Hash } from 'lucide-react'
import { format } from "date-fns"
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { EBaseStatusViMap } from "@/enum/base"
import { getDeviceStatusColor, getBaseStatusColor } from "@/utils/color"
import type { DeviceDialogProps } from "@/types/dialog"

const DeviceDetailDialog = ({ device, open, onOpenChange }: DeviceDialogProps) => {
    if (!device) return null

    const getStatusBadge = (status: EDeviceStatus) => {
        return (
            <Badge className={getDeviceStatusColor(status)}>
                {EDeviceStatusViMap[status] || "Không rõ"}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center text-primary-600">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <Monitor className="h-5 w-5 text-primary-500" />
                            </div>
                            Chi tiết thiết bị
                        </DialogTitle>
                        {getStatusBadge(device.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg border border-primary-100">
                        <div className="flex items-center text-primary-600">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Mã thiết bị:</span>
                            <span className="font-mono font-semibold ml-2">{device.deviceId}</span>
                        </div>
                        {device.createdDate && (
                            <div className="flex items-center text-primary-500">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(device.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-5 py-2">
                        {/* Basic Information */}
                        <Card className="border-primary-200 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-100 rounded-md mr-2">
                                        <Info className="h-4 w-4 text-primary-500" />
                                    </div>
                                    Thông tin cơ bản
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Monitor className="mr-1.5 h-4 w-4" />
                                            <span>Tên thiết bị</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 pl-5">{device.name}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Hash className="mr-1.5 h-4 w-4" />
                                            <span>Số serial</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">{device.serialNumber || "Không có"}</p>
                                    </div>

                                    {device.description && (
                                        <div className="col-span-2 space-y-1 pt-2">
                                            <div className="flex items-center text-primary-400">
                                                <FileText className="mr-1.5 h-4 w-4" />
                                                <span>Mô tả</span>
                                            </div>
                                            <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 ml-5">
                                                <p className="text-sm text-gray-700 leading-relaxed">{device.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Device Model Information */}
                        {device.deviceModel && (
                            <Card className="border-primary-300 shadow-sm">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                        <div className="p-1.5 bg-primary-200 rounded-md mr-2">
                                            <HardDrive className="h-4 w-4 text-primary-600" />
                                        </div>
                                        Thông tin mẫu thiết bị
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Tag className="mr-1.5 h-4 w-4" />
                                                <span>Tên mẫu</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 pl-5">{device.deviceModel.modelName || "Không có"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Wrench className="mr-1.5 h-4 w-4" />
                                                <span>Nhà sản xuất</span>
                                            </div>
                                            <p className="font-medium text-gray-700 pl-5">{device.deviceModel.manufacturer || "Không có"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <Cpu className="mr-1.5 h-4 w-4" />
                                                <span>Loại thiết bị</span>
                                            </div>
                                            <p className="font-medium text-gray-700 pl-5">{device.deviceModel.deviceType?.name || "Không có"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <span>Trạng thái mẫu</span>
                                            </div>
                                            <div className="pl-5">
                                                <Badge className={getBaseStatusColor(device.deviceModel.status)}>
                                                    {device.deviceModel.status ? EBaseStatusViMap[device.deviceModel.status] : "Không có"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Time Information */}
                        <Card className="border-primary-400 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-300 rounded-md mr-2">
                                        <Calendar className="h-4 w-4 text-primary-600" />
                                    </div>
                                    Thông tin thời gian
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Calendar className="mr-1.5 h-4 w-4" />
                                            <span>Ngày tạo</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">
                                            {device.createdDate ? format(new Date(device.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Calendar className="mr-1.5 h-4 w-4" />
                                            <span>Ngày cập nhật</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">
                                            {device.updatedDate ? format(new Date(device.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceDetailDialog