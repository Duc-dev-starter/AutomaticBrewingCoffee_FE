"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Edit, CheckCircle2, AlertCircle, Zap, Save, Building2, Circle, Edit3, Monitor, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { createStore, updateStore } from "@/services/store";
import { getOrganizations } from "@/services/organization";
import { getLocationTypes } from "@/services/locationType";
import { StoreDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { storeSchema } from "@/schema/stores";
import { Organization } from "@/interfaces/organization";
import { LocationType } from "@/interfaces/location";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormDescriptionField, FormFooterActions } from "@/components/form";

const initialFormData = {
    organizationId: "",
    name: "",
    description: "",
    contactPhone: "",
    locationAddress: "",
    status: EBaseStatus.Active,
    locationTypeId: "",
};

const StoreDialog = ({ open, onOpenChange, onSuccess, store }: StoreDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [orgPage, setOrgPage] = useState(1);
    const [locPage, setLocPage] = useState(1);
    const [hasMoreOrgs, setHasMoreOrgs] = useState(true);
    const [hasMoreLocs, setHasMoreLocs] = useState(true);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
    const [isLoadingLocs, setIsLoadingLocs] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const orgObserver = useRef<IntersectionObserver>();
    const locObserver = useRef<IntersectionObserver>();

    const isUpdate = !!store;

    const lastOrgElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoadingOrgs) return;
            if (orgObserver.current) orgObserver.current.disconnect();
            orgObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreOrgs) {
                    setOrgPage((prev) => prev + 1);
                }
            });
            if (node) orgObserver.current.observe(node);
        },
        [isLoadingOrgs, hasMoreOrgs]
    );

    const lastLocElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoadingLocs) return;
            if (locObserver.current) locObserver.current.disconnect();
            locObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreLocs) {
                    setLocPage((prev) => prev + 1);
                }
            });
            if (node) locObserver.current.observe(node);
        },
        [isLoadingLocs, hasMoreLocs]
    );

    useEffect(() => {
        if (open) {
            fetchOrganizations();
            fetchLocationTypes();
            if (nameInputRef.current) {
                setTimeout(() => nameInputRef.current?.focus(), 200);
            }
        }
    }, [open, orgPage, locPage]);

    const fetchOrganizations = useCallback(async () => {
        try {
            setIsLoadingOrgs(true);
            const response = await getOrganizations({ page: orgPage, size: 20 });
            setOrganizations((prev) => [...prev, ...response.items]);
            setHasMoreOrgs(response.items.length === 20);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tổ chức:", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách tổ chức.", variant: "destructive" });
        } finally {
            setIsLoadingOrgs(false);
        }
    }, [orgPage, toast]);

    const fetchLocationTypes = useCallback(async () => {
        try {
            setIsLoadingLocs(true);
            const response = await getLocationTypes({ page: locPage, size: 20 });
            setLocationTypes((prev) => [...prev, ...response.items]);
            setHasMoreLocs(response.items.length === 20);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại địa điểm:", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách loại địa điểm.", variant: "destructive" });
        } finally {
            setIsLoadingLocs(false);
        }
    }, [locPage, toast]);

    useEffect(() => {
        if (store) {
            setFormData({
                organizationId: store.organization?.organizationId || "",
                name: store.name,
                description: store.description ?? "",
                contactPhone: store.contactPhone || "",
                locationAddress: store.locationAddress || "",
                status: store.status,
                locationTypeId: store.locationTypeId || "",
            });
            setValidFields({
                name: store.name.trim().length >= 1,
                description: (store.description || "").length <= 450,
                contactPhone: store.contactPhone?.trim().length >= 1,
                locationAddress: store.locationAddress?.trim().length >= 1,
            });
        } else {
            setFormData(initialFormData);
            setValidFields({});
            setOrganizations([]);
            setLocationTypes([]);
            setFocusedField(null);
            setOrgPage(1);
            setLocPage(1);
            setHasMoreOrgs(true);
            setHasMoreLocs(true);
        }
    }, [store, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setOrganizations([]);
            setFocusedField(null);
            setLocationTypes([]);
            setSubmitted(false);
            setErrors({});
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
            case "name":
                newValidFields.name = value.trim().length >= 1;
                break;
            case "description":
                newValidFields.description = value.length <= 450;
                break;
            case "contactPhone":
                newValidFields.contactPhone = value.trim().length >= 1;
                break;
            case "locationAddress":
                newValidFields.locationAddress = value.trim().length >= 1;
                break;
        }
        setValidFields(newValidFields);
    };

    const handleChange = (field: string, value: any) => {
        if (field === "description" && typeof value === "string" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "name" || field === "description" || field === "contactPhone" || field === "locationAddress") {
            validateField(field, value);
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const validationResult = storeSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            toast({ title: "Lỗi", description: "Vui lòng kiểm tra lại thông tin", variant: "destructive" });
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
                contactPhone: formData.contactPhone,
                organizationId: formData.organizationId,
                locationTypeId: formData.locationTypeId,
                locationAddress: formData.locationAddress
            };
            if (store) {
                await updateStore(store.storeId, data);
                toast({ title: "Thành công", description: "Cập nhật cửa hàng thành công", variant: "success" });
            } else {
                await createStore(data);
                toast({ title: "Thành công", description: "Thêm cửa hàng mới thành công", variant: "success" });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý cửa hàng:", error);
            toast({ title: "Lỗi khi xử lý cửa hàng", description: err.message, variant: "destructive" });
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
                                    {isUpdate ? "Cập nhật Cửa Hàng" : "Tạo Cửa Hàng Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin cửa hàng" : "Thêm cửa hàng mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tên Cửa Hàng */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Cửa Hàng</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={nameInputRef}
                                    placeholder="Nhập tên cửa hàng"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        errors.name && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {!errors.name && formData.name && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {errors.name && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Tổ chức */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Building2 className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tổ chức</label>
                            </div>
                            <Select
                                value={formData.organizationId}
                                onValueChange={(value) => handleChange("organizationId", value)}
                                disabled={loading || organizations.length === 0}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn tổ chức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-[200px]">
                                        {organizations.map((org, index) => (
                                            <SelectItem
                                                key={org.organizationId}
                                                value={org.organizationId}
                                                ref={index === organizations.length - 1 ? lastOrgElementRef : null}
                                            >
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                        {isLoadingOrgs && (
                                            <div className="flex justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            {errors.organizationId && (
                                <p className="text-red-500 text-xs mt-1">{errors.organizationId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Trạng thái */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Circle className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Trạng thái</label>
                            </div>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value as EBaseStatus)}
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, label]) => (
                                        <SelectItem key={key} value={key} className="text-sm">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                            )}
                        </div>

                        {/* Loại Địa Điểm */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Loại Địa Điểm</label>
                            </div>
                            <Select
                                value={formData.locationTypeId}
                                onValueChange={(value) => handleChange("locationTypeId", value)}
                                disabled={loading || locationTypes.length === 0}
                            >
                                <SelectTrigger className="h-12 text-base px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn loại địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-[200px]">
                                        {locationTypes.map((loc, index) => (
                                            <SelectItem
                                                key={loc.locationTypeId}
                                                value={loc.locationTypeId}
                                                ref={index === locationTypes.length - 1 ? lastLocElementRef : null}
                                            >
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                        {isLoadingLocs && (
                                            <div className="flex justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            {errors.locationTypeId && (
                                <p className="text-red-500 text-xs mt-1">{errors.locationTypeId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Số Điện Thoại */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Phone className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Số Điện Thoại</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập số điện thoại"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        errors.contactPhone && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {!errors.contactPhone && formData.contactPhone && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {errors.contactPhone && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {errors.contactPhone && (
                                <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                            )}
                        </div>

                        {/* Địa Chỉ */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Địa Chỉ</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập địa chỉ"
                                    value={formData.locationAddress}
                                    onChange={(e) => handleChange("locationAddress", e.target.value)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        errors.locationAddress && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {!errors.locationAddress && formData.locationAddress && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {errors.locationAddress && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {errors.locationAddress && (
                                <p className="text-red-500 text-xs mt-1">{errors.locationAddress}</p>
                            )}
                        </div>
                    </div>

                    {/* Mô tả */}
                    <FormDescriptionField
                        value={formData.description}
                        onChange={(val) => handleChange("description", val)}
                        onFocus={() => setFocusedField("description")}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                        error={errors.description}
                        submitted={submitted}
                        valid={validFields.description}
                        focused={focusedField === "description"}
                    />


                    {/* Nút điều khiển */}
                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StoreDialog;