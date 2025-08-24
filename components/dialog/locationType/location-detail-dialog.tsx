"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
    Info,
    Monitor,
    Calendar,
} from "lucide-react"
import type { LocationTypeDialogProps } from "@/types/dialog"
import { InfoField } from "@/components/common"
import { formatDate } from "@/utils/date"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const LocationTypeDetailDialog = ({ locationType, open, onOpenChange }: LocationTypeDialogProps) => {
    if (!locationType) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
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
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết location</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết loại địa điểm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Thông tin location */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên thiết bị"
                                        value={locationType.name}
                                        icon={<Monitor className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2"
                                    />
                                    <InfoField
                                        label="Mô tả"
                                        value={locationType.description || "Chưa có"}
                                        icon={<Info className="w-4 h-4 text-primary-500" />}
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
                                    Thời gian
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Ngày tạo"
                                        value={formatDate(locationType.createdDate) || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={formatDate(locationType.updatedDate || '') || "Chưa cập nhật"}
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

export default LocationTypeDetailDialog
