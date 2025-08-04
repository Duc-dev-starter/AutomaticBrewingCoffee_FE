"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UpdateWebhookDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    webhookUrl: string;
    onWebhookUrlChange: (value: string) => void;
    onSubmit: () => void;
};

export const KioskWebhookDialog = ({
    isOpen,
    onOpenChange,
    webhookUrl,
    onWebhookUrlChange,
    onSubmit,
}: UpdateWebhookDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cập nhật Webhook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        value={webhookUrl}
                        onChange={(e) => onWebhookUrlChange(e.target.value)}
                        placeholder="Nhập URL mới"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
