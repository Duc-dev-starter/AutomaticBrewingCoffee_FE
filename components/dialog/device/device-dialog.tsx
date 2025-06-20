"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device";
import { MapPin, Sparkles, CheckCircle2, AlertCircle, Save, X, Building2, Edit3, Zap, Monitor, Boxes, Hash, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDevice, updateDevice, getDeviceModels } from "@/services/device";
import { DeviceDialogProps } from "@/types/dialog";
import { DeviceModel } from "@/interfaces/device";
import { ErrorResponse } from "@/types/error";
import { deviceSchema } from "@/schema/device";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "@/hooks";

const initialFormData = {
    deviceModelId: "",
    serialNumber: "",
    name: "",
    description: "",
    status: EDeviceStatus.Stock,
};

const DeviceDialog = ({ open, onOpenChange, onSuccess, device }: DeviceDialogProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
    const [pageDeviceModels, setPageDeviceModels] = useState<number>(1);
    const [hasMoreDeviceModels, setHasMoreDeviceModels] = useState<boolean>(true);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deviceModelSearchQuery, setDeviceModelSearchQuery] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);

    const debouncedSearchQuery = useDebounce(deviceModelSearchQuery, 300);
    const isUpdate = !!device;

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setValidFields({});
            setIsSuccess(false);
            setFocusedField(null);
            setDeviceModels([]);
            setPageDeviceModels(1);
            setHasMoreDeviceModels(true);
            setSubmitted(false);
            setErrors({});
            setDeviceModelSearchQuery("");
        }
    }, [open]);

    // Auto-focus name field when dialog opens
    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    // Populate form data for editing
    useEffect(() => {
        if (device) {
            setFormData({
                deviceModelId: device.deviceModelId || "",
                serialNumber: device.serialNumber || "",
                name: device.name || "",
                description: device.description || "",
                status: device.status || EDeviceStatus.Stock,
            });
            setValidFields({
                name: device.name?.trim().length >= 2 && device.name.length <= 100,
                description: (device.description || "").length <= 450,
                serialNumber: device.serialNumber?.trim().length >= 2 && device.serialNumber.length <= 100,
                deviceModelId: !!device.deviceModelId,
            });
        }
    }, [device]);

    // Fetch device models with debounced search
    useEffect(() => {
        if (open) {
            fetchDeviceModels(1, debouncedSearchQuery);
        }
    }, [open, debouncedSearchQuery]);

    const fetchDeviceModels = async (pageNumber: number, query: string) => {
        try {
            const response = await getDeviceModels({
                page: pageNumber,
                size: 10,
                filterBy: "modelName",
                filterQuery: query,
            });
            if (pageNumber === 1) {
                setDeviceModels(response.items);
            } else {
                setDeviceModels((prev) => [...prev, ...response.items]);
            }
            setHasMoreDeviceModels(response.items.length === 10);
            setPageDeviceModels(pageNumber);
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Error fetching device models:", err);
        }
    };

    const loadMoreDeviceModels = async () => {
        const nextPage = pageDeviceModels + 1;
        await fetchDeviceModels(nextPage, debouncedSearchQuery);
    };

    // Ctrl+Enter shortcut for submission
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
            case "serialNumber":
                newValidFields.serialNumber = value.trim().length >= 2 && value.length <= 100;
                break;
            case "deviceModelId":
                newValidFields.deviceModelId = !!value;
                break;
        }
        setValidFields(newValidFields);
    };

    const handleChange = (field: string, value: any) => {
        if (field === "description" && typeof value === "string" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "name" || field === "description" || field === "serialNumber" || field === "deviceModelId") {
            validateField(field, value);
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const validationResult = deviceSchema.safeParse(formData);
        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            const errorStrings: Record<string, string> = {};
            Object.entries(fieldErrors).forEach(([key, value]) => {
                if (value && value.length > 0) {
                    errorStrings[key] = value[0];
                }
            });
            setErrors(errorStrings);
            return;
        }
        setErrors({});

        setLoading(true);
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
                serialNumber: formData.serialNumber,
                deviceModelId: formData.deviceModelId,
            };
            if (device) {
                await updateDevice(device.deviceId, data);
                toast({ title: "Thành công", description: "Thiết bị đã được cập nhật" });
            } else {
                await createDevice(data);
                toast({ title: "Thành công", description: "Thiết bị mới đã được tạo" });
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onSuccess?.();
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Error processing device:", err);
        } finally {
            setLoading(false);
        }
    };

    const selectedDeviceModel = deviceModels.find((model) => model.deviceModelId === formData.deviceModelId);

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] border-0 bg-primary-100 backdrop-blur-xl">
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                <CheckCircle2 className="w-10 h-10 text-primary-300 animate-bounce" />
                            </div>
                            <div className="absolute -top-1 -right-1 animate-spin">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-primary-300">🎉 Thành công!</h2>
                            <p className="text-gray-600">{isUpdate ? "Thiết bị đã được cập nhật" : "Thiết bị mới đã được tạo"}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogTitle className="sr-only">{isUpdate ? "Cập nhật Thiết Bị" : "Tạo Thiết Bị Mới"}</DialogTitle>
                <DialogDescription className="sr-only">Biểu mẫu để thêm hoặc cập nhật thiết bị.</DialogDescription>
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="absolute inset-0"></div>
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit3 className="w-7 h-7 text-primary-100" /> : <Building2 className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Thiết Bị" : "Tạo Thiết Bị Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin thiết bị" : "Thêm thiết bị mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tên Thiết Bị */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Thiết Bị</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={nameInputRef}
                                    placeholder="Nhập tên thiết bị"
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

                        {/* Mẫu Thiết Bị */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Boxes className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Mẫu Thiết Bị</label>
                            </div>
                            <Select
                                value={formData.deviceModelId}
                                onValueChange={(value) => handleChange("deviceModelId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn mẫu sản phẩm">
                                        {selectedDeviceModel ? selectedDeviceModel.modelName : "Chọn mẫu sản phẩm"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm mẫu thiết bị..."
                                            className="h-10 text-xs px-3"
                                            value={deviceModelSearchQuery}
                                            onChange={(e) => setDeviceModelSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="device-model-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={deviceModels.length}
                                            next={loadMoreDeviceModels}
                                            hasMore={hasMoreDeviceModels}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="device-model-scroll"
                                        >
                                            {deviceModels.map((model) => (
                                                <SelectItem key={model.deviceModelId} value={model.deviceModelId}>
                                                    {model.modelName}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </div>
                                </SelectContent>
                            </Select>
                            {submitted && errors.deviceModelId && (
                                <p className="text-red-500 text-xs mt-1">{errors.deviceModelId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Số Serial */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Hash className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Số Serial</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập số serial"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleChange("serialNumber", e.target.value)}
                                    onFocus={() => setFocusedField("serialNumber")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "serialNumber" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.serialNumber && "border-green-400 bg-green-50/50",
                                        !validFields.serialNumber && formData.serialNumber && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.serialNumber && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.serialNumber && formData.serialNumber && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.serialNumber && (
                                <p className="text-red-500 text-xs mt-1">{errors.serialNumber}</p>
                            )}
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Circle className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Trạng thái</label>
                            </div>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value as EDeviceStatus)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EDeviceStatusViMap).map(([key, label]) => (
                                        <SelectItem key={key} value={key} className="text-sm">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {submitted && errors.status && (
                                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit3 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">Mô tả</label>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder="Mô tả chi tiết về thiết bị..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                onFocus={() => setFocusedField("description")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
                                    focusedField === "description" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.01]",
                                    validFields.description && "border-green-400 bg-green-50/50"
                                )}
                            />
                            {validFields.description && (
                                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className={cn("transition-colors", formData.description.length > 400 ? "text-orange-500" : "text-gray-400")}>
                                {formData.description.length}/450
                            </span>
                        </div>
                        {submitted && errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Nút điều khiển */}
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
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={cn(
                                    "h-11 px-8 bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                    loading && "opacity-60 cursor-not-allowed hover:scale-100"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 w-4 h-4" />
                                        {isUpdate ? "Cập nhật" : "Tạo"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeviceDialog;