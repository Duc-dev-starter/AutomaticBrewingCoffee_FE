"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Info, LayoutList, ClipboardList, Shield } from "lucide-react"
import type { MenuDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"
import { InfoField } from "@/components/common"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const MenuDetailDialog = ({ menu, open, onOpenChange }: MenuDialogProps) => {
    if (!menu) return null

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
                                <LayoutList className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết menu</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết của menu đang chọn</p>
                            </div>
                        </div>
                        <Badge className="bg-primary-500 text-white px-3 py-1">
                            <FileText className="mr-1 h-3 w-3" />
                            {menu.menuId}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Menu Information */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin menu
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên menu"
                                        value={menu.name}
                                        icon={<ClipboardList className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Trạng thái"
                                        value={EBaseStatusViMap[menu.status] || "Không rõ"}
                                        icon={<Shield className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mô tả"
                                        value={menu.description || "Không có"}
                                        icon={<Info className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization Information */}
                        {menu.organization && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <ClipboardList className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin tổ chức
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField
                                            label="Tên tổ chức"
                                            value={menu.organization.name}
                                            icon={<FileText className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Email liên hệ"
                                            value={menu.organization.contactEmail}
                                            icon={<FileText className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Điện thoại"
                                            value={menu.organization.contactPhone}
                                            icon={<FileText className="w-4 h-4 text-primary-500" />}
                                        />
                                        {menu.organization.taxId && (
                                            <InfoField
                                                label="Mã số thuế"
                                                value={menu.organization.taxId}
                                                icon={<FileText className="w-4 h-4 text-primary-500" />}
                                                className="col-span-2"
                                            />
                                        )}
                                        {menu.organization.description && (
                                            <InfoField
                                                label="Mô tả tổ chức"
                                                value={menu.organization.description}
                                                icon={<Info className="w-4 h-4 text-primary-500" />}
                                                className="col-span-2"
                                            />
                                        )}
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

export default MenuDetailDialog
