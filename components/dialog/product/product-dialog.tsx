"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/interfaces/product"
import { EProductStatus, EProductSize, EProductType } from "@/enum/product"
import { createProduct, updateProduct, getProducts } from "@/services/product"
import { productSchema } from "@/schema/product"
import type { ProductDialogProps } from "@/types/dialog"
import { Upload, X, LinkIcon, ImageIcon } from "lucide-react"
import type { ErrorResponse } from "@/types/error"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialFormData = {
    name: "",
    description: "",
    parentId: "",
    size: EProductSize.M,
    type: EProductType.Single,
    status: EProductStatus.Selling,
    price: "",
    imageBase64: "",
    imageUrl: "",
    isActive: true,
}

const ProductDialog = ({ open, onOpenChange, onSuccess, product }: ProductDialogProps) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState(initialFormData)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageTab, setImageTab] = useState<string>("upload")

    // Fetch products for parentId selection
    useEffect(() => {
        const fetchProducts = async () => {
            setFetching(true)
            try {
                const response = await getProducts({ page: 1, size: 100 })
                setProducts(response.items)
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách sản phẩm.",
                    variant: "destructive",
                })
            } finally {
                setFetching(false)
            }
        }
        if (open) {
            fetchProducts()
        }
    }, [open, toast])

    // Populate form data when editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || "",
                parentId: product.parentId || "",
                size: product.size,
                type: product.type,
                status: product.status,
                price: product.price.toString(),
                imageBase64: "",
                imageUrl: product.imageUrl || "",
                isActive: product.isActive,
            })
            setImagePreview(product.imageUrl || null)
            setImageTab(product.imageUrl ? "url" : "upload")
            setErrors({})
        } else {
            setFormData(initialFormData)
            setImagePreview(null)
            setImageTab("upload")
        }
    }, [product])

    // Reset form data and errors when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData)
            setErrors({})
            setProducts([])
            setImagePreview(null)
            setImageTab("upload")
        }
    }, [open])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file hình ảnh",
                variant: "destructive",
            })
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Lỗi",
                description: "Kích thước file không được vượt quá 2MB",
                variant: "destructive",
            })
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const base64String = reader.result as string
            setFormData({ ...formData, imageBase64: base64String, imageUrl: "" })
            setImagePreview(base64String)
        }
        reader.readAsDataURL(file)
    }

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, imageUrl: url, imageBase64: "" })
        setImagePreview(url)
    }

    const handleRemoveImage = () => {
        setFormData({ ...formData, imageBase64: "", imageUrl: "" })
        setImagePreview(null)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        // Prepare data for validation
        const validationData = {
            name: formData.name,
            description: formData.description,
            parentId: formData.parentId,
            size: formData.size,
            type: formData.type,
            status: formData.status,
            price: formData.price,
            imageUrl: formData.imageUrl || formData.imageBase64, // Use either URL or base64 for validation
            isActive: formData.isActive,
        }

        const validationResult = productSchema.safeParse(validationData)
        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error.errors)
            const fieldErrors = validationResult.error.flatten().fieldErrors
            setErrors(
                Object.fromEntries(Object.entries(fieldErrors).map(([key, messages]) => [key, messages ? messages[0] : ""])),
            )
            return
        }

        setErrors({})
        setLoading(true)
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                parentId: formData.parentId || undefined,
                size: formData.size,
                type: formData.type,
                status: formData.status,
                price: Number(formData.price),
                imageBase64: formData.imageBase64 || undefined,
                imageUrl: formData.imageUrl || undefined,
                isActive: formData.isActive,
            }

            if (product) {
                await updateProduct(product.productId, data)
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được cập nhật.`,
                })
            } else {
                await createProduct(data)
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được tạo.`,
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý sản phẩm:", error)
            toast({
                title: "Lỗi khi xử lý sản phẩm",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.stopPropagation()
        }
    }

    const handleTestImage = () => {
        if (!formData.imageUrl) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL hình ảnh",
                variant: "destructive",
            })
            return
        }

        // Test if the URL is valid by loading the image
        const img = new Image()
        img.onload = () => {
            setImagePreview(formData.imageUrl)
            toast({
                title: "Thành công",
                description: "URL hình ảnh hợp lệ",
            })
        }
        img.onerror = () => {
            toast({
                title: "Lỗi",
                description: "URL hình ảnh không hợp lệ hoặc không thể truy cập",
                variant: "destructive",
            })
        }
        img.src = formData.imageUrl
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogHeader>
                    <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Hình ảnh sản phẩm</Label>
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 border rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                        src={imagePreview || "/placeholder.svg"}
                                        alt="Product Image"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Tabs value={imageTab} onValueChange={setImageTab} className="w-full">
                                        <TabsList className="grid grid-cols-2 mb-2">
                                            <TabsTrigger value="upload" disabled={loading}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Tải lên
                                            </TabsTrigger>
                                            <TabsTrigger value="url" disabled={loading}>
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                URL
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload" className="space-y-2">
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" className="relative" disabled={loading}>
                                                    <input
                                                        id="image"
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={handleImageChange}
                                                        disabled={loading}
                                                    />
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Chọn file
                                                </Button>
                                                {imagePreview && imageTab === "upload" && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleRemoveImage}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Xóa
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG. Tối đa 2MB.</p>
                                        </TabsContent>
                                        <TabsContent value="url" className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Nhập URL hình ảnh"
                                                    value={formData.imageUrl}
                                                    onChange={(e) => handleUrlChange(e.target.value)}
                                                    disabled={loading}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleTestImage}
                                                    disabled={loading || !formData.imageUrl}
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-1" />
                                                    Kiểm tra
                                                </Button>
                                            </div>
                                            {imagePreview && imageTab === "url" && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    disabled={loading}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Xóa
                                                </Button>
                                            )}
                                            <p className="text-xs text-muted-foreground">Nhập URL hình ảnh từ internet.</p>
                                        </TabsContent>
                                    </Tabs>
                                    {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="name" className="asterisk">
                                    Tên sản phẩm
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên sản phẩm"
                                    disabled={loading}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="parentId">Sản phẩm cha</Label>
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                                    disabled={loading || fetching}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn sản phẩm cha (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.productId} value={p.productId}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="size" className="asterisk">
                                    Size
                                </Label>
                                <Select
                                    value={formData.size}
                                    onValueChange={(value) => setFormData({ ...formData, size: value as EProductSize })}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EProductSize.S}>Nhỏ</SelectItem>
                                        <SelectItem value={EProductSize.M}>Trung</SelectItem>
                                        <SelectItem value={EProductSize.L}>Lớn</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.size && <p className="text-red-500 text-sm">{errors.size}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="type" className="asterisk">
                                    Loại sản phẩm
                                </Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as EProductType })}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại sản phẩm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EProductType.Single}>Đơn</SelectItem>
                                        <SelectItem value={EProductType.Parent}>Cha</SelectItem>
                                        <SelectItem value={EProductType.Child}>Con</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="status" className="asterisk">
                                    Trạng thái
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as EProductStatus })}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EProductStatus.Selling}>Đang bán</SelectItem>
                                        <SelectItem value={EProductStatus.UnSelling}>Ngừng bán</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="price">Giá (VNĐ)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                                            setFormData({ ...formData, price: value })
                                        }
                                    }}
                                    placeholder="Nhập giá sản phẩm"
                                    disabled={loading}
                                />
                                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                            </div>
                            <div className="grid gap-2 min-h-[4.5rem]">
                                <Label htmlFor="isActive" className="asterisk">
                                    Hoạt động
                                </Label>
                                <Select
                                    value={formData.isActive.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái hoạt động" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Hoạt động</SelectItem>
                                        <SelectItem value="false">Không hoạt động</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.isActive && <p className="text-red-500 text-sm">{errors.isActive}</p>}
                            </div>
                            <div className="grid gap-2 col-span-1 sm:col-span-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả sản phẩm (tùy chọn)"
                                    disabled={loading}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading || fetching}>
                            {product ? "Cập nhật" : "Thêm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ProductDialog
