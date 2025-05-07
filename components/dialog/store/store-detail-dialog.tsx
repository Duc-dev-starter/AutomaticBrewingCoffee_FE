"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Store, Building2, Phone, MapPin, FileText, Info, Calendar, Users, Tag, Laptop } from 'lucide-react'
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import { EBaseStatusViMap } from "@/enum/base"
import type { StoreDialogProps } from "@/types/dialog"

const StoreDetailDialog = ({ store, open, onOpenChange }: StoreDialogProps) => {
    if (!store) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Store className="mr-2 h-5 w-5" />
                            Chi tiết cửa hàng
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(store.status))}>
                            {EBaseStatusViMap[store.status]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã cửa hàng: <span className="font-medium ml-1">{store.storeId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên cửa hàng</span>
                                        <span className="font-medium">{store.name || "Không có"}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{store.description || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin liên hệ và địa chỉ */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Thông tin liên hệ và địa chỉ
                                </h3>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Số điện thoại</span>
                                        <div className="flex items-center mt-1">
                                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{store.contactPhone || "Không có"}</span>
                                        </div>
                                    </div>

                                    <Separator className="my-1" />

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Địa chỉ</span>
                                        <div className="flex items-start mt-1">
                                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground mt-1" />
                                            <span className="font-medium">{store.locationAddress || "Không có"}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại địa điểm</span>
                                        <div className="flex items-center mt-1">
                                            <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{store.locationType?.name || "Không có"}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin tổ chức */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Thông tin tổ chức
                                </h3>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tổ chức</span>
                                        <div className="flex items-center mt-1">
                                            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{store.organization?.name || "Không có"}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin kiosk */}
                        {store.kiosk && store.kiosk.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-3">
                                        <Laptop className="mr-2 h-4 w-4" />
                                        Thông tin kiosk ({store.kiosk.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {store.kiosk.map((kiosk, index) => (
                                            <div key={kiosk.kioskId} className="border rounded-md p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">Kiosk #{index + 1}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {kiosk.kioskId}</div>
                                                    </div>
                                                    <Badge className={clsx(getBaseStatusColor(kiosk.status))}>
                                                        {EBaseStatusViMap[kiosk.status]}
                                                    </Badge>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-muted-foreground">Vị trí:</span>
                                                        <span className="ml-1">{kiosk.location || kiosk.position || "Không có"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Phiên bản:</span>
                                                        <span className="ml-1">{kiosk.kioskVersion?.versionTitle || "Không có"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Ngày lắp đặt:</span>
                                                        <span className="ml-1">
                                                            {kiosk.installedDate ? new Date(kiosk.installedDate).toLocaleDateString() : "Không có"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Thiết bị:</span>
                                                        <span className="ml-1">{kiosk.devices?.length || 0} thiết bị</span>
                                                    </div>
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