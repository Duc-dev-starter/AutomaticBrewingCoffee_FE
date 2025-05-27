"use client"

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { KioskDialogProps } from "@/types/dialog";
import { createKioskType, updateKioskType } from "@/services/kiosk";
import { ErrorResponse } from "@/types/error";
import { kioskTypeSchema } from "@/schema/kiosk";

const initialFormData = {
    name: "",
    description: "",
    status: EBaseStatus.Active,
};

const KioskTypeDialog = ({ open, onOpenChange, onSuccess, kioskType }: KioskDialogProps) => {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    // Populate form data when editing
    useEffect(() => {
        if (kioskType) {
            setFormData({
                name: kioskType.name,
                description: kioskType.description || "",
                status: kioskType.status || EBaseStatus.Active,
            });
        }
    }, [kioskType]);

    // Reset form data when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const validationResult = kioskTypeSchema.safeParse(formData);
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
            };
            if (kioskType) {
                await updateKioskType(kioskType.kioskTypeId, data);
                toast({
                    title: "Thành công",
                    description: "Cập nhật loại kiosk thành công",
                });
            } else {
                await createKioskType(data);
                toast({
                    title: "Thành công",
                    description: "Thêm loại kiosk mới thành công",
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý loại kiosk:", error);
            toast({
                title: "Lỗi khi xử lý loại kiosk",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const isUpdate = !!kioskType;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật loại kiosk
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm loại kiosk mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="required">
                                Tên loại kiosk
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên loại kiosk"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
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
                                placeholder="Nhập mô tả loại kiosk"
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
                                    Cập nhật loại kiosk
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm loại kiosk
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default KioskTypeDialog;