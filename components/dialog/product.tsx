import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import {
    Tag,
    Package,
    Info,
    Calendar,
    DollarSign,
    ImageIcon,
    Check,
    X,
    Coffee,
    Layers,
    CircleSlash,
    ShoppingBag,
} from "lucide-react"
import type { Product } from "@/types/product"
import { EProductSize, EProductStatus, EProductType } from "@/enum/product"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProductSizeColor, getProductStatusColor, getProductTypeColor } from "@/utils/color"

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

const ProductDetailDialog = ({
    product,
    open,
    onOpenChange,
}: {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) => {
    if (!product) return null




    // Lấy chữ cái đầu tiên của tên sản phẩm cho avatar fallback
    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            Chi tiết sản phẩm
                        </DialogTitle>
                        <Badge className={`mr-4 ${getProductStatusColor(product.status)}`}>
                            {product.status === EProductStatus.Selling ? (
                                <>
                                    <Check className="mr-1 h-3 w-3" /> Đang bán
                                </>
                            ) : (
                                <>
                                    <CircleSlash className="mr-1 h-3 w-3" /> Ngừng bán
                                </>
                            )}
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20 rounded-md border">
                                <AvatarImage src={product.imageUrl || "/placeholder.svg"} alt={product.name} />
                                <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                    {getInitials(product.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">{product.name}</h2>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        ID: {product.productId.substring(0, 8)}...
                                    </Badge>
                                    <Badge className={getProductTypeColor(product.type)}>
                                        {product.type === EProductType.Single ? (
                                            <Coffee className="mr-1 h-3 w-3" />
                                        ) : product.type === EProductType.Parent ? (
                                            <Layers className="mr-1 h-3 w-3" />
                                        ) : (
                                            <Package className="mr-1 h-3 w-3" />
                                        )}
                                        {product.type}
                                    </Badge>
                                    {product.size && (
                                        <Badge className={getProductSizeColor(product.size)}>
                                            <Tag className="mr-1 h-3 w-3" />
                                            Size {product.size}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mô tả sản phẩm */}
                        {product.description && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-2">
                                        <Info className="mr-2 h-4 w-4" />
                                        Mô tả sản phẩm
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Thông tin giá và trạng thái */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-sm flex items-center mb-2">
                                            {/* <VND className="mr-2 h-4 w-4" /> */}
                                            Giá bán
                                        </h3>
                                        <div className="text-xl font-bold text-green-600">{formatCurrency(product.price)}</div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm flex items-center mb-2">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            Trạng thái
                                        </h3>
                                        <div className="flex items-center">
                                            {product.isActive ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <Check className="mr-1 h-3 w-3" /> Đang hoạt động
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                    <X className="mr-1 h-3 w-3" /> Không hoạt động
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin chi tiết */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin chi tiết
                                </h3>

                                <div className="space-y-3 text-sm">
                                    {product.parentId && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã sản phẩm cha:</span>
                                            <span className="font-medium">{product.parentId}</span>
                                        </div>
                                    )}

                                    {product.imageUrl && (
                                        <>
                                            <Separator />
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Hình ảnh sản phẩm:</span>
                                                </div>
                                                <div className="mt-1 rounded-md overflow-hidden border">
                                                    <img
                                                        src={product.imageUrl || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="w-full h-auto max-h-[200px] object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No+Image"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thời gian */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Thông tin thời gian
                                </h3>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Ngày tạo:</span>
                                        <div className="font-medium">
                                            {product.createdDate ? format(new Date(product.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Ngày cập nhật:</span>
                                        <div className="font-medium">
                                            {product.updatedDate ? format(new Date(product.updatedDate), "dd/MM/yyyy HH:mm") : "Không có"}
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
