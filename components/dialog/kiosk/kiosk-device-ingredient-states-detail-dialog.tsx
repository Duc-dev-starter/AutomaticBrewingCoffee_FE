"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DeviceIngredientStatesDialogProps } from "@/types/dialog"


export default function DeviceIngredientStatesDialog({
    open,
    onOpenChange,
    deviceIngredientStates,
}: DeviceIngredientStatesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thông tin nguyên liệu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {deviceIngredientStates.map((deviceIngredientState, index) => (
                        <div key={index} className="border p-4 rounded-md">
                            <p><strong>Loại nguyên liệu:</strong> {deviceIngredientState.ingredientType}</p>
                            <p><strong>Dung lượng hiện tại:</strong> {deviceIngredientState.currentCapacity}</p>
                            <p><strong>Trạng thái cảnh báo:</strong> {deviceIngredientState.isWarning ? "Có" : "Không"}</p>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
