import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EBaseStatusViMap } from "@/enum/base";
import { Menu } from "@/interfaces/menu";

type MenuDetailDialogProps = {
    menu: Menu | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MenuDetailDialog = ({
    menu,
    open,
    onOpenChange,
}: MenuDetailDialogProps) => {
    if (!menu) return null;

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
                        Chi tiết menu
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-3">
                    {renderField("Mã menu:", menu.menuId)}
                    {renderField("Mã kiosk:", menu.kioskId)}
                    {renderField("Tên menu:", menu.name)}
                    {renderField("Mô tả:", menu.description || "Không có")}
                    {renderField("Trạng thái:", EBaseStatusViMap[menu.status] || "Không rõ")}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MenuDetailDialog;