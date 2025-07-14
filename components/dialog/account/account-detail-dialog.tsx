"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    Mail,
    User,
    Calendar,
    FileText,
    Shield,
    Phone,
    Building2,
    CheckCircle,
    XCircle,
    Sparkles,
} from "lucide-react"
import { format } from "date-fns"
import type { AccountDialogProps } from "@/types/dialog"

const AccountDetailDialog = ({ account, open, onOpenChange }: AccountDialogProps) => {
    if (!account) return null

    const org = account.organization

    const getStatusBadge = (status: string, isBanned: boolean) => {
        if (isBanned) {
            return (
                <Badge className="bg-red-400 text-white border-0 shadow-md px-4 py-1.5">
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
                        ? "bg-primary-300 text-white border-0 shadow-md px-4 py-1.5"
                        : "bg-gray-400 text-white border-0 shadow-md px-4 py-1.5"
                }
            >
                <CheckCircle className="mr-1 h-3 w-3" />
                {isActive ? "Hoạt động" : status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white border-0 shadow-2xl">
                {/* Clean Header */}
                <div className="bg-primary-300 px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-8 h-8 text-primary-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Chi tiết tài khoản</h1>
                                <p className="text-white/80 text-lg">Xem thông tin chi tiết tài khoản người dùng</p>
                            </div>
                        </div>
                        {getStatusBadge(account.status, account.isBanned)}
                    </div>

                    <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Mã tài khoản</p>
                                    <p className="font-mono font-bold text-lg">{account.accountId}</p>
                                </div>
                            </div>
                            {org?.createdDate && (
                                <div className="flex items-center text-white/80">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {format(new Date(org.createdDate), "dd/MM/yyyy HH:mm")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-8 bg-gray-50">
                    <div className="space-y-6 py-6">
                        {/* Account Information */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-200 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin tài khoản
                                    </h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Họ tên</p>
                                                    <p className="text-xs text-gray-400">Tên đầy đủ của người dùng</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-bold text-gray-800">{account.fullName}</p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Mail className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                                    <p className="text-xs text-gray-400">Địa chỉ email liên hệ</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                                                    {account.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Shield className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Vai trò</p>
                                                    <p className="text-xs text-gray-400">Quyền hạn trong hệ thống</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <Badge className="bg-primary-200 text-white border-0 shadow-sm">{account.roleName}</Badge>
                                            </div>
                                        </div>

                                        {/* Reference ID */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mã tham chiếu</p>
                                                    <p className="text-xs text-gray-400">ID tham chiếu hệ thống</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="font-mono text-sm text-primary-600 bg-white px-3 py-2 rounded border border-primary-200 inline-block">
                                                    {account.referenceId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization Information */}
                        {org && (
                            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="bg-primary-300 p-6">
                                        <h3 className="font-bold text-xl text-white flex items-center">
                                            <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            Thông tin tổ chức
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Organization Name */}
                                            <div className="group">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Tên tổ chức</p>
                                                        <p className="text-xs text-gray-400">Tên công ty/tổ chức</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                    <p className="text-lg font-bold text-gray-800">{org.name}</p>
                                                </div>
                                            </div>

                                            {/* Organization Code */}
                                            <div className="group">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Mã tổ chức</p>
                                                        <p className="text-xs text-gray-400">Mã định danh tổ chức</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                    <p className="font-mono text-sm text-primary-600 bg-white px-3 py-2 rounded border border-primary-200 inline-block">
                                                        {org.organizationCode}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Contact Email */}
                                            <div className="group">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <Mail className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Email liên hệ</p>
                                                        <p className="text-xs text-gray-400">Email chính của tổ chức</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                    <p className="text-lg font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                                                        {org.contactEmail}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Contact Phone */}
                                            <div className="group">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <Phone className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Điện thoại</p>
                                                        <p className="text-xs text-gray-400">Số điện thoại liên hệ</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                    <p className="text-lg font-medium text-gray-700">{org.contactPhone}</p>
                                                </div>
                                            </div>

                                            {/* Tax ID */}
                                            <div className="group col-span-2">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                        <FileText className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Mã số thuế</p>
                                                        <p className="text-xs text-gray-400">Mã số thuế doanh nghiệp</p>
                                                    </div>
                                                </div>
                                                <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                    <p className="text-lg font-medium text-gray-700">
                                                        {org.taxId || <span className="text-gray-400 italic">Không có</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {org.description && (
                                                <div className="group col-span-2">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                            <Info className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">Mô tả tổ chức</p>
                                                            <p className="text-xs text-gray-400">Thông tin bổ sung về tổ chức</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-6 group-hover:shadow-md transition-all duration-300">
                                                        <p className="text-gray-700 leading-relaxed text-base">{org.description}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>

                {/* Clean Footer */}
                <div className="bg-white border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">Thông tin tài khoản được hiển thị đầy đủ</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AccountDetailDialog
