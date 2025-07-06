"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Sparkles, CheckCircle2, AlertCircle, Save, X, Building2, Edit3, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationTypeDialogProps } from "@/types/dialog";
import { createLocationType, updateLocationType } from "@/services/locationType";
import { ErrorResponse } from "@/types/error";
import { cn } from "@/lib/utils";
import { locationSchema } from "@/schema/location";
import { FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";

const initialFormData = {
    name: "",
    description: "",
};

const LocationTypeDialog = ({ open, onOpenChange, onSuccess, locationType }: LocationTypeDialogProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);
    const isUpdate = !!locationType;

    // Reset form khi dialog đóng
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setValidFields({});
            setFocusedField(null);
        }
    }, [open]);

    // Auto-focus trường name khi dialog mở
    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    // Điền dữ liệu khi chỉnh sửa
    useEffect(() => {
        if (locationType) {
            setFormData({
                name: locationType.name,
                description: locationType.description,
            });
            setValidFields({
                name: locationType.name.trim().length >= 2 && locationType.name.length <= 100,
                description: locationType.description.length <= 450,
            });
        }
    }, [locationType]);

    // Phím tắt Ctrl+Enter để submit
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e as any);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, formData]);

    const validateField = (field: string, value: string) => {
        const newValidFields = { ...validFields };
        switch (field) {
            case "name":
                newValidFields.name = value.trim().length >= 2 && value.length <= 100;
                break;
            case "description":
                newValidFields.description = value.length <= 450;
                break;
        }
        setValidFields(newValidFields);
    };

    const handleChange = (field: string, value: string) => {
        if (field === "description" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationResult = locationSchema.safeParse(formData);
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
            return
        }

        setErrors({})
        setLoading(true);

        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
            };
            if (locationType) {
                await updateLocationType(locationType.locationTypeId, data);
            } else {
                await createLocationType(data);
            }

            toast({
                title: "🎉 Thành công",
                description: isUpdate ? "Cập nhật location thành công" : "Thêm location mới thành công",
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý location:", error);
            toast({
                title: "Lỗi khi xử lý location type",
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
                    {isUpdate ? "Cập nhật Location" : "Tạo Location Mới"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Form thêm mới location. Nhập tên và mô tả location.
                </DialogDescription>
                {/* Header */}
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="absolute inset-0"></div>
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit3 className="w-7 h-7 text-primary-100" /> : <Building2 className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Location" : "Tạo Location Mới"}
                                </h1>
                                <p className="text-gray-500">
                                    {isUpdate ? "Chỉnh sửa thông tin location" : "Thêm location mới vào hệ thống"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">
                                Tên Location <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div className="relative group">
                            <Input
                                ref={nameInputRef}
                                placeholder="Ví dụ: Văn phòng chính, Chi nhánh Hà Nội..."
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                onFocus={() => setFocusedField("name")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10", // Thêm pr-10
                                    focusedField === "name" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    validFields.name && "border-green-400 bg-green-50/50",
                                    !validFields.name && formData.name && "border-red-300 bg-red-50/50",
                                )}
                            />
                            {validFields.name && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                            {!validFields.name && formData.name && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                            )}
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span
                                className={cn(
                                    "transition-colors",
                                    !validFields.name && formData.name ? "text-red-500" : "text-gray-500",
                                )}
                            >
                                {!validFields.name && formData.name
                                    ? formData.name.trim().length < 2
                                        ? "Tên phải có ít nhất 2 ký tự"
                                        : formData.name.length > 100
                                            ? "Tên không được vượt quá 100 ký tự"
                                            : "Tên không hợp lệ"
                                    : "Tên sẽ hiển thị trong danh sách locations"}
                            </span>
                            <span
                                className={cn("transition-colors", formData.name.length > 80 ? "text-orange-500" : "text-gray-400")}
                            >
                                {formData.name.length}/100
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit3 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="Mô tả chi tiết về location, chức năng, vị trí, đặc điểm..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                onFocus={() => setFocusedField("description")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
                                    focusedField === "description" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.01]",
                                    validFields.description && "border-green-400 bg-green-50/50",
                                )}
                            />
                            {validFields.description && (
                                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Mô tả giúp phân biệt location này với các location khác</span>
                            <span
                                className={cn(
                                    "transition-colors",
                                    formData.description.length > 400 ? "text-orange-500" : "text-gray-400",
                                )}
                            >
                                {formData.description.length}/450
                            </span>
                        </div>
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

export default LocationTypeDialog;