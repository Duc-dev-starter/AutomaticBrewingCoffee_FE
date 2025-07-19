"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, FileText, Package, Sparkles, CheckCircle, XCircle, AlertCircle, Tag, BookOpen } from "lucide-react"
import type { IngredientType } from "@/interfaces/ingredient"

interface IngredientTypeDetailDialogProps {
    ingredientType: IngredientType | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase()

    if (statusLower === "active" || statusLower === "hoạt động") {
        return (
            <Badge className="bg-primary-300 text-white border-0 shadow-md px-4 py-1.5">
                <CheckCircle className="mr-1 h-3 w-3" />
                Hoạt động
            </Badge>
        )
    } else if (statusLower === "inactive" || statusLower === "không hoạt động") {
        return (
            <Badge className="bg-gray-400 text-white border-0 shadow-md px-4 py-1.5">
                <XCircle className="mr-1 h-3 w-3" />
                Không hoạt động
            </Badge>
        )
    } else {
        return (
            <Badge className="bg-yellow-400 text-white border-0 shadow-md px-4 py-1.5">
                <AlertCircle className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        )
    }
}

const IngredientTypeDetailDialog = ({ ingredientType, open, onOpenChange }: IngredientTypeDetailDialogProps) => {
    if (!ingredientType) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white border-0 shadow-2xl">
                {/* Beautiful Header */}
                <div className="bg-primary-300 px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <Package className="w-8 h-8 text-primary-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Chi tiết loại nguyên liệu</h1>
                                <p className="text-white/80 text-lg">Thông tin chi tiết về loại nguyên liệu</p>
                            </div>
                        </div>
                        {getStatusBadge(ingredientType.status)}
                    </div>

                    <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Mã loại nguyên liệu</p>
                                    <p className="font-mono font-bold text-lg">{ingredientType.ingredientTypeId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-8 bg-gray-50">
                    <div className="space-y-6 py-6">
                        {/* Basic Information Card */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-200 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin cơ bản
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Ingredient Type Name */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Tag className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Tên loại nguyên liệu</p>
                                                    <p className="text-xs text-gray-400">Tên định danh loại nguyên liệu</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-bold text-gray-800">{ingredientType.name}</p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                                                    <p className="text-xs text-gray-400">Tình trạng hoạt động hiện tại</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                {getStatusBadge(ingredientType.status)}
                                            </div>
                                        </div>

                                        {/* Ingredient Type ID */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mã định danh</p>
                                                    <p className="text-xs text-gray-400">ID duy nhất trong hệ thống</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="font-mono text-sm text-primary-600 bg-white px-3 py-2 rounded border border-primary-200 inline-block">
                                                    {ingredientType.ingredientTypeId}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <BookOpen className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mô tả</p>
                                                    <p className="text-xs text-gray-400">Thông tin chi tiết về loại nguyên liệu</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-medium text-gray-700">
                                                    {ingredientType.description || <span className="text-gray-400 italic">Không có mô tả</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information Card (if you have more fields) */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-300 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin bổ sung
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="bg-primary-50 border-2 border-primary-100 rounded-xl p-6">
                                        <div className="text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                            <p className="font-medium">Thông tin bổ sung</p>
                                            <p className="text-sm text-gray-400 mt-1">Các thông tin chi tiết khác sẽ được hiển thị tại đây</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                {/* Clean Footer */}
                <div className="bg-white border-t border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">Thông tin loại nguyên liệu được hiển thị đầy đủ</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default IngredientTypeDetailDialog
