"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, CheckCircle2, AlertCircle, Building2, Edit3, Monitor, Smartphone, ChevronDown, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeviceDialogProps } from "@/types/dialog";
import { createDeviceType, updateDeviceType } from "@/services/device.service";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ErrorResponse } from "@/types/error";
import { deviceTypeSchema } from "@/schema/device.schema";
import { cn } from "@/lib/utils";
import { FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";

const initialFormData = {
    name: "",
    description: "",
    status: EBaseStatus.Active,
    isMobileDevice: false,
};

const DeviceTypeDialog = ({ open, onOpenChange, onSuccess, deviceType }: DeviceDialogProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState(initialFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const isUpdate = !!deviceType;

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setSubmitted(false);
            setValidFields({});
            setFocusedField(null);
            setStatusDropdownOpen(false);
            setErrors({});
        }
    }, [open]);

    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        if (deviceType) {
            setFormData({
                name: deviceType.name,
                description: deviceType.description || "",
                status: deviceType.status || EBaseStatus.Active,
                isMobileDevice: deviceType.isMobileDevice ?? false,
            });
            setValidFields({
                name: deviceType.name.trim().length >= 2 && deviceType.name.length <= 100,
                description: (deviceType.description || "").length <= 450,
            });
        }
    }, [deviceType]);

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

    const handleChange = (field: string, value: any) => {
        if (field === "description" && typeof value === "string" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "name" || field === "description") {
            validateField(field, value);
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const validationResult = deviceTypeSchema.safeParse(formData);
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
            return
        }
        setLoading(true);
        setErrors({});

        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
                isMobileDevice: formData.isMobileDevice,
            };
            if (deviceType) {
                await updateDeviceType(deviceType.deviceTypeId, data);
            } else {
                await createDeviceType(data);
            }
            toast({
                title: "🎉 Thành công",
                description: isUpdate ? "Cập nhật loại thiết bị thành công" : "Thêm loại thiết bị mới thành công",
                variant: "success",
            });
            onSuccess?.();
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý loại thiết bị:", error);
            toast({
                title: "Lỗi khi xử lý loại thiết bị",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogTitle className="sr-only">
                    {isUpdate ? "Cập nhật Loại Thiết Bị" : "Tạo Loại Thiết Bị Mới"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Form thêm mới loại thiết bị. Nhập tên, mô tả, trạng thái và loại thiết bị.
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
                                    {isUpdate ? "Cập nhật Loại Thiết Bị" : "Tạo Loại Thiết Bị Mới"}
                                </h1>
                                <p className="text-gray-500">
                                    {isUpdate ? "Chỉnh sửa thông tin loại thiết bị" : "Thêm loại thiết bị mới vào hệ thống"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Tên Loại Thiết Bị
                            </label>
                        </div>

                        <div className="relative group">
                            <Input
                                ref={nameInputRef}
                                placeholder="Ví dụ: Máy tính, Điện thoại..."
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

                        {submitted && (
                            <div className="flex justify-between items-center text-xs mt-1 h-[18px]">
                                <span
                                    className={cn(
                                        "transition-colors",
                                        errors.name ? "text-red-500" : "text-gray-500"
                                    )}
                                >
                                    {errors.name || ""}
                                </span>
                                <span
                                    className={cn(
                                        "transition-colors",
                                        formData.name.length > 80 ? "text-orange-500" : "text-gray-400"
                                    )}
                                >
                                    {formData.name.length}/100
                                </span>
                            </div>
                        )}
                    </div>


                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Circle className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Trạng thái
                            </label>
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 px-4 text-left bg-white/80 backdrop-blur-sm border-2 rounded-md transition-all duration-300 flex items-center justify-between",
                                    statusDropdownOpen && "border-primary-400 ring-4 ring-primary-100 shadow-lg",
                                    !statusDropdownOpen && "border-gray-200 hover:border-gray-300",
                                )}
                            >
                                <span className="text-sm">{EBaseStatusViMap[formData.status as keyof typeof EBaseStatusViMap]}</span>
                                <ChevronDown
                                    className={cn("w-4 h-4 text-gray-500 transition-transform", statusDropdownOpen && "rotate-180")}
                                />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden">
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                handleChange("status", key)
                                                setStatusDropdownOpen(false)
                                            }}
                                            className={cn(
                                                "w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors text-sm",
                                                formData.status === key && "bg-primary-100 text-primary-700 font-medium",
                                            )}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {submitted && errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                        </div>
                    </div>

                    {/* Mobile Device Field - Custom Radio */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Monitor className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Loại thiết bị
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleChange("isMobileDevice", false)}
                                disabled={loading}
                                className={cn(
                                    "h-16 px-4 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm flex items-center space-x-3",
                                    !formData.isMobileDevice
                                        ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100 shadow-lg"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                        !formData.isMobileDevice ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500",
                                    )}
                                >
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">Máy phân phát</div>
                                    <div className="text-xs text-gray-500">Máy thả ly, Máy làm đá</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleChange("isMobileDevice", true)}
                                disabled={loading}
                                className={cn(
                                    "h-16 px-4 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm flex items-center space-x-3",
                                    formData.isMobileDevice
                                        ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100 shadow-lg"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                        formData.isMobileDevice ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500",
                                    )}
                                >
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">Di động</div>
                                    <div className="text-xs text-gray-500">Phone, Tablet</div>
                                </div>
                            </button>
                        </div>
                        {submitted && errors.isMobileDevice && <p className="text-red-500 text-xs mt-1">{errors.isMobileDevice}</p>}
                    </div>


                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit3 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        </div>

                        <div className="relative group">
                            <Textarea
                                placeholder="Mô tả chi tiết về loại thiết bị..."
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

export default DeviceTypeDialog;