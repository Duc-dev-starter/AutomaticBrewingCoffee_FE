"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    Building2,
    FileText,
    Mail,
    ImageIcon,
    Calendar,
} from "lucide-react"
import clsx from "clsx"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InfoField } from "@/components/common"
import type { OrganizationDialogProps } from "@/types/dialog"
import { getBaseStatusColor } from "@/utils/color"
import { EBaseStatusViMap } from "@/enum/base"
import { formatDate } from "@/utils/date"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const OrganizationDetailDialog = ({
    organization,
    open,
    onOpenChange,
}: OrganizationDialogProps) => {
    if (!organization) return null

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
                                <Building2 className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết tổ chức</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết của tổ chức</p>
                            </div>
                        </div>
                        <Badge
                            className={clsx("px-3 py-1", getBaseStatusColor(organization.status))}
                        >
                            {EBaseStatusViMap[organization.status] || "Không rõ"}
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Avatar + Tên tổ chức */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-4 flex items-center space-x-6">
                                <Avatar className="h-24 w-24 rounded-md border">
                                    <AvatarImage src={organization.logoUrl || "/placeholder.svg"} alt={organization.name} />
                                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                        {organization.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold">{organization.name}</h2>
                                    {organization.taxId && (
                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            MST: {organization.taxId}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin tổ chức */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin tổ chức
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Mã code"
                                        value={organization.organizationCode || "Chưa có"}
                                        icon={<FileText className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Tên tổ chức"
                                        value={organization.name}
                                        icon={<Building2 className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mô tả"
                                        value={organization.description || "Chưa có"}
                                        icon={<Info className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liên hệ */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-primary-500" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <InfoField
                                        label="Email"
                                        value={organization.contactEmail || "Chưa có"}
                                        icon={<Mail className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Số điện thoại"
                                        value={organization.contactPhone || "Chưa có"}
                                        icon={<Mail className="w-4 h-4 text-primary-500" />}
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
                                        value={formatDate(organization.createdDate) || "Chưa có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={formatDate(organization.updatedDate || '') || "Chưa cập nhật"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hình ảnh đầy đủ */}
                        {organization.logoUrl && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <ImageIcon className="mr-2 h-5 w-5 text-primary-500" />
                                        Logo tổ chức
                                    </h3>
                                    <div className="flex justify-center">
                                        <div className="border rounded-md overflow-hidden max-w-[300px]">
                                            <img
                                                src={organization.logoUrl || "/placeholder.svg"}
                                                alt={`Logo ${organization.name}`}
                                                className="w-full h-auto object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No+Logo"
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center break-words">{organization.logoUrl}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default OrganizationDetailDialog
