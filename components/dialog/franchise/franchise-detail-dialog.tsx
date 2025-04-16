import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Franchise } from "@/types/franchise";
import { format } from "date-fns";
import { EBaseStatusViMap } from "@/enum/base";

interface FranchiseDetailDialogProps {
    franchise: Franchise | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FranchiseDetailDialog = ({
    franchise,
    open,
    onOpenChange,
}: FranchiseDetailDialogProps) => {
    if (!franchise) return null;

    const renderField = (label: string, value: string) => (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="col-span-2 text-gray-800">{value}</span>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-primary">
                        Chi tiết chi nhánh
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div className="mt-4 space-y-3">
                        {renderField("Mã chi nhánh:", franchise.franchiseId)}
                        {renderField("Tên chi nhánh:", franchise.name ?? "Không có")}
                        {renderField("Mô tả:", franchise.description || "Không có")}
                        {renderField("Trạng thái:", EBaseStatusViMap[franchise.status] || "Không rõ")}
                        {renderField(
                            "Ngày tạo:",
                            franchise.createdDate
                                ? format(new Date(franchise.createdDate), "dd/MM/yyyy HH:mm")
                                : "Không có"
                        )}
                        {renderField(
                            "Ngày cập nhật:",
                            franchise.updatedDate
                                ? format(new Date(franchise.updatedDate), "dd/MM/yyyy HH:mm")
                                : "Chưa cập nhật"
                        )}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default FranchiseDetailDialog;
