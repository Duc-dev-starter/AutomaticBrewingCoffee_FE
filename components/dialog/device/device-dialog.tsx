"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device";
import { MapPin, Sparkles, CheckCircle2, AlertCircle, Save, X, Building2, Edit3, Zap, ChevronDown, Monitor, Boxes, Hash, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDevice, updateDevice, getDeviceModels } from "@/services/device";
import { DeviceDialogProps } from "@/types/dialog";
import { DeviceModel } from "@/interfaces/device";
import { ErrorResponse } from "@/types/error";
import { deviceSchema } from "@/schema/device";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";

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
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const isUpdate = !!device;

    // Reset form khi dialog đóng
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setValidFields({});
            setIsSuccess(false);
            setFocusedField(null);
            setStatusDropdownOpen(false);
            setDeviceModels([]);
            setPageDeviceModels(1);
            setHasMoreDeviceModels(true);
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

    // Lấy danh sách mẫu thiết bị
    useEffect(() => {
        if (open) {
            fetchDeviceModels(1);
        }
    }, [open]);

    const fetchDeviceModels = async (pageNumber: number) => {
        try {
            const response = await getDeviceModels({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setDeviceModels(response.items);
            } else {
                setDeviceModels(prev => [...prev, ...response.items]);
            }
            if (response.items.length < 10) {
                setHasMoreDeviceModels(false);
            }
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi lấy danh sách mẫu thiết bị:", err);
            toast({
                title: "Lỗi khi lấy danh sách mẫu thiết bị",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const loadMoreDeviceModels = async () => {
        const nextPage = pageDeviceModels + 1;
        await fetchDeviceModels(nextPage);
        setPageDeviceModels(nextPage);
    };

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationResult = deviceSchema.safeParse(formData);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            toast({
                title: "Lỗi validation",
                description: Object.values(errors).flat().join(", "),
                variant: "destructive",
            });
            return;
        }

        if (!validFields.name || !validFields.serialNumber || !validFields.deviceModelId) return;

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
            } else {
                await createDevice(data);
            }

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                toast({
                    title: "🎉 Thành công",
                    description: isUpdate ? "Cập nhật thiết bị thành công" : "Thêm thiết bị mới thành công",
                    variant: "success",
                });
                onSuccess?.();
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý thiết bị:", error);
            toast({
                title: "Lỗi khi xử lý thiết bị",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] border-0 bg-primary-100 backdrop-blur-xl">
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
                            <h2 className="text-2xl font-bold text-primary-300">
                                🎉 Thành công!
                            </h2>
                            <p className="text-gray-600">{isUpdate ? "Thiết bị đã được cập nhật" : "Thiết bị mới đã được tạo"}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogTitle className="sr-only">
                    {isUpdate ? "Cập nhật Thiết Bị" : "Tạo Thiết Bị Mới"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Form thêm mới thiết bị. Nhập tên, mô tả, trạng thái và loại thiết bị.
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
                                    {isUpdate ? "Cập nhật Thiết Bị" : "Tạo Thiết Bị Mới"}
                                </h1>
                                <p className="text-gray-500">
                                    {isUpdate ? "Chỉnh sửa thông tin thiết bị" : "Thêm thiết bị mới vào hệ thống"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    {/* Trường Tên Thiết Bị */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Monitor className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Tên Thiết Bị
                            </label>
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
                                    : "Tên sẽ hiển thị trong danh sách thiết bị"}
                            </span>
                            <span
                                className={cn("transition-colors", formData.name.length > 80 ? "text-orange-500" : "text-gray-400")}
                            >
                                {formData.name.length}/100
                            </span>
                        </div>
                    </div>

                    {/* Trường Mẫu Thiết Bị */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Boxes className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Mẫu Thiết Bị
                            </label>
                        </div>
                        <div className="relative">
                            <Select
                                value={formData.deviceModelId}
                                onValueChange={(value) => handleChange("deviceModelId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn mẫu thiết bị" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] overflow-y-auto" id="select-content-devicemodel">
                                    <InfiniteScroll
                                        dataLength={deviceModels.length}
                                        next={loadMoreDeviceModels}
                                        hasMore={hasMoreDeviceModels}
                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                        scrollableTarget="select-content-devicemodel"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {deviceModels.map((model) => (
                                            <SelectItem key={model.deviceModelId} value={model.deviceModelId}>
                                                {model.modelName}
                                            </SelectItem>
                                        ))}
                                        {!hasMoreDeviceModels && deviceModels.length === 0 && (
                                            <div className="p-2 text-center text-sm text-muted-foreground">Không có mẫu thiết bị nào.</div>
                                        )}
                                    </InfiniteScroll>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Trường Số Serial */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">
                                Số Serial
                            </label>
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
                                    !validFields.serialNumber && formData.serialNumber && "border-red-300 bg-red-50/50",
                                )}
                            />
                            {validFields.serialNumber && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                            {!validFields.serialNumber && formData.serialNumber && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span
                                className={cn(
                                    "transition-colors",
                                    !validFields.serialNumber && formData.serialNumber ? "text-red-500" : "text-gray-500",
                                )}
                            >
                                {!validFields.serialNumber && formData.serialNumber
                                    ? formData.serialNumber.trim().length < 2
                                        ? "Số serial phải có ít nhất 2 ký tự"
                                        : formData.serialNumber.length > 100
                                            ? "Số serial không được vượt quá 100 ký tự"
                                            : "Số serial không hợp lệ"
                                    : "Số serial là duy nhất cho mỗi thiết bị"}
                            </span>
                            <span
                                className={cn("transition-colors", formData.serialNumber.length > 80 ? "text-orange-500" : "text-gray-400")}
                            >
                                {formData.serialNumber.length}/100
                            </span>
                        </div>
                    </div>

                    {/* Trường Trạng Thái */}
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
                                <span className="text-sm">{EDeviceStatusViMap[formData.status as keyof typeof EDeviceStatusViMap]}</span>
                                <ChevronDown
                                    className={cn("w-4 h-4 text-gray-500 transition-transform", statusDropdownOpen && "rotate-180")}
                                />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden">
                                    {Object.entries(EDeviceStatusViMap).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                handleChange("status", key);
                                                setStatusDropdownOpen(false);
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
                        </div>
                    </div>

                    {/* Trường Mô Tả */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit3 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
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
                                    validFields.description && "border-green-400 bg-green-50/50",
                                )}
                            />
                            {validFields.description && (
                                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Mô tả giúp phân biệt thiết bị này với các thiết bị khác</span>
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
                                Hủy bỏ
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading || !validFields.name || !validFields.serialNumber || !validFields.deviceModelId}
                                className={cn(
                                    "h-11 px-8 bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                    (!validFields.name || !validFields.serialNumber || !validFields.deviceModelId || loading) && "opacity-60 cursor-not-allowed hover:scale-100",
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
                                        {isUpdate ? "Cập nhật" : "Tạo mới"}
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

export default DeviceDialog;