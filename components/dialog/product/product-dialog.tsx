"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductAttribute } from "@/interfaces/product";
import { EProductStatus, EProductSize, EProductType, EBaseUnit, EAttributteOption } from "@/enum/product";
import { createProduct, updateProduct, getProducts } from "@/services/product.service";
import { productSchema } from "@/schema/product.schema";
import type { ProductDialogProps } from "@/types/dialog";
import { Upload, X, LinkIcon, ImageIcon, CheckCircle2, AlertCircle, PlusCircle, Edit, Monitor, DollarSign, Tag, Box, List, Check, Slash, Edit3 } from "lucide-react";
import type { ErrorResponse } from "@/types/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategories } from "@/services/category.service";
import { Category } from "@/interfaces/category";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "@/hooks";
import { FormDescriptionField, FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";
import { getIngredientTypes } from "@/services/ingredientType.service";
import { IngredientType } from "@/interfaces/ingredient";

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
    productCategoryId: "",
    productAttributes: [] as ProductAttribute[],
    tagName: "",
};

const ProductDialog = ({ open, onOpenChange, onSuccess, product }: ProductDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageTab, setImageTab] = useState<string>("upload");
    const [submitted, setSubmitted] = useState(false);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [parentSearchQuery, setParentSearchQuery] = useState("");
    const [pageParents, setPageParents] = useState(1);
    const [hasMoreParents, setHasMoreParents] = useState(true);
    const debouncedParentSearchQuery = useDebounce(parentSearchQuery, 300);

    const [categorySearchQuery, setCategorySearchQuery] = useState("");
    const [pageCategories, setPageCategories] = useState(1);
    const [hasMoreCategories, setHasMoreCategories] = useState(true);
    const debouncedCategorySearchQuery = useDebounce(categorySearchQuery, 300);

    const isUpdate = !!product;

    const fetchProducts = async (pageNumber: number, query: string) => {
        setLoading(true);
        try {
            const response = await getProducts({
                page: pageNumber,
                size: 10,
                filterBy: "name",
                filterQuery: query,
                type: EProductType.Parent,
            });
            if (pageNumber === 1) {
                setProducts(response.items);
            } else {
                setProducts((prev) => [...prev, ...response.items]);
            }
            setHasMoreParents(response.items.length === 10);
            setPageParents(pageNumber);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách sản phẩm.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (pageNumber: number, query: string) => {
        setLoading(true);
        try {
            const response = await getCategories({
                page: pageNumber,
                size: 10,
                filterBy: "name",
                filterQuery: query,
            });
            if (pageNumber === 1) {
                setCategories(response.items);
            } else {
                setCategories((prev) => [...prev, ...response.items]);
            }
            setHasMoreCategories(response.items.length === 10);
            setPageCategories(pageNumber);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách danh mục.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchIngredientTypes = async () => {
        try {
            const response = await getIngredientTypes({ page: 1, size: 1000 });
            setIngredientTypes(response.items);
        } catch (error) {
            console.error("Lỗi khi tải danh sách loại nguyên liệu:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách loại nguyên liệu.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (open) {
            fetchProducts(1, debouncedParentSearchQuery);
            fetchCategories(1, debouncedCategorySearchQuery);
            fetchIngredientTypes();
        }
    }, [open, debouncedParentSearchQuery, debouncedCategorySearchQuery]);

    const loadMoreParents = async () => {
        const nextPage = pageParents + 1;
        await fetchProducts(nextPage, debouncedParentSearchQuery);
    };

    const loadMoreCategories = async () => {
        const nextPage = pageCategories + 1;
        await fetchCategories(nextPage, debouncedCategorySearchQuery);
    };

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
                productCategoryId: product.productCategoryId || "",
                productAttributes: product.productAttributes || [],
                tagName: product.tagName || "",
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
            setIngredientTypes([]);
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
                    ingredientType: "",
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
                isDefault: false,
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
            productCategoryId: formData.productCategoryId,
            productAttributes: formData.productAttributes,
        };

        const validationResult = productSchema.safeParse(validationData);
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error);
            setErrors(parsedErrors);
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
                productCategoryId: formData.productCategoryId,
                productAttributes: formData.productAttributes.length > 0 ? formData.productAttributes : undefined,
                tagName: formData.tagName || undefined,
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
            <DialogContent className="sm:max-w-[950px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
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
                                        formData.name && !validFields.name && "border-red-300 bg-red-50/50"
                                    )}
                                />
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
                                value={formData.parentId ? formData.parentId : "none"}
                                onValueChange={(value) => handleChange("parentId", value === "none" ? "" : value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn sản phẩm cha (tùy chọn)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không có</SelectItem>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm sản phẩm cha..."
                                            className="h-10 text-xs px-3"
                                            value={parentSearchQuery}
                                            onChange={(e) => setParentSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="parent-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={products.length}
                                            next={loadMoreParents}
                                            hasMore={hasMoreParents}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="parent-scroll"
                                        >
                                            {products.map((p) => (
                                                <SelectItem key={p.productId} value={p.productId}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </div>
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
                                    )}
                                />
                            </div>
                            {submitted && errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <List className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Danh Mục Sản Phẩm</label>
                            </div>
                            <Select
                                value={formData.productCategoryId}
                                onValueChange={(value) => handleChange("productCategoryId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm danh mục..."
                                            className="h-10 text-xs px-3"
                                            value={categorySearchQuery}
                                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="category-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={categories.length}
                                            next={loadMoreCategories}
                                            hasMore={hasMoreCategories}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="category-scroll"
                                        >
                                            {categories.map((category) => (
                                                <SelectItem key={category.productCategoryId} value={category.productCategoryId}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </div>
                                </SelectContent>
                            </Select>
                            {submitted && errors.productCategoryId && (
                                <p className="text-red-500 text-xs mt-1">{errors.productCategoryId}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700">Nhãn sản phẩm</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập nhãn sản phẩm"
                                    value={formData.tagName}
                                    onChange={(e) => handleChange("tagName", e.target.value)}
                                    onFocus={() => setFocusedField("tagName")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "tagName" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]"
                                    )}
                                />
                            </div>
                            {submitted && errors.tagName && (
                                <p className="text-red-500 text-xs mt-1">{errors.tagName}</p>
                            )}
                        </div>
                    </div>

                    <FormDescriptionField
                        label="Mô tả"
                        icon={<Edit3 className="w-4 h-4 text-primary-300" />}
                        value={formData.description}
                        onChange={(val) => handleChange("description", val)}
                        placeholder="Nhập mô tả sản phẩm"
                        disabled={loading}
                        error={errors.description}
                        maxLength={450}
                    />

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
                                        {submitted && errors.productAttributes?.[attrIndex]?.label && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].label}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Loại nguyên liệu</Label>
                                        <Select
                                            value={attr.ingredientType}
                                            onValueChange={(value) => updateProductAttribute(attrIndex, "ingredientType", value)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại nguyên liệu" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ingredientTypes.map((type) => (
                                                    <SelectItem key={type.ingredientTypeId} value={type.name}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {submitted && errors.productAttributes?.[attrIndex]?.ingredientType && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].ingredientType}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={attr.description}
                                            onChange={(e) => updateProductAttribute(attrIndex, "description", e.target.value)}
                                            placeholder="Nhập mô tả"
                                            disabled={loading}
                                        />
                                        {submitted && errors.productAttributes?.[attrIndex]?.description && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Thứ tự hiển thị</Label>
                                        <Input
                                            type="number"
                                            value={attr.displayOrder}
                                            onChange={(e) => updateProductAttribute(attrIndex, "displayOrder", Number(e.target.value))}
                                            disabled={loading}
                                        />
                                        {submitted && errors.productAttributes?.[attrIndex]?.displayOrder && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].displayOrder}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Số lượng mặc định</Label>
                                        <Input
                                            type="number"
                                            value={attr.defaultAmount}
                                            onChange={(e) => updateProductAttribute(attrIndex, "defaultAmount", Number(e.target.value))}
                                            disabled={loading}
                                        />
                                        {submitted && errors.productAttributes?.[attrIndex]?.defaultAmount && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].defaultAmount}</p>
                                        )}
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
                                        {submitted && errors.productAttributes?.[attrIndex]?.unit && (
                                            <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].unit}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tùy chọn thuộc tính</Label>
                                    {attr.attributeOptions.map((option, optIndex) => (
                                        <div key={optIndex} className="grid grid-cols-12 gap-2 mb-2">
                                            <div className="col-span-2">
                                                <Label>Tên</Label>
                                                <Input
                                                    value={option.name}
                                                    onChange={(e) => updateAttributeOption(attrIndex, optIndex, "name", e.target.value)}
                                                    placeholder="Tên tùy chọn"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.name && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].name}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Giá trị</Label>
                                                <Input
                                                    type="number"
                                                    value={option.value}
                                                    onChange={(e) => updateAttributeOption(attrIndex, optIndex, "value", Number(e.target.value))}
                                                    placeholder="Giá trị"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.value && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].value}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Đơn vị</Label>
                                                <Select
                                                    value={option.unit}
                                                    onValueChange={(value) => updateAttributeOption(attrIndex, optIndex, "unit", value as EAttributteOption)}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn đơn vị" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(EAttributteOption).map((unit) => (
                                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.unit && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].unit}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Thứ tự hiển thị</Label>
                                                <Input
                                                    type="number"
                                                    value={option.displayOrder}
                                                    onChange={(e) => updateAttributeOption(attrIndex, optIndex, "displayOrder", Number(e.target.value))}
                                                    placeholder="Thứ tự"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.displayOrder && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].displayOrder}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Mô tả</Label>
                                                <Input
                                                    value={option.description}
                                                    onChange={(e) => updateAttributeOption(attrIndex, optIndex, "description", e.target.value)}
                                                    placeholder="Mô tả"
                                                    disabled={loading}
                                                />
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.description && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].description}</p>
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <Label>Mặc định</Label>
                                                <Select
                                                    value={option.isDefault.toString()}
                                                    onValueChange={(value) => updateAttributeOption(attrIndex, optIndex, "isDefault", value === "true")}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Có</SelectItem>
                                                        <SelectItem value="false">Không</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {submitted && errors.productAttributes?.[attrIndex]?.attributeOptions?.[optIndex]?.isDefault && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.productAttributes[attrIndex].attributeOptions[optIndex].isDefault}</p>
                                                )}
                                            </div>
                                            <div className="col-span-1 flex items-end">
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
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        className="ml-2"
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

                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        onSubmit={handleSubmit}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;