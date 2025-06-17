"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { PlusCircle, Loader2, Edit, Upload, X, LinkIcon, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createCategory, updateCategory } from "@/services/category"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ErrorResponse } from "@/types/error"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryDialogProps } from "@/types/dialog"
import { categorySchema } from "@/schema/category"
import { fileToBase64 } from "@/utils/file"

const initialFormData = {
    name: "",
    description: "",
    status: EBaseStatus.Active,
    imageBase64: "",
    imageUrl: "",
}

const CategoryDialog = ({ open, onOpenChange, onSuccess, category }: CategoryDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageTab, setImageTab] = useState<string>("upload")

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || "",
                status: category.status,
                imageBase64: "",
                imageUrl: category.imageUrl || "",
            })
            setImagePreview(category.imageUrl || null)
            setImageFile(null)
            setImageTab(category.imageUrl ? "url" : "upload")
        } else {
            setFormData(initialFormData)
            setImagePreview(null)
            setImageFile(null)
            setImageTab("upload")
        }
    }, [category, open])

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

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

        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
        setImageFile(file)
        setFormData((prev) => ({
            ...prev,
            imageUrl: "",
        }))
    }

    const handleUrlChange = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            imageUrl: url,
        }))
        setImagePreview(url)
        setImageFile(null)
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setImageFile(null)
        setFormData((prev) => ({
            ...prev,
            imageBase64: "",
            imageUrl: "",
        }))
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const validationResult = categorySchema.safeParse(formData)
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten()
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        setLoading(true)

        try {
            const payload: {
                name: string
                description: string
                status: EBaseStatus
                imageBase64?: string
                imageUrl?: string
            } = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
            }

            if (imageTab === "upload" && imageFile) {
                const imageBase64 = await fileToBase64(imageFile)
                payload.imageBase64 = imageBase64
            } else if (imageTab === "url" && formData.imageUrl) {
                payload.imageUrl = formData.imageUrl
            }

            if (category) {
                await updateCategory(category.productCategoryId, payload)
                toast({
                    title: "Thành công",
                    description: "Cập nhật danh mục thành công",
                    variant: "success"
                })
            } else {
                await createCategory(payload)
                toast({
                    title: "Thành công",
                    description: "Thêm danh mục mới thành công",
                    variant: "success"
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý danh mục:", error)
            toast({
                title: "Lỗi khi xử lý danh mục",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const isUpdate = !!category

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật danh mục
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm danh mục mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="image">Hình ảnh danh mục</Label>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 rounded-md border">
                                    <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Image Preview" />
                                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : "C"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Tabs value={imageTab} onValueChange={setImageTab} className="w-full">
                                        <TabsList className="grid grid-cols-2 mb-2">
                                            <TabsTrigger value="upload" disabled={loading}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Tải lên hình ảnh
                                            </TabsTrigger>
                                            <TabsTrigger value="url" disabled={loading}>
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                URL hình ảnh
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
                                            <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG hoặc GIF. Tối đa 2MB.</p>
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
                                                <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} disabled={loading}>
                                                    <X className="h-4 w-4 mr-1" />
                                                    Xóa
                                                </Button>
                                            )}
                                            <p className="text-xs text-muted-foreground">Nhập URL hình ảnh từ internet.</p>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="asterisk">
                                Tên danh mục
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên danh mục"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="asterisk">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(EBaseStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {EBaseStatusViMap[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả danh mục"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[70px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} onClick={handleSubmit}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Cập nhật danh mục
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm danh mục
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CategoryDialog