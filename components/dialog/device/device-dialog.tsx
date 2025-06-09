"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device";
import { PlusCircle, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDevice, updateDevice, getDeviceModels } from "@/services/device"; // Giả sử getDeviceModels tồn tại
import { DeviceDialogProps } from "@/types/dialog";
import { DeviceModel } from "@/interfaces/device"; // Giả sử DeviceModel interface tồn tại
import InfiniteScroll from "react-infinite-scroll-component";
import { ErrorResponse } from "@/types/error";
import { deviceSchema } from "@/schema/device";

const initialFormData = {
    deviceModelId: "",
    serialNumber: "",
    name: "",
    description: "",
    status: EDeviceStatus.Stock,
};

const DeviceDialog = ({ open, onOpenChange, onSuccess, device }: DeviceDialogProps) => {
    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState(initialFormData);
    const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
    const [pageDeviceModels, setPageDeviceModels] = useState<number>(1);
    const [hasMoreDeviceModels, setHasMoreDeviceModels] = useState<boolean>(true);

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

    useEffect(() => {
        if (open) {
            fetchDeviceModels(1);
            if (device) {
                setFormData({
                    name: device.name || "",
                    description: device.description || "",
                    status: device.status || EDeviceStatus.Stock,
                    deviceModelId: device.deviceModelId || "",
                    serialNumber: device.serialNumber || "",
                });
            } else { // Chế độ thêm mới
                setFormData(initialFormData);
            }
        }
    }, [device, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setPageDeviceModels(1);
            setDeviceModels([]);
            setHasMoreDeviceModels(true);
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

        const validationResult = deviceSchema.safeParse(formData);
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
                serialNumber: formData.serialNumber,
                deviceModelId: formData.deviceModelId
            };
            if (device) {
                await updateDevice(device.deviceId, data);
                toast({
                    title: "Thành công",
                    description: "Cập nhật thiết bị thành công.",
                    variant: "success"
                });
            } else {
                await createDevice(data);
                toast({
                    title: "Thành công",
                    description: "Thêm thiết bị mới thành công.",
                    variant: "success"
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xử lý thiết bị:", error);
            toast({
                title: "Có lỗi xảy ra khi xử lý thiết bị",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMoreDeviceModels = async () => {
        const nextPage = pageDeviceModels + 1;
        await fetchDeviceModels(nextPage);
        setPageDeviceModels(nextPage);
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
                            <Label htmlFor="deviceModelId" className="asterisk">
                                Mẫu thiết bị
                            </Label>
                            <Select
                                value={formData.deviceModelId}
                                onValueChange={(value) => handleChange("deviceModelId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="deviceModelId">
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
                            {errors.deviceModelId && <p className="text-red-500 text-sm">{errors.deviceModelId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serialNumber" className="asterisk">
                                Số Serial
                            </Label>
                            <Input
                                id="serialNumber"
                                placeholder="Nhập số serial"
                                value={formData.serialNumber}
                                onChange={(e) => handleChange("serialNumber", e.target.value)}
                                disabled={loading}
                            />
                            {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="asterisk">
                                Tên thiết bị
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên thiết bị"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                disabled={loading}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="asterisk">
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
                                    {Object.values(EDeviceStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {EDeviceStatusViMap[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="asterisk">
                                Mô tả
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Nhập mô tả thiết bị"
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
                                    Cập nhật
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm mới
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