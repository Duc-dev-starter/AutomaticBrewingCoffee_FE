"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Package, FileText, Tag, BookOpen, CheckCircle, XCircle } from "lucide-react"
import { InfoField } from "@/components/common"
import type { IngredientTypeDialogProps } from "@/types/dialog"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const IngredientTypeDetailDialog = ({ ingredientType, open, onOpenChange }: IngredientTypeDialogProps) => {
    if (!ingredientType) return null

    const getStatusBadge = (status: EBaseStatus) => {
        const isActive = status?.toLowerCase() === "active"
        return (
            <Badge
                className={
                    isActive
                        ? "bg-primary-500 text-white px-3 py-1"
                        : "bg-gray-400 text-white px-3 py-1"
                }
            >
                {isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
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
                                <Package className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Chi tiết loại nguyên liệu</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết về loại nguyên liệu</p>
                            </div>
                        </div>
                        {getStatusBadge(ingredientType.status)}
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Thông tin cơ bản */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên loại nguyên liệu"
                                        value={ingredientType.name}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mã loại nguyên liệu"
                                        value={ingredientType.ingredientTypeId}
                                        icon={<FileText className="w-4 h-4 text-primary-500" />}
                                    />
                                    {ingredientType.description && (
                                        <InfoField
                                            label="Mô tả"
                                            value={ingredientType.description}
                                            icon={<BookOpen className="w-4 h-4 text-primary-500" />}
                                            className="col-span-2"
                                        />
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

export default IngredientTypeDetailDialog
