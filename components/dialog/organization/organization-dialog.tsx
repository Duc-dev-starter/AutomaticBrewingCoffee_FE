"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { PlusCircle, Loader2, Edit, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createOrganization, updateOrganization } from "@/services/organization"
import type { OrganizationDialogProps } from "@/types/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ErrorResponse } from "@/types/error"
import { organizationSchema } from "@/schema/organization"

const initialFormData = {
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    taxId: "",
    logoBase64: "",
    status: EBaseStatus.Active,
}

const OrganizationDialog = ({ open, onOpenChange, onSuccess, organization }: OrganizationDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name,
                description: organization.description || "",
                contactPhone: organization.contactPhone || "",
                contactEmail: organization.contactEmail || "",
                taxId: organization.taxId || "",
                status: organization.status,
                logoBase64: "",
            });
            setLogoPreview(organization.logoUrl || null);
            setLogoFile(null);
        } else {
            setFormData(initialFormData);
            setLogoPreview(null);
            setLogoFile(null);
        }
    }, [organization, open]);
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file hình ảnh",
                variant: "destructive",
            })
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Lỗi",
                description: "Kích thước file không được vượt quá 2MB",
                variant: "destructive",
            })
            return
        }

        const previewUrl = URL.createObjectURL(file)
        setLogoPreview(previewUrl)
        setLogoFile(file)
    }

    const handleRemoveLogo = () => {
        setLogoPreview(null)
        setLogoFile(null)
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64String = reader.result as string
                // Remove the data:image/*;base64, prefix
                const base64Data = base64String;
                resolve(base64Data)
            }
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
        })
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = organizationSchema.safeParse(formData);
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten();
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            let payload: {
                name: string;
                description: string;
                contactPhone: string;
                contactEmail: string;
                logoBase64?: string; // Đảm bảo logoBase64 là tùy chọn
                taxId: string;
                status: EBaseStatus;
            };

            if (logoFile) {
                const logoBase64 = await fileToBase64(logoFile);
                payload = {
                    name: formData.name,
                    description: formData.description,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                    logoBase64, // Chỉ gửi khi có logo mới
                    taxId: formData.taxId,
                    status: formData.status,
                };
            } else {
                payload = {
                    name: formData.name,
                    description: formData.description,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                    taxId: formData.taxId,
                    status: formData.status,
                    // Không gửi logoBase64 nếu không có logo mới
                };
            }

            if (organization) {
                await updateOrganization(organization.organizationId, payload);
                toast({
                    title: "Thành công",
                    description: "Cập nhật tổ chức thành công",
                });
            } else {
                await createOrganization(payload);
                toast({
                    title: "Thành công",
                    description: "Thêm tổ chức mới thành công",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý tổ chức:", error);
            toast({
                title: "Lỗi khi xử lý tổ chức",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const isUpdate = !!organization

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật tổ chức
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm tổ chức mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo tổ chức</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-md border">
                                    <AvatarImage src={logoPreview || "/placeholder.svg"} alt="Logo Preview" />
                                    <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : "L"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" className="relative" disabled={loading}>
                                            <input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleLogoChange}
                                                disabled={loading}
                                            />
                                            <Upload className="h-4 w-4 mr-1" />
                                            Tải lên
                                        </Button>
                                        {logoPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveLogo}
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Xóa
                                            </Button>
                                        )}
                                        {errors.logoBase64 && <p className="text-red-500 text-sm">{errors.logoBase64}</p>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="required">
                                    Tên tổ chức
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Nhập tên tổ chức"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    disabled={loading}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId">Mã số thuế</Label>
                                <Input
                                    id="taxId"
                                    placeholder="Nhập mã số thuế"
                                    value={formData.taxId}
                                    onChange={(e) => handleChange("taxId", e.target.value)}
                                    disabled={loading}
                                />
                                {errors.taxId && <p className="text-red-500 text-sm">{errors.taxId}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Email liên hệ</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    placeholder="Nhập email liên hệ"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                                    disabled={loading}
                                />
                                {errors.contactEmail && <p className="text-red-500 text-sm">{errors.contactEmail}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Số điện thoại</Label>
                                <Input
                                    id="contactPhone"
                                    placeholder="Nhập số điện thoại"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                                    disabled={loading}
                                />
                                {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="required">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="status">
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
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả tổ chức"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={loading}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Cập nhật tổ chức
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm tổ chức
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OrganizationDialog