"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { getDeviceStatusColor } from "@/utils/color"
import clsx from "clsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Info, MoreHorizontal, Package, RefreshCw, Tag } from "lucide-react"
import { KioskDevice } from "@/interfaces/kiosk"
import { formatDate } from "@/utils/date"

type DeviceStatusGroupProps = {
    kioskDevices: KioskDevice[];
    openReplaceDialog: (kioskDevice: KioskDevice) => void;
    openOnhubDialog: (kioskDevice: KioskDevice) => void;
    openOnplaceDialog: (kioskDevice: KioskDevice) => void;
    openDeviceIngredient: (kioskDevice: KioskDevice) => void;
    openDeviceIngredientHistory: (kioskDevice: KioskDevice) => void;
}
export const DeviceStatusGroup = ({ kioskDevices, openReplaceDialog, openOnhubDialog, openOnplaceDialog, openDeviceIngredient, openDeviceIngredientHistory }: DeviceStatusGroupProps) => {
    // Group devices by status
    const groupedDevices = kioskDevices.reduce(
        (acc, device) => {
            const status = device.device.status || EDeviceStatus.Stock
            if (!acc[status]) {
                acc[status] = []
            }
            acc[status].push(device)
            return acc
        },
        {} as Record<string, any[]>,
    )

    // Order statuses: Working first, then Maintain, then Stock
    const statusOrder = [EDeviceStatus.Working, EDeviceStatus.Maintain, EDeviceStatus.Stock]
    const orderedStatuses = Object.keys(groupedDevices).sort(
        (a, b) => statusOrder.indexOf(a as EDeviceStatus) - statusOrder.indexOf(b as EDeviceStatus),
    )

    return (
        <div className="space-y-6">
            {orderedStatuses.map((status) => (
                <Card key={status}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                {EDeviceStatusViMap[status] || status}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groupedDevices[status].map((kioskDevice: KioskDevice) => (
                                <div key={kioskDevice.kioskDeviceMappingId} className="border rounded-md p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{kioskDevice.device.name}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {kioskDevice.device.description || "Chưa có mô tả"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={clsx("ml-2", getDeviceStatusColor(kioskDevice.device.status))}>
                                                {EDeviceStatusViMap[kioskDevice.device.status] || kioskDevice.device.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openReplaceDialog(kioskDevice)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Thay thế thiết bị
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openOnhubDialog(kioskDevice)}>
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Xem thông tin kết nối
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openOnplaceDialog(kioskDevice)}>
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Xem thông tin tại máy
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeviceIngredient(kioskDevice)}>
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Xem thông tin nguyên liệu
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeviceIngredientHistory(kioskDevice)}>
                                                        <Info className="mr-2 h-4 w-4" />
                                                        Xem lịch sử sử dụng nguyên liệu
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">Mã thiết bị:</span>
                                            </div>
                                            <div className="font-medium text-sm">{kioskDevice.device.deviceId}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">Serial Number:</span>
                                            </div>
                                            <div className="font-medium text-sm">{kioskDevice.device.serialNumber || "Chưa có"}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">Model thiết bị:</span>
                                            </div>
                                            <div className="font-medium text-sm">{kioskDevice.device.deviceModel?.modelName || "Chưa có"}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">Loại thiết bị:</span>
                                            </div>
                                            <div className="font-medium text-sm">{kioskDevice.device.deviceModel?.deviceType?.name || "Chưa có"}</div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">Ngày tạo:</span>
                                            </div>
                                            <div className="font-medium text-sm">
                                                {kioskDevice.device.createdDate
                                                    ? formatDate(kioskDevice.device.createdDate)
                                                    : "Chưa có"}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="h-3 w-3 mr-1 text-white" />
                                                <span className="text-muted-foreground">Ngày cập nhật:</span>
                                            </div>
                                            <div className="font-medium text-sm">
                                                {kioskDevice.device.updatedDate
                                                    ? formatDate(kioskDevice.device.updatedDate)
                                                    : "Chưa cập nhật"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {orderedStatuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Chưa có lịch sử</p>
                </div>
            )}
        </div>
    )
}
