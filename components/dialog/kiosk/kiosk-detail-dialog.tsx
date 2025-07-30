"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, FileText, Info, Package, Store, Tag } from "lucide-react"
import { format } from "date-fns"
import clsx from "clsx"
import { EBaseStatusViMap } from "@/enum/base"
import { getBaseStatusColor } from "@/utils/color"
import type { KioskDialogProps } from "@/types/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const KioskDetailDialog = ({ kiosk, open, onOpenChange }: KioskDialogProps) => {
    if (!kiosk) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto flex flex-col">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết</VisuallyHidden>
                </DialogTitle>
                {/* Header */}
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Info className="mr-2 h-5 w-5" />
                            Chi tiết Kiosk
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(kiosk.status))}>
                            {EBaseStatusViMap[kiosk.status]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã kiosk: <span className="font-medium ml-1">{kiosk.kioskId}</span>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Store className="mr-2 h-4 w-4" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Franchise</span>
                                        <span className="font-medium">
                                            {kiosk.store?.name || "Không có"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Địa chỉ</span>
                                        <span className="font-medium">{kiosk.location || "Không có"}</span>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày lắp đặt</span>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">
                                                {kiosk.installedDate
                                                    ? format(new Date(kiosk.installedDate), "dd/MM/yyyy")
                                                    : "Không có"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên chi nhánh</span>
                                        <span className="font-medium">
                                            {kiosk.store?.name || "Không có"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thiết bị */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Package className="mr-2 h-4 w-4" />
                                    Thiết bị ({kiosk.devices?.length || 0})
                                </h3>

                                <div className="space-y-4">
                                    {kiosk.devices && kiosk.devices.length > 0 ? (
                                        kiosk.devices.map((device) => (
                                            <div key={device.deviceId} className="border rounded-md p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{device.name}</h4>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {device.description || "Không có mô tả"}
                                                        </p>
                                                    </div>
                                                    <Badge className={clsx("ml-2", getBaseStatusColor(device.status))}>
                                                        {device.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Mã thiết bị:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{device.deviceId}</div>
                                                </div>

                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                                                    <div className="flex items-center text-sm">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Tên thiết bị:</span>
                                                    </div>
                                                    <div className="font-medium text-sm">{device.name}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">
                                            Không có thiết bị
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thời gian */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày tạo</span>
                                        <span className="font-medium">
                                            {kiosk.createdDate
                                                ? format(new Date(kiosk.createdDate), "dd/MM/yyyy HH:mm")
                                                : "Không có"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày cập nhật</span>
                                        <span className="font-medium">
                                            {kiosk.updatedDate
                                                ? format(new Date(kiosk.updatedDate), "dd/MM/yyyy HH:mm")
                                                : "Chưa cập nhật"}
                                        </span>
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

export default KioskDetailDialog
