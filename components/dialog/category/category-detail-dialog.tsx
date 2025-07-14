"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, FileText, ImageIcon, Hash, ArrowUpDown, Circle, Edit3, Sparkles, Eye } from "lucide-react"
import { EBaseStatusViMap } from "@/enum/base"
import type { CategoryDialogProps } from "@/types/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const CategoryDetailDialog = ({ category, open, onOpenChange }: CategoryDialogProps) => {
    if (!category) return null

    const getStatusBadge = (status: string) => {
        const isActive = status?.toLowerCase() === "active"
        return (
            <Badge
                className={
                    isActive
                        ? "bg-primary-300 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 px-4 py-1.5"
                        : "bg-gray-400 text-white border-0 shadow-md px-4 py-1.5"
                }
            >
                <Circle className="w-2 h-2 mr-2 fill-current" />
                {EBaseStatusViMap[status] || status}
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
                                    <Eye className="w-8 h-8 text-primary-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Chi tiết danh mục</h1>
                                <p className="text-white/80 text-lg">Xem thông tin chi tiết danh mục sản phẩm</p>
                            </div>
                        </div>
                        {getStatusBadge(category.status)}
                    </div>

                    <div className="mt-6 bg-white/20 border border-white/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white/80 text-sm">Mã định danh</p>
                                <p className="font-mono font-bold text-lg">{category.productCategoryId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-8 bg-gray-50 overflow-y-auto">
                    <div className="space-y-6 py-6">
                        {/* Clean Image Section */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-200 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <ImageIcon className="w-5 h-5 text-white" />
                                        </div>
                                        Hình ảnh đại diện
                                    </h3>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <Avatar className="h-24 w-24 rounded-2xl border-4 border-primary-100 shadow-lg">
                                                <AvatarImage
                                                    src={category.imageUrl || "/placeholder.svg"}
                                                    alt="Category Image"
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="rounded-2xl bg-primary-200 text-white text-2xl font-bold">
                                                    {category.name ? category.name.charAt(0).toUpperCase() : "C"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center shadow-md">
                                                <ImageIcon className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            {category.imageUrl ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm font-semibold text-gray-700">URL hình ảnh</span>
                                                    </div>
                                                    <div className="bg-primary-100 border border-primary-200 rounded-xl p-4">
                                                        <p className="text-sm text-gray-700 break-all font-mono">{category.imageUrl}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-3 text-gray-400">
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                    <span className="text-sm italic">Chưa có hình ảnh</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Clean Info Section */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="bg-primary-300 p-6">
                                    <h3 className="font-bold text-xl text-white flex items-center">
                                        <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                                            <Info className="w-5 h-5 text-white" />
                                        </div>
                                        Thông tin chi tiết
                                    </h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name Field */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Hash className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Tên danh mục</p>
                                                    <p className="text-xs text-gray-400">Tên hiển thị của danh mục</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-bold text-gray-800">{category.name || "Không có"}</p>
                                            </div>
                                        </div>

                                        {/* Display Order */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <ArrowUpDown className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Thứ tự hiển thị</p>
                                                    <p className="text-xs text-gray-400">Vị trí sắp xếp danh mục</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-lg font-bold text-gray-800">{category.displayOrder || "Không có"}</p>
                                            </div>
                                        </div>

                                        {/* Status Field */}
                                        <div className="group">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-10 h-10 bg-primary-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Circle className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Trạng thái hoạt động</p>
                                                    <p className="text-xs text-gray-400">Tình trạng hiện tại</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                                                {getStatusBadge(category.status)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Field */}
                                    {category.description && (
                                        <div className="group mt-8">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-primary-300 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                                    <Edit3 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mô tả chi tiết</p>
                                                    <p className="text-xs text-gray-400">Thông tin bổ sung về danh mục</p>
                                                </div>
                                            </div>
                                            <div className="bg-primary-100 border-2 border-primary-200 rounded-xl p-6 group-hover:shadow-md transition-all duration-300">
                                                <p className="text-gray-700 leading-relaxed text-base">{category.description}</p>
                                            </div>
                                        </div>
                                    )}
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
                            <span className="text-sm">Thông tin danh mục được hiển thị đầy đủ</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CategoryDetailDialog
