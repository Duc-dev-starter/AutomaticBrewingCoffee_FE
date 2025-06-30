"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductAttribute } from "@/interfaces/product";
import { EProductStatus, EProductSize, EProductType, EIngredientType, EBaseUnit, EAttributteOption } from "@/enum/product";
import { createProduct, updateProduct, getProducts } from "@/services/product";
import { productSchema } from "@/schema/product";
import type { ProductDialogProps } from "@/types/dialog";
import { Upload, X, LinkIcon, ImageIcon, CheckCircle2, AlertCircle, Save, Zap, PlusCircle, Edit, Monitor, DollarSign, Tag, Box, List, Check, Slash } from "lucide-react";
import type { ErrorResponse } from "@/types/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategories } from "@/services/category";
import { Category } from "@/interfaces/category";
import { cn } from "@/lib/utils";

const initialFormData = {
    name: "",
    description: "",
    parentId: "",
    size: EProductSize.M,
    type: EProductType.Parent,
    status: EProductStatus.Selling,
    price: "",
    imageBase64: "",
    imageUrl: "",
    isActive: true,
    productCategoryId: "",
    productAttributes: [] as ProductAttribute[],
};

const ProductDialog = ({ open, onOpenChange, onSuccess, product }: ProductDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageTab, setImageTab] = useState<string>("upload");
    const [submitted, setSubmitted] = useState(false);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const isUpdate = !!product;

    useEffect(() => {
        const fetchProducts = async () => {
            setFetching(true);
            try {
                const response = await getProducts({ page: 1, size: 100 });
                setProducts(response.items);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách sản phẩm.",
                    variant: "destructive",
                });
            } finally {
                setFetching(false);
            }
        };
        if (open) {
            fetchProducts();
        }
    }, [open, toast]);

    useEffect(() => {
        const fetchCategories = async () => {
            setFetching(true);
            try {
                const response = await getCategories({ page: 1, size: 100 });
                setCategories(response.items);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách danh mục.",
                    variant: "destructive",
                });
            } finally {
                setFetching(false);
            }
        };
        if (open) {
            fetchCategories();
        }
    }, [open, toast]);

    useEffect(() => {
        if (open && product) {
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
                productCategoryId: product.productCategoryId || "",
                productAttributes: product.productAttributes || [],
            });
            setImagePreview(product.imageUrl || null);
            setImageTab(product.imageUrl ? "url" : "upload");
            setValidFields({
                name: product.name.trim().length >= 1,
                price: product.price > 0,
            });
            setErrors({});
            setSubmitted(false);
            setFocusedField(null);
        } else if (open && !product) {
            setFormData(initialFormData);
            setImagePreview(null);
            setImageTab("upload");
            setValidFields({});
            setErrors({});
            setSubmitted(false);
            setFocusedField(null);
        }
    }, [open, product]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setErrors({});
            setProducts([]);
            setCategories([]);
            setImagePreview(null);
            setImageTab("upload");
            setSubmitted(false);
            setValidFields({});
            setFocusedField(null);
        }
    }, [open]);

    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(new Event("submit") as any);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, formData]);

    const validateField = (field: string, value: string) => {
        const newValidFields = { ...validFields };
        switch (field) {
            case "name":
                newValidFields.name = value.trim().length >= 1;
                break;
            case "price":
                newValidFields.price = Number(value) > 0;
                break;
        }
        setValidFields(newValidFields);
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "name" || field === "price") {
            validateField(field, value);
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const addProductAttribute = () => {
        setFormData((prev) => ({
            ...prev,
            productAttributes: [
                ...prev.productAttributes,
                {
                    label: "",
                    ingredientType: EIngredientType.Coffee,
                    description: "",
                    displayOrder: prev.productAttributes.length,
                    defaultAmount: 0,
                    unit: EBaseUnit.Grams,
                    attributeOptions: [],
                },
            ],
        }));
    };

    const updateProductAttribute = (index: number, field: string, value: any) => {
        setFormData((prev) => {
            const newAttributes = [...prev.productAttributes];
            newAttributes[index] = { ...newAttributes[index], [field]: value };
            return { ...prev, productAttributes: newAttributes };
        });
    };

    const removeProductAttribute = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            productAttributes: prev.productAttributes.filter((_, i) => i !== index),
        }));
    };

    const addAttributeOption = (attrIndex: number) => {
        setFormData((prev) => {
            const newAttributes = [...prev.productAttributes];
            newAttributes[attrIndex].attributeOptions.push({
                name: "",
                value: 0,
                unit: EAttributteOption.Percent,
                displayOrder: newAttributes[attrIndex].attributeOptions.length,
                description: "",
            });
            return { ...prev, productAttributes: newAttributes };
        });
    };

    const updateAttributeOption = (attrIndex: number, optIndex: number, field: string, value: any) => {
        setFormData((prev) => {
            const newAttributes = [...prev.productAttributes];
            newAttributes[attrIndex].attributeOptions[optIndex] = {
                ...newAttributes[attrIndex].attributeOptions[optIndex],
                [field]: value,
            };
            return { ...prev, productAttributes: newAttributes };
        });
    };

    const removeAttributeOption = (attrIndex: number, optIndex: number) => {
        setFormData((prev) => {
            const newAttributes = [...prev.productAttributes];
            newAttributes[attrIndex].attributeOptions = newAttributes[attrIndex].attributeOptions.filter(
                (_, i) => i !== optIndex
            );
            return { ...prev, productAttributes: newAttributes };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file hình ảnh",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Lỗi",
                description: "Kích thước file không được vượt quá 2MB",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            handleChange("imageBase64", base64String);
            handleChange("imageUrl", "");
            setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleUrlChange = (url: string) => {
        handleChange("imageUrl", url);
        handleChange("imageBase64", "");
        setImagePreview(url);
    };

    const handleRemoveImage = () => {
        handleChange("imageBase64", "");
        handleChange("imageUrl", "");
        setImagePreview(null);
    };

    const handleTestImage = () => {
        if (!formData.imageUrl) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL hình ảnh",
                variant: "destructive",
            });
            return;
        }

        const img = new Image();
        img.onload = () => {
            setImagePreview(formData.imageUrl);
            toast({
                title: "Thành công",
                description: "URL hình ảnh hợp lệ",
            });
        };
        img.onerror = () => {
            toast({
                title: "Lỗi",
                description: "URL hình ảnh không hợp lệ hoặc không thể truy cập",
                variant: "destructive",
            });
        };
        img.src = formData.imageUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const validationData = {
            name: formData.name,
            description: formData.description,
            parentId: formData.parentId,
            size: formData.size,
            type: formData.type,
            status: formData.status,
            price: formData.price,
            imageUrl: formData.imageUrl || formData.imageBase64,
            isActive: formData.isActive,
            productCategoryId: formData.productCategoryId,
            productAttributes: formData.productAttributes,
        };

        const validationResult = productSchema.safeParse(validationData);
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            setErrors(
                Object.fromEntries(Object.entries(fieldErrors).map(([key, messages]) => [key, messages ? messages[0] : ""]))
            );
            return;
        }

        setErrors({});
        setLoading(true);
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
                productCategoryId: formData.productCategoryId,
                productAttributes: formData.productAttributes.length > 0 ? formData.productAttributes : undefined,
            };

            if (product) {
                await updateProduct(product.productId, data);
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được cập nhật.`,
                });
            } else {
                await createProduct(data);
                toast({
                    title: "Thành công",
                    description: `Sản phẩm "${formData.name}" đã được tạo.`,
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý sản phẩm:", error);
            toast({
                title: "Lỗi khi xử lý sản phẩm",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit className="w-7 h-7 text-primary-100" /> : <PlusCircle className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Sản Phẩm" : "Tạo Sản Phẩm Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Hình ảnh sản phẩm</Label>
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
                                {submitted && errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Sản Phẩm</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={nameInputRef}
                                    placeholder="Nhập tên sản phẩm"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "name" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.name && "border-green-400 bg-green-50/50",
                                        !validFields.name && formData.name && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.name && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.name && formData.name && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Box className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700">Sản Phẩm Cha</label>
                            </div>
                            <Select
                                value={formData.parentId}
                                onValueChange={(value) => handleChange("parentId", value)}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
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
                            {submitted && errors.parentId && (
                                <p className="text-red-500 text-xs mt-1">{errors.parentId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Tag className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Size</label>
                            </div>
                            <Select
                                value={formData.size}
                                onValueChange={(value) => handleChange("size", value as EProductSize)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductSize.M}>Trung</SelectItem>
                                </SelectContent>
                            </Select>
                            {submitted && errors.size && (
                                <p className="text-red-500 text-xs mt-1">{errors.size}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <List className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Loại Sản Phẩm</label>
                            </div>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value as EProductType)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn loại sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductType.Parent}>Cha</SelectItem>
                                    <SelectItem value={EProductType.Child}>Con</SelectItem>
                                </SelectContent>
                            </Select>
                            {submitted && errors.type && (
                                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Check className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Trạng Thái</label>
                            </div>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value as EProductStatus)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EProductStatus.Selling}>Đang bán</SelectItem>
                                    <SelectItem value={EProductStatus.UnSelling}>Ngừng bán</SelectItem>
                                </SelectContent>
                            </Select>
                            {submitted && errors.status && (
                                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <DollarSign className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Giá (VNĐ)</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                                            handleChange("price", value);
                                        }
                                    }}
                                    onFocus={() => setFocusedField("price")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Nhập giá sản phẩm"
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "price" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.price && "border-green-400 bg-green-50/50",
                                        !validFields.price && formData.price && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.price && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.price && formData.price && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Slash className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Hoạt Động</label>
                            </div>
                            <Select
                                value={formData.isActive.toString()}
                                onValueChange={(value) => handleChange("isActive", value === "true")}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn trạng thái hoạt động" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Hoạt động</SelectItem>
                                    <SelectItem value="false">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                            {submitted && errors.isActive && (
                                <p className="text-red-500 text-xs mt-1">{errors.isActive}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <List className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Danh Mục Sản Phẩm</label>
                            </div>
                            <Select
                                value={formData.productCategoryId}
                                onValueChange={(value) => handleChange("productCategoryId", value)}
                                disabled={loading || fetching}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.productCategoryId} value={category.productCategoryId}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {submitted && errors.productCategoryId && (
                                <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder="Nhập mô tả sản phẩm"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                onFocus={() => setFocusedField("description")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
                                    focusedField === "description" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.01]"
                                )}
                            />
                        </div>
                        {submitted && errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Tag className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Thuộc tính sản phẩm</label>
                        </div>
                        {formData.productAttributes.length === 0 && (
                            <p className="text-gray-500 text-sm">Chưa có thuộc tính nào.</p>
                        )}
                        {formData.productAttributes.map((attr, attrIndex) => (
                            <div key={attrIndex} className="border p-4 rounded-md space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nhãn</Label>
                                        <Input
                                            value={attr.label}
                                            onChange={(e) => updateProductAttribute(attrIndex, "label", e.target.value)}
                                            placeholder="Nhập nhãn"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <Label>Loại nguyên liệu</Label>
                                        <Select
                                            value={attr.ingredientType}
                                            onValueChange={(value) => updateProductAttribute(attrIndex, "ingredientType", value as EIngredientType)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(EIngredientType).map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={attr.description}
                                            onChange={(e) => updateProductAttribute(attrIndex, "description", e.target.value)}
                                            placeholder="Nhập mô tả"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <Label>Thứ tự hiển thị</Label>
                                        <Input
                                            type="number"
                                            value={attr.displayOrder}
                                            onChange={(e) => updateProductAttribute(attrIndex, "displayOrder", Number(e.target.value))}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <Label>Số lượng mặc định</Label>
                                        <Input
                                            type="number"
                                            value={attr.defaultAmount}
                                            onChange={(e) => updateProductAttribute(attrIndex, "defaultAmount", Number(e.target.value))}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <Label>Đơn vị</Label>
                                        <Select
                                            value={attr.unit}
                                            onValueChange={(value) => updateProductAttribute(attrIndex, "unit", value as EBaseUnit)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn đơn vị" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(EBaseUnit).map((unit) => (
                                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tùy chọn thuộc tính</Label>
                                    {attr.attributeOptions.map((option, optIndex) => (
                                        <div key={optIndex} className="flex space-x-2">
                                            <Input
                                                value={option.name}
                                                onChange={(e) => updateAttributeOption(attrIndex, optIndex, "name", e.target.value)}
                                                placeholder="Tên tùy chọn"
                                                disabled={loading}
                                            />
                                            <Input
                                                type="number"
                                                value={option.value}
                                                onChange={(e) => updateAttributeOption(attrIndex, optIndex, "value", Number(e.target.value))}
                                                placeholder="Giá trị"
                                                disabled={loading}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeAttributeOption(attrIndex, optIndex)}
                                                disabled={loading}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addAttributeOption(attrIndex)}
                                        disabled={loading}
                                    >
                                        Thêm tùy chọn
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeProductAttribute(attrIndex)}
                                    disabled={loading}
                                >
                                    Xóa thuộc tính
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProductAttribute}
                            disabled={loading}
                        >
                            Thêm thuộc tính
                        </Button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Zap className="w-3 h-3" />
                            <span>Ctrl+Enter để lưu • Esc để đóng</span>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="h-11 px-6 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || fetching}
                                className={cn(
                                    "h-11 px-8 bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                    loading && "opacity-60 cursor-not-allowed hover:scale-100"
                                )}
                            >
                                {loading ? (
                                    "Đang xử lý..."
                                ) : (
                                    <>
                                        <Save className="mr-2 w-4 h-4" />
                                        {isUpdate ? "Cập nhật" : "Tạo"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;