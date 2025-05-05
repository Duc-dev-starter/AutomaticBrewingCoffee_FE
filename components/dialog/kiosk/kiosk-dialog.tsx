"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Franchise } from "@/interfaces/franchise";
import { Device } from "@/interfaces/device";
import { EBaseStatus } from "@/enum/base";
import { createKiosk, updateKiosk } from "@/services/kiosk";
import { getFranchises } from "@/services/franchise";
import { getDevices } from "@/services/device";
import { format } from "date-fns";
import { EDeviceStatus } from "@/enum/device";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import { kioskSchema } from "@/schema/kiosk";
import { KioskDialogProps } from "@/types/dialog";


const initialFormData = {
    franchiseId: "",
    deviceIds: [] as string[],
    location: "",
    status: EBaseStatus.Active,
    installedDate: "",
};

const KioskDialog = ({ open, onOpenChange, onSuccess, kiosk }: KioskDialogProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Fetch franchises and devices
    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                const [franchiseRes, deviceRes] = await Promise.all([
                    getFranchises({ status: EBaseStatus.Active }),
                    getDevices({ status: EDeviceStatus.Stock }),
                ]);
                setFranchises(franchiseRes.items);
                setDevices(deviceRes.items);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách franchise hoặc thiết bị.",
                    variant: "destructive",
                });
            } finally {
                setFetching(false);
            }
        };
        if (open) {
            fetchData();
            if (!kiosk) {
                setFormData(initialFormData);
                setErrors({});
            }
        }
    }, [open, toast, kiosk]);

    // Populate form data when editing
    useEffect(() => {
        if (kiosk) {
            setFormData({
                franchiseId: kiosk.franchiseId,
                deviceIds: kiosk.devices.length > 0 ? [kiosk.devices[0].deviceId] : [],
                location: kiosk.location,
                status: kiosk.status,
                installedDate: format(new Date(kiosk.installedDate), "yyyy-MM-dd"),
            });
            setErrors({});
        }
    }, [kiosk]);

    // Reset form data and errors when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [open]);

    const handleSubmit = async () => {
        const validationResult = kioskSchema.safeParse(formData);
        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error.errors);
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            setErrors(
                Object.fromEntries(
                    Object.entries(fieldErrors).map(([key, messages]) => [key, messages ? messages[0] : ""])
                )
            );
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const data = {
                franchiseId: formData.franchiseId,
                deviceIds: formData.deviceIds,
                location: formData.location,
                status: formData.status,
                installedDate: new Date(formData.installedDate).toISOString(),
            };
            if (kiosk) {
                await updateKiosk(kiosk.kioskId, data);
                toast({
                    title: "Thành công",
                    description: `Kiosk tại "${formData.location}" đã được cập nhật.`,
                });
            } else {
                await createKiosk(data);
                toast({
                    title: "Thành công",
                    description: `Kiosk tại "${formData.location}" đã được tạo.`,
                });
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Lỗi:", error);
            toast({
                title: "Lỗi",
                description: kiosk ? "Không thể cập nhật kiosk." : "Không thể tạo kiosk.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{kiosk ? "Chỉnh sửa kiosk" : "Thêm kiosk mới"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="franchiseId">Franchise</Label>
                        <Select
                            value={formData.franchiseId}
                            onValueChange={(value) => setFormData({ ...formData, franchiseId: value })}
                            disabled={loading || fetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn franchise" />
                            </SelectTrigger>
                            <SelectContent>
                                {franchises.map((f) => (
                                    <SelectItem key={f.franchiseId} value={f.franchiseId}>
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.franchiseId && <p className="text-red-500 text-sm">{errors.franchiseId}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="deviceId">Thiết bị</Label>
                        <Select
                            value={formData.deviceIds[0] || ""}
                            onValueChange={(value) => setFormData({ ...formData, deviceIds: value ? [value] : [] })}
                            disabled={loading || fetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn thiết bị" />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.map((d) => (
                                    <SelectItem key={d.deviceId} value={d.deviceId}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.deviceIds && <p className="text-red-500 text-sm">{errors.deviceIds}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="location">Địa chỉ</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Nhập địa chỉ kiosk"
                            disabled={loading}
                        />
                        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as EBaseStatus })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EBaseStatus.Active}>Hoạt động</SelectItem>
                                <SelectItem value={EBaseStatus.Inactive}>Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                    </div>
                    <div className="grid gap-2 min-h-[4.5rem]">
                        <Label htmlFor="installedDate">Ngày lắp đặt</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                    disabled={loading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formData.installedDate ? format(new Date(formData.installedDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.installedDate ? new Date(formData.installedDate) : undefined}
                                    onSelect={(date) =>
                                        setFormData({
                                            ...formData,
                                            installedDate: date ? format(date, "yyyy-MM-dd") : "",
                                        })
                                    }
                                    locale={vi}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.installedDate && <p className="text-red-500 text-sm">{errors.installedDate}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || fetching}>
                        {kiosk ? "Cập nhật" : "Thêm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KioskDialog;