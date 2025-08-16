"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Monitor, Calendar, FileText, Smartphone } from "lucide-react"
import { format } from "date-fns"
import clsx from "clsx"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import type { DeviceDialogProps } from "@/types/dialog"
import { getBaseStatusColor } from "@/utils/color"
import { EBaseStatusViMap } from "@/enum/base"
import { InfoField } from "@/components/common/info-field"

const DeviceTypeDetailDialog = ({ deviceType, open, onOpenChange }: DeviceDialogProps) => {
    if (!deviceType) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết Loại Thiết bị</VisuallyHidden>
                </DialogTitle>

                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-200">
                                <Monitor className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">{deviceType.name}</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết loại thiết bị</p>
                            </div>
                        </div>
                        <Badge className={clsx("px-3 py-1", getBaseStatusColor(deviceType.status))}>
                            <FileText className="mr-1 h-3 w-3" />
                            {EBaseStatusViMap[deviceType.status]}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Thông tin cơ bản */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên loại thiết bị"
                                        value={deviceType.name || "Không có"}
                                        icon={<Monitor className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Là thiết bị di động"
                                        value={
                                            <Badge
                                                variant={deviceType.isMobileDevice ? "default" : "secondary"}
                                                className={clsx(deviceType.isMobileDevice ? "bg-green-100 text-green-800" : "")}
                                            >
                                                {deviceType.isMobileDevice ? "Có" : "Không"}
                                            </Badge>
                                        }
                                        icon={<Smartphone className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mô tả"
                                        value={deviceType.description || "Không có mô tả"}
                                        icon={<FileText className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thời gian */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Ngày tạo"
                                        value={deviceType.createdDate ? format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={deviceType.updatedDate ? format(new Date(deviceType.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
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