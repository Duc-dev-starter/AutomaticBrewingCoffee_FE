"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Edit, CheckCircle2, AlertCircle, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createIngredientType, updateIngredientType } from "@/services/ingredientType.service";
import { ErrorResponse } from "@/types/error";
import { IngredientType } from "@/interfaces/ingredient";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";
import { ingredientTypeSchema } from "@/schema/ingredient.schema";

const initialFormData = {
    name: "",
    description: "",
    status: EBaseStatus.Active,
};

const IngredientTypeDialog = ({ open, onOpenChange, onSuccess, ingredientType }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void; ingredientType?: IngredientType }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);
    const isUpdate = !!ingredientType;

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [open]);

    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        if (ingredientType) {
            setFormData({
                name: ingredientType.name,
                description: ingredientType.description || "",
                status: ingredientType.status,
            });
        }
    }, [ingredientType]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationResult = ingredientTypeSchema.safeParse(formData);
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
                status: formData.status,
            };
            if (ingredientType) {
                await updateIngredientType(ingredientType.ingredientTypeId, data);
            } else {
                await createIngredientType(data);
            }

            toast({
                title: "🎉 Thành công",
                description: isUpdate ? "Cập nhật loại nguyên liệu thành công" : "Thêm loại nguyên liệu mới thành công",
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý loại nguyên liệu:", error);
            toast({
                title: "Lỗi khi xử lý loại nguyên liệu",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl">
                <DialogTitle className="sr-only">
                    {isUpdate ? "Cập nhật Loại Nguyên Liệu" : "Tạo Loại Nguyên Liệu Mới"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Form thêm mới hoặc cập nhật loại nguyên liệu. Nhập tên, mô tả và trạng thái.
                </DialogDescription>
                {/* Header */}
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="absolute inset-0"></div>
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit className="w-7 h-7 text-primary-100" /> : <Package className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Loại Nguyên Liệu" : "Tạo Loại Nguyên Liệu Mới"}
                                </h1>
                                <p className="text-gray-500">
                                    {isUpdate ? "Chỉnh sửa thông tin loại nguyên liệu" : "Thêm loại nguyên liệu mới vào hệ thống"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">
                                Tên Loại Nguyên Liệu <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="relative group">
                            <Input
                                ref={nameInputRef}
                                placeholder="Ví dụ: Cà phê, Sữa, Đường..."
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                                className="h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10"
                            />
                            {errors.name && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                            )}
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder="Mô tả chi tiết về loại nguyên liệu..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                            />
                        </div>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                        </div>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange("status", value)}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
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
                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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

export default IngredientTypeDialog;