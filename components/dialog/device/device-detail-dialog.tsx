"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    Monitor,
    Calendar,
    FileText,
    Cpu,
    Tag,
    Wrench,
    Hash,
    Beaker,
    AlertTriangle,
} from "lucide-react"
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { EBaseStatusViMap } from "@/enum/base"
import { getDeviceStatusColor, getBaseStatusColor } from "@/utils/color"
import type { DeviceDialogProps } from "@/types/dialog"
import { InfoField } from "@/components/common"
import { DeviceIngredientStates } from "@/interfaces/device"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { formatDate } from "@/utils/date"

const DeviceDetailDialog = ({ device, open, onOpenChange }: DeviceDialogProps) => {
    if (!device) return null

    const getStatusBadge = (status: EDeviceStatus) => (
        <Badge className={getDeviceStatusColor(status)}>
            {EDeviceStatusViMap[status] || "Không rõ"}
        </Badge>
    )

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
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết thiết bị</h1>
                                <p className="text-gray-500 text-sm">
                                    Thông tin chi tiết về thiết bị và thành phần
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(device.status)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Basic Information */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField label="Tên thiết bị" value={device.name} icon={<Monitor className="w-4 h-4 text-primary-500" />} />
                                    <InfoField label="Số Serial" value={device.serialNumber || "Không có"} icon={<Hash className="w-4 h-4 text-primary-500" />} />
                                    {device.description && (
                                        <InfoField label="Mô tả" value={device.description} icon={<FileText className="w-4 h-4 text-primary-500" />} className="col-span-2" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Device Model */}
                        {device.deviceModel && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Cpu className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin mẫu thiết bị
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label="Tên mẫu" value={device.deviceModel.modelName} icon={<Tag className="w-4 h-4 text-primary-500" />} />
                                        <InfoField label="Nhà sản xuất" value={device.deviceModel.manufacturer} icon={<Wrench className="w-4 h-4 text-primary-500" />} />
                                        <InfoField label="Loại thiết bị" value={device.deviceModel.deviceType?.name} icon={<Cpu className="w-4 h-4 text-primary-500" />} />
                                        <InfoField
                                            label="Trạng thái mẫu"
                                            value={<Badge className={getBaseStatusColor(device.deviceModel.status)}>{EBaseStatusViMap[device.deviceModel.status]}</Badge>}
                                            icon={<Info className="w-4 h-4 text-primary-500" />}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Ingredient States */}
                        {device.deviceIngredientStates && device.deviceIngredientStates.length > 0 && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Beaker className="w-5 h-5 mr-2 text-primary-500" />
                                        Trạng thái thành phần
                                    </h3>
                                    <div className="space-y-4">
                                        {device.deviceIngredientStates.map((ingredient: DeviceIngredientStates) => (
                                            <div key={ingredient.deviceIngredientStateId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-1">{ingredient.ingredientType}</p>
                                                <p className="text-xs text-gray-500">
                                                    Dung lượng hiện tại: <span className="font-semibold text-gray-800">{ingredient.currentCapacity}{ingredient.unit}</span> / {ingredient.maxCapacity}{ingredient.unit}
                                                </p>
                                                {ingredient.isWarning && (
                                                    <div className="mt-1 flex items-center text-red-500 text-xs">
                                                        <AlertTriangle className="w-3 h-3 mr-1" /> Cảnh báo: Dưới mức cảnh báo ({ingredient.warningPercent}%)
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Time Information */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Ngày tạo"
                                        value={device.createdDate ? formatDate(device.createdDate) : "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={device.updatedDate ? formatDate(device.updatedDate) : "Chưa cập nhật"}
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



export default DeviceDetailDialog
