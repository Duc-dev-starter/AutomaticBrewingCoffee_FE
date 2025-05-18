"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { registerWebhook } from "@/services/webhook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EWebhookType } from "@/enum/webhook";
import { WebhookDialogProps } from "@/types/dialog";
import { ErrorResponse } from "@/types/error";

const WebhookDialog = ({ open, onOpenChange, kioskId }: WebhookDialogProps) => {
    const { toast } = useToast();
    const [menuUrl, setMenuUrl] = useState("");
    const [paymentUrl, setPaymentUrl] = useState("");
    const [menuLoading, setMenuLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handleSave = async (type: EWebhookType, url: string) => {
        if (!url) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL cho webhook.",
                variant: "destructive",
            });
            return;
        }
        const setLoading = type === EWebhookType.MenuSynchronized ? setMenuLoading : setPaymentLoading;
        setLoading(true);
        try {
            const response = await registerWebhook({
                kioskId,
                webhookUrl: url,
                webhookType: type,
            });
            toast({
                title: "Thành công",
                description: response.message,
            });
            if (type === EWebhookType.MenuSynchronized) {
                setMenuUrl("");
            } else if (type === EWebhookType.PaymentCallback) {
                setPaymentUrl("");
            }
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi đăng ký webhook:", error);
            toast({
                title: "Lỗi",
                description: err.message,
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
                    <DialogTitle>Đăng ký Webhook cho Kiosk</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="menuUrl">Webhook URL cho MenuSynchronized</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="menuUrl"
                                value={menuUrl}
                                onChange={(e) => setMenuUrl(e.target.value)}
                                placeholder="Nhập URL cho MenuSynchronized"
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => handleSave(EWebhookType.MenuSynchronized, menuUrl)}
                                disabled={menuLoading || !menuUrl}
                            >
                                {menuLoading ? "Đang lưu..." : "Save"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentUrl">Webhook URL cho PaymentCallback</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="paymentUrl"
                                value={paymentUrl}
                                onChange={(e) => setPaymentUrl(e.target.value)}
                                placeholder="Nhập URL cho PaymentCallback"
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => handleSave(EWebhookType.PaymentCallback, paymentUrl)}
                                disabled={paymentLoading || !paymentUrl}
                            >
                                {paymentLoading ? "Đang lưu..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WebhookDialog