import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Device } from "@/types/device";
import { format } from "date-fns";
import { EDeviceStatusViMap } from "@/enum/device";

interface DeviceDetailDialogProps {
    device: Device | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DeviceDetailDialog = ({ device, open, onOpenChange }: DeviceDetailDialogProps) => {
    if (!device) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết thiết bị</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div className="space-y-2">
                        <div>
                            <strong>Mã thiết bị:</strong> {device.deviceId}
                        </div>
                        <div>
                            <strong>Tên thiết bị:</strong> {device.name}
                        </div>
                        <div>
                            <strong>Mô tả:</strong> {device.description || "Không có"}
                        </div>
                        <div>
                            <strong>Trạng thái:</strong> {EDeviceStatusViMap[device.status] || "Không rõ"}
                        </div>
                        <div>
                            <strong>Ngày tạo:</strong>{" "}
                            {device.createdDate ? format(new Date(device.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                        </div>
                        <div>
                            <strong>Ngày cập nhật:</strong>{" "}
                            {device.updatedDate ? format(new Date(device.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default DeviceDetailDialog;