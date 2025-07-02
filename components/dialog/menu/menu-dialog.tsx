"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Edit, CheckCircle2, AlertCircle, Zap, Save, Building2, Circle, Edit3, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { createMenu, updateMenu } from "@/services/menu";
import { getOrganizations } from "@/services/organization";
import { MenuDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { menuSchema } from "@/schema/menu";
import { Organization } from "@/interfaces/organization";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "@/hooks";
import { FormBaseStatusSelectField, FormDescriptionField, FormFooterActions } from "@/components/form";

const initialFormData = {
    organizationId: "",
    name: "",
    description: "",
    status: EBaseStatus.Active,
};

const MenuDialog = ({ open, onOpenChange, onSuccess, menu }: MenuDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [organizationSearchQuery, setOrganizationSearchQuery] = useState("");
    const [pageOrganizations, setPageOrganizations] = useState(1);
    const [hasMoreOrganizations, setHasMoreOrganizations] = useState(true);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const debouncedOrganizationSearchQuery = useDebounce(organizationSearchQuery, 300);
    const isUpdate = !!menu;

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setOrganizations([]);
            setErrors({});
            setOrganizationSearchQuery("");
            setPageOrganizations(1);
            setHasMoreOrganizations(true);
        }
    }, [open]);

    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, [open]);

    useEffect(() => {
        if (menu) {
            setFormData({
                organizationId: menu.organizationId || "",
                name: menu.name,
                description: menu.description ?? "",
                status: menu.status,
            });
        }
    }, [menu, open]);

    useEffect(() => {
        if (open) {
            fetchOrganizations(1, debouncedOrganizationSearchQuery);
        }
    }, [open, debouncedOrganizationSearchQuery]);

    const fetchOrganizations = async (pageNumber: number, query: string) => {
        try {
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
            setHasMoreOrganizations(response.items.length === 10);
            setPageOrganizations(pageNumber);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tổ chức:", error);
        }
    };

    const loadMoreOrganizations = async () => {
        const nextPage = pageOrganizations + 1;
        await fetchOrganizations(nextPage, debouncedOrganizationSearchQuery);
    };

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

    const handleChange = (field: string, value: any) => {
        if (field === "description" && typeof value === "string" && value.length > 450) {
            value = value.substring(0, 450);
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationResult = menuSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                status: formData.status,
                organizationId: formData.organizationId,
            };
            if (menu) {
                await updateMenu(menu.menuId, data);
                toast({ title: "Thành công", description: "Cập nhật menu thành công", variant: "success" });
            } else {
                await createMenu(data);
                toast({ title: "Thành công", description: "Thêm menu mới thành công", variant: "success" });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý menu:", error);
            toast({ title: "Lỗi khi xử lý menu", description: err.message, variant: "destructive" });
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
                                    {isUpdate ? "Cập nhật Menu" : "Tạo Menu Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin menu" : "Thêm menu mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 pt-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tên Menu */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Menu</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={nameInputRef}
                                    placeholder="Nhập tên menu"
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
                                            value={organizationSearchQuery}
                                            onChange={(e) => setOrganizationSearchQuery(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div id="organization-scroll" className="max-h-[200px] overflow-y-auto">
                                        <InfiniteScroll
                                            dataLength={organizations.length}
                                            next={loadMoreOrganizations}
                                            hasMore={hasMoreOrganizations}
                                            loader={<div className="p-2 text-center text-sm">Đang tải thêm...</div>}
                                            scrollableTarget="organization-scroll"
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
                            {errors.organizationId && (
                                <p className="text-red-500 text-xs mt-1">{errors.organizationId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Trạng thái */}
                        <FormBaseStatusSelectField
                            label="Trạng thái"
                            value={formData.status}
                            onChange={(value) => handleChange("status", value as EBaseStatus)}
                            placeholder="Chọn trạng thái"
                            options={Object.entries(EBaseStatusViMap).map(([value, label]) => ({
                                value,
                                label,
                            }))}
                            error={errors.status}
                        />
                    </div>

                    {/* Mô tả */}
                    <FormDescriptionField
                        label="Mô tả"
                        icon={<Edit3 className="w-4 h-4 text-primary-300" />}
                        value={formData.description}
                        onChange={(val) => handleChange("description", val)}
                        placeholder="Nhập mô tả menu"
                        disabled={loading}
                        error={errors.description}
                        maxLength={450}
                    />

                    {/* Nút điều khiển */}
                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MenuDialog;