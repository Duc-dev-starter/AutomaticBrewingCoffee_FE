import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DeviceIngredientHistoryDialogProps } from "@/types/dialog";

export default function DeviceIngredientHistoryDialog({
    open,
    onOpenChange,
    deviceIngredientHistory
}: DeviceIngredientHistoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Lịch sử sử dụng nguyên liệu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {deviceIngredientHistory.map((item) => (
                        <div key={item.deviceIngredientHistoryId} className="border p-4 rounded-md">
                            <p><strong>Thực hiện bởi:</strong> {item.performedBy}</p>
                            <p><strong>Hành động:</strong> {item.action}</p>
                            <p><strong>Lượng thay đổi:</strong> {item.deltaAmount}</p>
                            <p><strong>Dung lượng trước:</strong> {item.oldCapacity}</p>
                            <p><strong>Dung lượng sau:</strong> {item.newCapacity}</p>
                            <p><strong>Loại nguyên liệu:</strong> {item.ingredientType}</p>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
