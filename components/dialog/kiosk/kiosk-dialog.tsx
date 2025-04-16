"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Kiosk } from "@/types/kiosk";
import { Franchise } from "@/types/franchise";
import { Device } from "@/types/device";
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

interface KioskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    kiosk?: Kiosk;
}

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
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Fetch franchises and devices
    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                const [franchiseRes, deviceRes] = await Promise.all([
                    getFranchises({ status: EBaseStatus.Active }),
                    getDevices({ status: EDeviceStatus.Idle }),
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
        }
    }, [kiosk]);

    // Reset form data when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.location.trim()) {
            toast({
                title: "Lỗi",
                description: "Địa chỉ kiosk không được để trống.",
                variant: "destructive",
            });
            return;
        }
        if (!formData.franchiseId) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn một franchise.",
                variant: "destructive",
            });
            return;
        }
        if (!formData.installedDate) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ngày lắp đặt.",
                variant: "destructive",
            });
            return;
        }

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
            onSuccess();
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{kiosk ? "Chỉnh sửa kiosk" : "Thêm kiosk mới"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deviceId">Thiết bị</Label>
                        <Select
                            value={formData.deviceIds[0]}
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Địa chỉ</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Nhập địa chỉ kiosk"
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
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
                    </div>
                    <div className="grid gap-2">
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
                                            installedDate: date ? date.toISOString() : "",
                                        })
                                    }
                                    locale={vi}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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