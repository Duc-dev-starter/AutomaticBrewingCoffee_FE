"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Info,
    ShoppingBag,
    Calendar,
    FileText,
    DollarSign,
    Type,
    AlignLeft,
    ImageIcon,
} from "lucide-react"
import clsx from "clsx"
import { InfoField } from "@/components/common/info-field"
import type { ProductDialogProps } from "@/types/dialog"
import {
    EProductStatusViMap,
    EProductSizeViMap,
    EProductTypeViMap,
} from "@/enum/product"
import { getProductStatusColor } from "@/utils/color"
import { formatCurrency } from "@/utils"
import { format } from "date-fns"
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDialogProps) => {
    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                {/* <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết</VisuallyHidden>
                </DialogTitle> */}
                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt="Product"
                                    className="w-16 h-16 rounded-xl object-cover border border-primary-200 bg-white"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-200">
                                    <ShoppingBag className="w-8 h-8 text-primary-500" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
                                <p className="text-gray-500 text-sm">{product.productParentName || "Sản phẩm đơn"}</p>
                            </div>
                        </div>
                        <Badge className={clsx("px-3 py-1", getProductStatusColor(product.status))}>
                            <FileText className="mr-1 h-3 w-3" />
                            {EProductStatusViMap[product.status]}
                        </Badge>
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
                                    Thông tin sản phẩm
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Tên sản phẩm"
                                        value={product.name || "Không có"}
                                        icon={<ShoppingBag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Sản phẩm cha"
                                        value={product.productParentName || "Không có"}
                                        icon={<ShoppingBag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Size"
                                        value={EProductSizeViMap[product.size]}
                                        icon={<Type className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Loại sản phẩm"
                                        value={EProductTypeViMap[product.type]}
                                        icon={<ShoppingBag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Giá sản phẩm"
                                        value={<span className="text-lg">{formatCurrency(product.price)}</span>}
                                        icon={<DollarSign className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mô tả"
                                        value={product.description || "Không có mô tả"}
                                        icon={<AlignLeft className="w-4 h-4 text-primary-500" />}
                                        className="col-span-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hình ảnh */}
                        {product.imageUrl && (
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
                                        Hình ảnh
                                    </h3>
                                    <div className="flex justify-center">
                                        <img
                                            src={product.imageUrl}
                                            alt="Product"
                                            className="max-h-[200px] object-contain rounded border"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center break-all">{product.imageUrl}</p>
                                </CardContent>
                            </Card>
                        )}

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
                                        value={product.createdDate ? format(new Date(product.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày cập nhật"
                                        value={product.updatedDate ? format(new Date(product.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
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

export default ProductDetailDialog
