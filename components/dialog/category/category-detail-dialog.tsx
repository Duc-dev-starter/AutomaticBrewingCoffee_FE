"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    ImageIcon,
    Hash,
    ArrowUpDown,
    CheckCircle,
    Sparkles,
} from "lucide-react"
import { EBaseStatusViMap } from "@/enum/base"
import type { CategoryDialogProps } from "@/types/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InfoField } from "@/components/common"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const CategoryDetailDialog = ({ category, open, onOpenChange }: CategoryDialogProps) => {
    if (!category) return null

    const getStatusBadge = (status: string) => {
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
                {EBaseStatusViMap[status] || status}
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
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <ImageIcon className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết danh mục</h1>
                                <p className="text-gray-500 text-sm">
                                    Thông tin chi tiết về danh mục sản phẩm
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(category.status)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Image */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-primary-600 mb-2 flex items-center">
                                    <ImageIcon className="w-5 h-5 mr-2 ml-2 text-primary-500" />
                                    Hình ảnh đại diện
                                </h3>
                                <div className="flex items-center space-x-5">
                                    <Avatar className="h-24 w-24 rounded-lg border shadow">
                                        <AvatarImage
                                            src={category.imageUrl || "/placeholder.svg"}
                                            alt="Category Image"
                                        />
                                        <AvatarFallback className="rounded-lg bg-primary-200 text-white text-xl font-bold">
                                            {category.name ? category.name.charAt(0).toUpperCase() : "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        {category.imageUrl ? (
                                            <a
                                                href={category.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 underline break-all text-sm"
                                            >
                                                {category.imageUrl}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">Chưa có hình ảnh</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin danh mục
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField label="Tên danh mục" value={category.name} icon={<Hash className="w-4 h-4 text-primary-500" />} />
                                    <InfoField label="Thứ tự hiển thị" value={category.displayOrder || "Chưa có"} icon={<ArrowUpDown className="w-4 h-4 text-primary-500" />} />
                                    {category.description && (
                                        <InfoField label="Mô tả" value={category.description} icon={<Sparkles className="w-4 h-4 text-primary-500" />} className="col-span-2" />
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
