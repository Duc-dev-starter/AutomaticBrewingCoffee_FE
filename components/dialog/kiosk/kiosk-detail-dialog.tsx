import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Kiosk } from "@/interfaces/kiosk";
import { format } from "date-fns";
import { EBaseStatusViMap } from "@/enum/base";

interface KioskDetailDialogProps {
    kiosk: Kiosk | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const renderField = (label: string, value?: string | null) => (
    <div className="grid grid-cols-3 gap-2 text-sm">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="col-span-2 text-gray-800">{value ?? "Không có"}</span>
    </div>
);

const KioskDetailDialog = ({
    kiosk,
    open,
    onOpenChange,
}: KioskDetailDialogProps) => {
    if (!kiosk) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết Kiosk</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div className="space-y-3 mt-2">
                        {renderField("Mã kiosk:", kiosk.kioskId)}
                        {renderField("Franchise:", kiosk.franchise?.name)}
                        {renderField(
                            "Thiết bị:",
                            kiosk.devices.length > 0
                                ? kiosk.devices.map((d) => d.name).join(", ")
                                : "Không có thiết bị"
                        )}
                        {renderField("Địa chỉ:", kiosk.location)}
                        {renderField("Trạng thái:", EBaseStatusViMap[kiosk.status])}
                        {renderField(
                            "Ngày lắp đặt:",
                            kiosk.installedDate
                                ? format(new Date(kiosk.installedDate), "dd/MM/yyyy")
                                : "Không có"
                        )}
                        {renderField(
                            "Ngày tạo:",
                            kiosk.createdDate
                                ? format(new Date(kiosk.createdDate), "dd/MM/yyyy HH:mm")
                                : "Không có"
                        )}
                        {renderField(
                            "Ngày cập nhật:",
                            kiosk.updatedDate
                                ? format(new Date(kiosk.updatedDate), "dd/MM/yyyy HH:mm")
                                : "Chưa cập nhật"
                        )}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default KioskDetailDialog;
