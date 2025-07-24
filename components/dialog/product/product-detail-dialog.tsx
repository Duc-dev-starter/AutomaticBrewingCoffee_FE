"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Product } from "@/interfaces/product"
import { format } from "date-fns"
import { EProductStatusViMap, EProductTypeViMap } from "@/enum/product"
import { formatCurrency } from "@/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, DollarSign, FileText, ImageIcon, Info, ShoppingBag } from "lucide-react"
import clsx from "clsx"
import { getProductStatusColor } from "@/utils/color"
import { ProductDialogProps } from "@/types/dialog"



const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDialogProps) => {
    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Chi tiết sản phẩm
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getProductStatusColor(product.status))}>
                            {EProductStatusViMap[product.status]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã sản phẩm: <span className="font-medium ml-1">{product.productId}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-4 hide-scrollbar">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên sản phẩm</span>
                                        <span className="font-medium">{product.name || "Không có"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Sản phẩm cha</span>
                                        <span className="font-medium">{product.productParentName || "Không có"}</span>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {/* <div className="flex flex-col">
                                        <span className="text-muted-foreground">Size</span>
                                        <Badge variant="outline" className="mt-1 w-fit">
                                            {EProductSizeViMap[product.size]}
                                        </Badge>
                                    </div> */}
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại sản phẩm</span>
                                        <Badge variant="outline" className="mt-1 w-fit">
                                            {EProductTypeViMap[product.type]}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Mô tả</span>
                                    <p className="mt-1 text-sm">{product.description || "Không có mô tả"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin giá */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Thông tin giá
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Giá</span>
                                        <span className="font-medium text-lg">{formatCurrency(product.price)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hình ảnh */}
                        {product.imageUrl && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-3">
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        Hình ảnh
                                    </h3>
                                    <div className="flex justify-center">
                                        <div className="border rounded-md p-1 max-w-full">
                                            <img
                                                src={product.imageUrl || "/placeholder.svg"}
                                                alt={product.name || "Product image"}
                                                className="max-h-[200px] object-contain rounded"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground text-center">{product.imageUrl}</div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Thời gian */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày tạo</span>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">
                                                {product.createdDate ? format(new Date(product.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày cập nhật</span>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">
                                                {product.updatedDate
                                                    ? format(new Date(product.updatedDate), "dd/MM/yyyy HH:mm")
                                                    : "Chưa cập nhật"}
                                            </span>
                                        </div>
                                    </div>
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
