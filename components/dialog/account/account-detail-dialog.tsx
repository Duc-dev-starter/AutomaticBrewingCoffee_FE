"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    Mail,
    User,
    FileText,
    Shield,
    Phone,
    Building2,
    CheckCircle,
    XCircle,
} from "lucide-react"
import type { AccountDialogProps } from "@/types/dialog"
import { InfoField } from "@/components/common"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { RoleViMap } from "@/enum/role"

const AccountDetailDialog = ({ account, open, onOpenChange }: AccountDialogProps) => {
    if (!account) return null

    const org = account.organization

    const getStatusBadge = (status: string, isBanned: boolean) => {
        if (isBanned) {
            return (
                <Badge className="bg-red-500 text-white px-3 py-1">
                    <XCircle className="mr-1 h-3 w-3" />
                    Bị khoá
                </Badge>
            )
        }
        const isActive = status?.toLowerCase() === "active"
        return (
            <Badge
                className={
                    isActive
                        ? "bg-primary-500 text-white px-3 py-1"
                        : "bg-gray-400 text-white px-3 py-1"
                }
            >
                <CheckCircle className="mr-1 h-3 w-3" />
                {isActive ? "Hoạt động" : status}
            </Badge>
        )
    }

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
                            <div className="relative">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                    <User className="w-8 h-8 text-primary-500" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết tài khoản</h1>
                                <p className="text-gray-500 text-sm">
                                    Thông tin chi tiết của người dùng
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(account.status, account.isBanned)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Account Information */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin tài khoản {RoleViMap[account.roleName] || account.roleName}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <InfoField label="Họ tên" value={account.fullName} icon={<User className="w-4 h-4 text-primary-500" />} />

                                    {/* Email */}
                                    <InfoField label="Email" value={account.email} icon={<Mail className="w-4 h-4 text-primary-500" />} />


                                    {/* Banned Reason */}
                                    {account.isBanned && account.bannedReason && (
                                        <InfoField
                                            label="Lý do khoá"
                                            value={account.bannedReason}
                                            icon={<XCircle className="w-4 h-4 text-red-500" />}
                                            className="col-span-2"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization Information */}
                        {org && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin tổ chức
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label="Tên tổ chức" value={org.name} icon={<Building2 className="w-4 h-4 text-primary-500" />} />
                                        <InfoField label="Mã tổ chức" value={org.organizationCode} icon={<FileText className="w-4 h-4 text-primary-500" />} />
                                        <InfoField label="Email liên hệ" value={org.contactEmail} icon={<Mail className="w-4 h-4 text-primary-500" />} />
                                        <InfoField label="Điện thoại" value={org.contactPhone} icon={<Phone className="w-4 h-4 text-primary-500" />} />
                                        {org.taxId && (
                                            <InfoField label="Mã số thuế" value={org.taxId} icon={<FileText className="w-4 h-4 text-primary-500" />} className="col-span-2" />
                                        )}
                                        {org.description && (
                                            <InfoField label="Mô tả tổ chức" value={org.description} icon={<Info className="w-4 h-4 text-primary-500" />} className="col-span-2" />
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

export default AccountDetailDialog
