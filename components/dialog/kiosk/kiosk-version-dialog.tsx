"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, CheckCircle2, AlertCircle, Zap, ChevronDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createKioskVersion, updateKioskVersion, getKioskTypes } from "@/services/kiosk.service";
import { KioskType } from "@/interfaces/kiosk";
import InfiniteScroll from "react-infinite-scroll-component";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { KioskDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { kioskVersionSchema } from "@/schema/kiosk.schema";
import { cn } from "@/lib/utils";
import { FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";

const initialFormData = {
    kioskTypeId: "",
    versionTitle: "",
    description: "",
    versionNumber: "",
    status: EBaseStatus.Active,
};

const KioskVersionDialog = ({ open, onOpenChange, onSuccess, kioskVersion }: KioskDialogProps) => {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [kioskTypes, setKioskTypes] = useState<KioskType[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [kioskTypeDropdownOpen, setKioskTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const versionTitleRef = useRef<HTMLInputElement>(null);

    const fetchKioskTypes = async (pageNumber: number) => {
        try {
            const response = await getKioskTypes({ page: pageNumber, size: 10 });
            if (pageNumber === 1) {
                setKioskTypes(response.items);
            } else {
                setKioskTypes((prev) => [...prev, ...response.items]);
            }
            if (response.items.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi lấy danh sách phiên bản kiosk:", error);
            toast({
                title: "Lỗi khi lấy danh sách phiên bản kiosk",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (open) {
            fetchKioskTypes(1);
        }
    }, [open]);

    useEffect(() => {
        if (kioskVersion) {
            setFormData({
                kioskTypeId: kioskVersion.kioskTypeId || "",
                versionTitle: kioskVersion.versionTitle || "",
                description: kioskVersion.description || "",
                versionNumber: kioskVersion.versionNumber || "",
                status: kioskVersion.status || EBaseStatus.Active,
            });
            setValidFields({
                versionTitle: kioskVersion.versionTitle?.trim().length >= 2 && kioskVersion.versionTitle?.length <= 100,
                versionNumber: kioskVersion.versionNumber?.trim().length >= 1 && kioskVersion.versionNumber?.length <= 50,
                description: (kioskVersion.description || "").length <= 450,
            });
        } else {
            setFormData(initialFormData);
            setValidFields({});
        }
    }, [kioskVersion, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setPage(1);
            setKioskTypes([]);
            setHasMore(true);
            setFocusedField(null);
            setStatusDropdownOpen(false);
            setKioskTypeDropdownOpen(false);
        }
    }, [open]);

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
            case "versionTitle":
                newValidFields.versionTitle = value.trim().length >= 2 && value.length <= 100;
                break;
            case "versionNumber":
                newValidFields.versionNumber = value.trim().length >= 1 && value.length <= 50;
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
        if (field === "versionTitle" || field === "versionNumber" || field === "description") {
            validateField(field, value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = kioskVersionSchema.safeParse(formData);
        if (!validationResult.success) {
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
            return
        }

        setErrors({});
        setLoading(true);
        try {
            const data = {
                versionTitle: formData.versionTitle,
                status: formData.status,
                versionNumber: formData.versionNumber,
                description: formData.description || undefined,
                kioskTypeId: formData.kioskTypeId,
            };
            if (kioskVersion) {
                await updateKioskVersion(kioskVersion.kioskVersionId, data);
                toast({
                    title: "Thành công",
                    description: "Cập nhật phiên bản kiosk thành công.",
                });
            } else {
                await createKioskVersion(data);
                toast({
                    title: "Thành công",
                    description: "Thêm phiên bản kiosk thành công.",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý phiên bản kiosk:", error);
            toast({
                title: "Lỗi khi xử lý phiên bản kiosk",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMoreKioskTypes = async () => {
        const nextPage = page + 1;
        await fetchKioskTypes(nextPage);
        setPage(nextPage);
    };

    const isUpdate = !!kioskVersion;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="absolute inset-0"></div>
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit className="w-7 h-7 text-primary-100" /> : <PlusCircle className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Phiên Bản Kiosk" : "Tạo Phiên Bản Kiosk Mới"}
                                </h1>
                                <p className="text-gray-500">
                                    {isUpdate ? "Chỉnh sửa thông tin phiên bản kiosk" : "Thêm phiên bản kiosk mới vào hệ thống"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Label className="text-sm font-medium text-gray-700 asterisk">
                                Tiêu đề phiên bản
                            </Label>
                        </div>
                        <div className="relative group">
                            <Input
                                ref={versionTitleRef}
                                placeholder="Nhập tiêu đề phiên bản"
                                value={formData.versionTitle}
                                onChange={(e) => handleChange("versionTitle", e.target.value)}
                                onFocus={() => setFocusedField("versionTitle")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                    focusedField === "versionTitle" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    validFields.versionTitle && "border-green-400 bg-green-50/50",
                                    !validFields.versionTitle && formData.versionTitle && "border-red-300 bg-red-50/50",
                                )}
                            />
                            {validFields.versionTitle && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                            {!validFields.versionTitle && formData.versionTitle && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span
                                className={cn(
                                    "transition-colors",
                                    !validFields.versionTitle && formData.versionTitle ? "text-red-500" : "text-gray-500",
                                )}
                            >
                                {!validFields.versionTitle && formData.versionTitle
                                    ? formData.versionTitle.trim().length < 2
                                        ? "Tiêu đề phải có ít nhất 2 ký tự"
                                        : formData.versionTitle.length > 100
                                            ? "Tiêu đề không được vượt quá 100 ký tự"
                                            : "Tiêu đề không hợp lệ"
                                    : "Tiêu đề sẽ hiển thị trong danh sách phiên bản kiosk"}
                            </span>
                            <span
                                className={cn("transition-colors", formData.versionTitle.length > 80 ? "text-orange-500" : "text-gray-400")}
                            >
                                {formData.versionTitle.length}/100
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Label className="text-sm font-medium text-gray-700 asterisk">
                                Số phiên bản
                            </Label>
                        </div>
                        <div className="relative group">
                            <Input
                                placeholder="Nhập số phiên bản"
                                value={formData.versionNumber}
                                onChange={(e) => handleChange("versionNumber", e.target.value)}
                                onFocus={() => setFocusedField("versionNumber")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                    focusedField === "versionNumber" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    validFields.versionNumber && "border-green-400 bg-green-50/50",
                                    !validFields.versionNumber && formData.versionNumber && "border-red-300 bg-red-50/50",
                                )}
                            />
                            {validFields.versionNumber && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                            )}
                            {!validFields.versionNumber && formData.versionNumber && (
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span
                                className={cn(
                                    "transition-colors",
                                    !validFields.versionNumber && formData.versionNumber ? "text-red-500" : "text-gray-500",
                                )}
                            >
                                {!validFields.versionNumber && formData.versionNumber
                                    ? formData.versionNumber.trim().length < 1
                                        ? "Số phiên bản phải có ít nhất 1 ký tự"
                                        : formData.versionNumber.length > 50
                                            ? "Số phiên bản không được vượt quá 50 ký tự"
                                            : "Số phiên bản không hợp lệ"
                                    : "Số phiên bản sẽ hiển thị trong danh sách phiên bản kiosk"}
                            </span>
                            <span
                                className={cn("transition-colors", formData.versionNumber.length > 40 ? "text-orange-500" : "text-gray-400")}
                            >
                                {formData.versionNumber.length}/50
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Label className="text-sm font-medium text-gray-700 asterisk">
                                Loại kiosk
                            </Label>
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setKioskTypeDropdownOpen(!kioskTypeDropdownOpen)}
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 px-4 text-left bg-white/80 backdrop-blur-sm border-2 rounded-md transition-all duration-300 flex items-center justify-between",
                                    kioskTypeDropdownOpen && "border-primary-400 ring-4 ring-primary-100 shadow-lg",
                                    !kioskTypeDropdownOpen && "border-gray-200 hover:border-gray-300",
                                )}
                            >
                                <span className="text-sm">
                                    {kioskTypes.find((type) => type.kioskTypeId === formData.kioskTypeId)?.name || "Chọn loại kiosk"}
                                </span>
                                <ChevronDown
                                    className={cn("w-4 h-4 text-gray-500 transition-transform", kioskTypeDropdownOpen && "rotate-180")}
                                />
                            </button>

                            {kioskTypeDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border-2 border-primary-200 rounded-md shadow-xl z-50 overflow-hidden max-h-[200px] overflow-y-auto">
                                    <InfiniteScroll
                                        dataLength={kioskTypes.length}
                                        next={loadMoreKioskTypes}
                                        hasMore={hasMore}
                                        loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {kioskTypes.map((kioskType) => (
                                            <button
                                                key={kioskType.kioskTypeId}
                                                type="button"
                                                onClick={() => {
                                                    handleChange("kioskTypeId", kioskType.kioskTypeId);
                                                    setKioskTypeDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors text-sm",
                                                    formData.kioskTypeId === kioskType.kioskTypeId && "bg-primary-100 text-primary-700 font-medium",
                                                )}
                                            >
                                                {kioskType.name}
                                            </button>
                                        ))}
                                    </InfiniteScroll>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Label className="text-sm font-medium text-gray-700 asterisk">
                                Trạng thái
                            </Label>
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

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder="Nhập mô tả phiên bản kiosk"
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
                            <span className="text-gray-500">Mô tả giúp phân biệt phiên bản kiosk này với các phiên bản khác</span>
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

export default KioskVersionDialog;