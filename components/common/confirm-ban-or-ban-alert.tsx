"use client"
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Account } from "@/interfaces/account";

interface ConfirmBanUnbanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    item: Account | null;
    action: "ban" | "unban";
}

const ConfirmBanUnbanDialog = ({ open, onOpenChange, onConfirm, item, action }: ConfirmBanUnbanDialogProps) => {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
        setReason(""); // Reset lý do sau khi xác nhận
    };

    const handleCancel = () => {
        onOpenChange(false);
        setReason(""); // Reset lý do khi hủy
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {action === "ban" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {action === "ban"
                            ? `Bạn có chắc chắn muốn khóa tài khoản "${item?.fullName}"?`
                            : `Bạn có chắc chắn muốn mở khóa tài khoản "${item?.fullName}"?`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder={action === "ban" ? "Nhập lý do khóa" : "Nhập lý do mở khóa"}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button onClick={handleConfirm}>
                        {action === "ban" ? "Khóa" : "Mở khóa"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmBanUnbanDialog;