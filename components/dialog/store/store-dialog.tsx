"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Building2, Monitor, MapPin, Phone, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { createStore, updateStore } from "@/services/store.service";
import { getOrganizations } from "@/services/organization.service";
import { getLocationTypes } from "@/services/locationType.service";
import { StoreDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { storeSchema } from "@/schema/stores.schema";
import { Organization } from "@/interfaces/organization";
import { LocationType } from "@/interfaces/location";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "@/hooks";
import { FormDescriptionField, FormFooterActions } from "@/components/form";
import { parseErrors } from "@/utils";
import { useAppStore } from "@/stores/use-app-store";

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
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
    const [orgPage, setOrgPage] = useState<number>(1);
    const [locPage, setLocPage] = useState<number>(1);
    const [hasMoreOrgs, setHasMoreOrgs] = useState<boolean>(true);
    const [hasMoreLocs, setHasMoreLocs] = useState<boolean>(true);
    const [orgSearchQuery, setOrgSearchQuery] = useState("");
    const [locSearchQuery, setLocSearchQuery] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { account } = useAppStore();

    const debouncedOrgSearchQuery = useDebounce(orgSearchQuery, 300);
    const debouncedLocSearchQuery = useDebounce(locSearchQuery, 300);
    const isUpdate = !!store;

    useEffect(() => {
        if (open) {
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
                    organizationId: !!store.organization?.organizationId,
                    locationTypeId: !!store.locationTypeId,
                });
            }
            else {
                setFormData(initialFormData);
                setValidFields({});
            }

            setFocusedField(null);
            setSubmitted(false);
            setErrors({});
            setOrganizations([]);
            setLocationTypes([]);
            setOrgPage(1);
            setLocPage(1);
            setHasMoreOrgs(true);
            setHasMoreLocs(true);
            setOrgSearchQuery("");
            setLocSearchQuery("");

        }
    }, [open, store]);

    // Fetch organizations and location types with debounced search
    useEffect(() => {
        if (open) {
            fetchOrganizations(1, debouncedOrgSearchQuery);
            fetchLocationTypes(1, debouncedLocSearchQuery);
        }
    }, [open, debouncedOrgSearchQuery, debouncedLocSearchQuery]);

    const fetchOrganizations = async (pageNumber: number, query: string) => {
        try {
            if (account?.roleName !== "Admin") {
                setOrganizations([]);
            }
            const response = await getOrganizations({
                page: pageNumber,
                size: 10,
                filterBy: "name",
                filterQuery: query,
            });
            if (pageNumber === 1) {
                setOrganizations(response.items);
            } else {
                setOrganizations((prev) => [...prev, ...response.items]);
            }
            setHasMoreOrgs(response.items.length === 10);
            setOrgPage(pageNumber);
        } catch (error) {
            console.error("Error fetching organizations:", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách tổ chức.", variant: "destructive" });
        }
    };

    const fetchLocationTypes = async (pageNumber: number, query: string) => {
        try {
            const response = await getLocationTypes({
                page: pageNumber,
                size: 10,
                filterBy: "name",
                filterQuery: query,
            });
            if (pageNumber === 1) {
                setLocationTypes(response.items);
            } else {
                setLocationTypes((prev) => [...prev, ...response.items]);
            }
            setHasMoreLocs(response.items.length === 10);
            setLocPage(pageNumber);
        } catch (error) {
            console.error("Error fetching location types:", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách loại địa điểm.", variant: "destructive" });
        }
    };

    const loadMoreOrganizations = async () => {
        const nextPage = orgPage + 1;
        await fetchOrganizations(nextPage, debouncedOrgSearchQuery);
    };

    const loadMoreLocationTypes = async () => {
        const nextPage = locPage + 1;
        await fetchLocationTypes(nextPage, debouncedLocSearchQuery);
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
            case "organizationId":
                newValidFields.organizationId = !!value;
                break;
            case "locationTypeId":
                newValidFields.locationTypeId = !!value;
                break;
        }
        setValidFields(newValidFields);
    };

    const handleChange = (field: string, value: any) => {
        if (field === "description" && typeof value === "string" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (["name", "description", "contactPhone", "locationAddress", "organizationId", "locationTypeId"].includes(field)) {
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
            const parsedErrors = parseErrors(validationResult.error)
            setErrors(parsedErrors)
            return
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
                locationAddress: formData.locationAddress,
            };
            if (store) {
                await updateStore(store.storeId, data);
                toast({ title: "Thành công", description: "Cửa hàng đã được cập nhật", variant: "success" });
            } else {
                await createStore(data);
                toast({ title: "Thành công", description: "Cửa hàng mới đã được tạo", variant: "success" });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Error processing store:", err);
            toast({ title: "Lỗi", description: err.message, variant: "destructive" });
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

                <div className="px-6 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tên Cửa Hàng */}
                        <div className={`space-y-3 ${account?.roleName !== "Admin" ? "col-span-2" : ""}`}>
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
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "name" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    )}
                                />
                            </div>
                            {submitted && errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Tổ chức */}
                        {account?.roleName === "Admin" && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Building2 className="w-4 h-4 text-primary-300" />
                                    <label className="text-sm font-medium text-gray-700 asterisk">Tổ chức</label>
                                </div>
                                <Select
                                    value={formData.organizationId}
                                    onValueChange={(value) => handleChange("organizationId", value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                        <SelectValue placeholder="Chọn tổ chức" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Tìm kiếm tổ chức..."
                                                className="h-10 text-xs px-3"
                                                value={orgSearchQuery}
                                                onChange={(e) => setOrgSearchQuery(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div id="org-scroll" className="max-h-[200px] overflow-y-auto">
                                            <InfiniteScroll
                                                dataLength={organizations.length}
                                                next={loadMoreOrganizations}
                                                hasMore={hasMoreOrgs}
                                                loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                                scrollableTarget="org-scroll"
                                            >
                                                {organizations.map((org) => (
                                                    <SelectItem key={org.organizationId} value={org.organizationId}>
                                                        {org.name}
                                                    </SelectItem>
                                                ))}
                                            </InfiniteScroll>
                                        </div>
                                    </SelectContent>
                                </Select>
                                {submitted && errors.organizationId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.organizationId}</p>
                                )}
                            </div>
                        )}
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
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
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
                            {submitted && errors.status && (
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
                                disabled={loading}
                            >
                                <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                    <SelectValue placeholder="Chọn loại địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Tìm kiếm loại địa điểm..."
                                            className="h-10 text-xs px-3"
                                            value={locSearchQuery}
                                            onChange={(e) => setLocSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="loc-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={locationTypes.length}
                                            next={loadMoreLocationTypes}
                                            hasMore={hasMoreLocs}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="loc-scroll"
                                        >
                                            {locationTypes.map((loc) => (
                                                <SelectItem key={loc.locationTypeId} value={loc.locationTypeId}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </InfiniteScroll>
                                    </div>
                                </SelectContent>
                            </Select>
                            {submitted && errors.locationTypeId && (
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
                                    onFocus={() => setFocusedField("contactPhone")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "contactPhone" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    )}
                                />
                            </div>
                            {submitted && errors.contactPhone && (
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
                                    onFocus={() => setFocusedField("locationAddress")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "locationAddress" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                    )}
                                />
                            </div>
                            {submitted && errors.locationAddress && (
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
                        focused={focusedField === "description"}
                    />

                    {/* Nút điều khiển */}
                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        onSubmit={handleSubmit}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StoreDialog;