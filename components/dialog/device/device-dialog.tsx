"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDeviceStatus } from "@/enum/device";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDevice, updateDevice } from "@/services/device";
import { Device } from "@/interfaces/device";

type DeviceDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    device?: Device;
}

const initialFormData = {
    name: "",
    description: "",
    status: EDeviceStatus.Idle,
};

const DeviceDialog = ({ open, onOpenChange, onSuccess, device }: DeviceDialogProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

    // Populate form data when editing
    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name,
                description: device.description,
                status: device.status,
            });
        }
    }, [device]);

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

        if (!formData.name.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên thiết bị",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            if (device) {
                await updateDevice(device.deviceId, formData);
                toast({
                    title: "Thành công",
                    description: "Cập nhật thiết bị thành công",
                });
            } else {
                await createDevice(formData);
                toast({
                    title: "Thành công",
                    description: "Thêm thiết bị mới thành công",
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi khi xử lý thiết bị:", error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xử lý thiết bị. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
    };

    // Ánh xạ giá trị enum sang tên hiển thị
    const deviceStatusMap = {
        [EDeviceStatus.Idle]: "Chờ sử dụng",
        [EDeviceStatus.Working]: "Đang hoạt động",
        [EDeviceStatus.Repair]: "Đang bảo trì",
        [EDeviceStatus.Broken]: "Đã ngừng sử dụng",
    };

    const isUpdate = !!device;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật thiết bị
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm thiết bị mới
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="required">
                                Tên thiết bị
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên thiết bị"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả thiết bị"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                disabled={isSubmitting}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="required">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(EDeviceStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {deviceStatusMap[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Cập nhật thiết bị
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm thiết bị
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DeviceDialog;