import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Franchise } from "@/types/franchise";
import { format } from "date-fns";
import { EBaseStatusViMap } from "@/enum/base";

interface FranchiseDetailDialogProps {
    franchise: Franchise | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FranchiseDetailDialog = ({ franchise, open, onOpenChange }: FranchiseDetailDialogProps) => {
    if (!franchise) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết chi nhánh</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <div className="space-y-2">
                        <div>
                            <strong>Mã chi nhánh:</strong> {franchise.franchiseId}
                        </div>
                        <div>
                            <strong>Tên chi nhánh:</strong> {franchise.name}
                        </div>
                        <div>
                            <strong>Mô tả:</strong> {franchise.description || "Không có"}
                        </div>
                        <div>
                            <strong>Trạng thái:</strong> {EBaseStatusViMap[franchise.status] || "Không rõ"}
                        </div>
                        <div>
                            <strong>Ngày tạo:</strong>{" "}
                            {franchise.createdDate ? format(new Date(franchise.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                        </div>
                        <div>
                            <strong>Ngày cập nhật:</strong>{" "}
                            {franchise.updatedDate ? format(new Date(franchise.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default FranchiseDetailDialog;