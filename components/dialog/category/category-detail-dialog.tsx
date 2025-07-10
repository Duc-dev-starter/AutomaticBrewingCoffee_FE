"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, FileText, Calendar, ImageIcon, Hash, ArrowUpDown } from 'lucide-react'
import { EBaseStatusViMap } from "@/enum/base"
import { getBaseStatusColor } from "@/utils/color"
import { CategoryDialogProps } from "@/types/dialog"

const CategoryDetailDialog = ({ category, open, onOpenChange }: CategoryDialogProps) => {
    if (!category) return null

    const getStatusBadge = (status: string) => {
        const isActive = status?.toLowerCase() === 'active'
        return (
            <Badge className={isActive
                ? "bg-primary-100 text-primary-600 border-primary-200 hover:bg-primary-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }>
                {EBaseStatusViMap[status] || status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center text-primary-600">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <Info className="h-5 w-5 text-primary-500" />
                            </div>
                            Chi tiết danh mục
                        </DialogTitle>
                        {getStatusBadge(category.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg border border-primary-100">
                        <div className="flex items-center text-primary-600">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Mã danh mục:</span>
                            <span className="font-mono font-semibold ml-2">{category.productCategoryId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-5 py-2">
                        {/* Basic Information */}
                        <Card className="border-primary-200 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-100 rounded-md mr-2">
                                        <Info className="h-4 w-4 text-primary-500" />
                                    </div>
                                    Thông tin cơ bản
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Hash className="mr-1.5 h-4 w-4" />
                                            <span>Tên danh mục</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 pl-5">{category.name || "Không có"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <ArrowUpDown className="mr-1.5 h-4 w-4" />
                                            <span>Thứ tự hiển thị</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">{category.displayOrder}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <span>Trạng thái</span>
                                        </div>
                                        <div className="pl-5">
                                            <Badge className={getBaseStatusColor(category.status)}>
                                                {EBaseStatusViMap[category.status]}
                                            </Badge>
                                        </div>
                                    </div>

                                    {category.imageUrl && (
                                        <div className="space-y-1">
                                            <div className="flex items-center text-primary-400">
                                                <ImageIcon className="mr-1.5 h-4 w-4" />
                                                <span>Hình ảnh</span>
                                            </div>
                                            <div className="pl-5">
                                                <img
                                                    src={category.imageUrl || "/placeholder.svg"}
                                                    alt={category.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-primary-200"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {category.description && (
                                        <div className="col-span-2 space-y-1 pt-2">
                                            <div className="flex items-center text-primary-400">
                                                <FileText className="mr-1.5 h-4 w-4" />
                                                <span>Mô tả</span>
                                            </div>
                                            <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 ml-5">
                                                <p className="text-sm text-gray-700 leading-relaxed">{category.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default CategoryDetailDialog