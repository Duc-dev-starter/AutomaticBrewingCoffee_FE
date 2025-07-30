"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Info, MapPin, Phone, Tag, Building2, Laptop, Users, MonitorSmartphone, Package, CalendarDays, Monitor, Shield } from "lucide-react"
import type { StoreDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"
import { getBaseStatusColor } from "@/utils/color"
import { InfoField } from "@/components/common"
import clsx from "clsx"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const StoreDetailDialog = ({ store, open, onOpenChange }: StoreDialogProps) => {
    if (!store) return null

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
                                <MonitorSmartphone className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết cửa hàng</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết của cửa hàng đang chọn</p>
                            </div>
                        </div>
                        <Badge className={clsx("px-3 py-1", getBaseStatusColor(store.status))}>
                            <FileText className="mr-1 h-3 w-3" />
                            {EBaseStatusViMap[store.status]}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Store Info */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin cửa hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên cửa hàng"
                                        value={store.name}
                                        icon={<MonitorSmartphone className="w-4 h-4 text-primary-500" />} />

                                    <InfoField
                                        label="Số điện thoại"
                                        value={store.contactPhone || "Không có"}
                                        icon={<Phone className="w-4 h-4 text-primary-500" />} />
                                    <InfoField
                                        label="Địa chỉ"
                                        value={store.locationAddress || "Không có"}
                                        icon={<MapPin className="w-4 h-4 text-primary-500" />} />
                                    <InfoField
                                        label="Loại địa điểm"
                                        value={store.locationType?.name || "Không có"}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />} />
                                    <InfoField
                                        label="Mô tả"
                                        value={store.description || "Không có"}
                                        icon={<Info className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization Info */}
                        {store.organization && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin tổ chức
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField
                                            label="Tên tổ chức"
                                            value={store.organization.name || "Không có"}
                                            icon={<Users className="w-4 h-4 text-primary-500" />} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Kiosk Info */}
                        {store.kiosk && store.kiosk.length > 0 && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Laptop className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin kiosk ({store.kiosk.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {store.kiosk.map((kiosk, index) => (
                                            <div
                                                key={kiosk.kioskId}
                                                className="border rounded-lg p-4 space-y-2 bg-gray-50"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="text-sm font-semibold">Kiosk #{index + 1}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {kiosk.kioskId}</div>
                                                    </div>
                                                    <Badge className={`text-white ${getBaseStatusColor(kiosk.status)}`}>
                                                        {EBaseStatusViMap[kiosk.status]}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                                                    <InfoField
                                                        label="Vị trí"
                                                        icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                                                        value={kiosk.location || kiosk.position || "Không có"} />
                                                    <InfoField
                                                        label="Phiên bản"
                                                        icon={<Package className="w-4 h-4 text-muted-foreground" />}
                                                        value={kiosk.kioskVersion?.versionTitle || "Không có"} />
                                                    <InfoField
                                                        label="Ngày lắp đặt"
                                                        icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
                                                        value={
                                                            kiosk.installedDate
                                                                ? new Date(kiosk.installedDate).toLocaleDateString()
                                                                : "Không có"
                                                        } />
                                                    <InfoField
                                                        label="Thiết bị"
                                                        icon={<Monitor className="w-4 h-4 text-muted-foreground" />}
                                                        value={`${kiosk.devices?.length || 0} thiết bị`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default StoreDetailDialog
