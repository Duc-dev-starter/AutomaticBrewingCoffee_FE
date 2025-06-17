"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, CheckCircle2, AlertCircle, Zap, ChevronDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { createMenu, updateMenu } from "@/services/menu";
import { getOrganizations } from "@/services/organization";
import { MenuDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";
import { menuSchema } from "@/schema/menu";
import { Organization } from "@/interfaces/organization";
import { cn } from "@/lib/utils";

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
    const [validFields, setValidFields] = useState<Record<string, boolean>>({});
    const [organizationDropdownOpen, setOrganizationDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const fetchOrganizations = async () => {
        try {
            const response = await getOrganizations();
            setOrganizations(response.items);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tổ chức:", error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchOrganizations();
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
            setValidFields({
                name: menu.name.trim().length >= 2 && menu.name.length <= 100,
                description: (menu.description || "").length <= 450,
            });
        } else {
            setFormData(initialFormData);
            setValidFields({});
        }
    }, [menu, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setOrganizations([]);
            setOrganizationDropdownOpen(false);
            setStatusDropdownOpen(false);
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = menuSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            return;
        }

        if (!validFields.name) return;

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

    const isUpdate = !!menu;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 border-0 bg-white shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
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
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Tổ chức <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOrganizationDropdownOpen(!organizationDropdownOpen)}
                                disabled={loading || organizations.length === 0}
                                className={cn(
                                    "w-full h-12 px-4 text-left bg-white border-2 rounded-md flex items-center justify-between",
                                    organizationDropdownOpen && "border-primary-400 ring-4 ring-primary-100"
                                )}
                            >
                                <span>{organizations.find((org) => org.organizationId === formData.organizationId)?.name || "Chọn tổ chức"}</span>
                                <ChevronDown className={cn("w-4 h-4", organizationDropdownOpen && "rotate-180")} />
                            </button>
                            {organizationDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-primary-200 rounded-md shadow-xl z-50 max-h-[200px] overflow-y-auto">
                                    {organizations.map((org) => (
                                        <button
                                            key={org.organizationId}
                                            type="button"
                                            onClick={() => {
                                                handleChange("organizationId", org.organizationId);
                                                setOrganizationDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-primary-50"
                                        >
                                            {org.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Tên menu <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                ref={nameInputRef}
                                placeholder="Nhập tên menu"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                                className={cn(
                                    "h-12 px-4 border-2",
                                    validFields.name && "border-green-400",
                                    !validFields.name && formData.name && "border-red-300"
                                )}
                            />
                            {validFields.name && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                            {!validFields.name && formData.name && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />}
                        </div>
                        <div className="text-xs text-gray-500">{formData.name.length}/100</div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Trạng thái <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 px-4 text-left bg-white border-2 rounded-md flex items-center justify-between",
                                    statusDropdownOpen && "border-primary-400 ring-4 ring-primary-100"
                                )}
                            >
                                <span>{EBaseStatusViMap[formData.status as keyof typeof EBaseStatusViMap]}</span>
                                <ChevronDown className={cn("w-4 h-4", statusDropdownOpen && "rotate-180")} />
                            </button>
                            {statusDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-primary-200 rounded-md shadow-xl z-50">
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                handleChange("status", key);
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-primary-50"
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
                        <div className="relative">
                            <Textarea
                                placeholder="Nhập mô tả menu"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[100px] p-4 border-2"
                            />
                            {validFields.description && <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />}
                        </div>
                        <div className="text-xs text-gray-500">{formData.description.length}/450</div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Zap className="w-3 h-3" />
                            <span>Ctrl+Enter để lưu</span>
                        </div>
                        <div className="flex space-x-3">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={loading || !validFields.name}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default MenuDialog;