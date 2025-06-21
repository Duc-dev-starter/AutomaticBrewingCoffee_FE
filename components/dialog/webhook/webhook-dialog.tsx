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
    const [synchronizedUrl, setSynchronizedUrl] = useState("");
    const [executeUrl, setExecuteUrl] = useState("");
    const [synchronizedLoading, setSynchronizedLoading] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);

    const handleSave = async (type: EWebhookType, url: string) => {
        if (!url) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL cho webhook.",
                variant: "destructive",
            });
            return;
        }
        const setLoading = type === EWebhookType.SynchronizedData ? setSynchronizedLoading : setExecuteLoading;
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
                variant: "success"
            });
            if (type === EWebhookType.SynchronizedData) {
                setSynchronizedUrl("");
            } else if (type === EWebhookType.ExecuteProduct) {
                setExecuteUrl("");
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
                        <Label htmlFor="synchronizedUrl">Webhook URL cho SynchronizedData</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="synchronizedUrl"
                                value={synchronizedUrl}
                                onChange={(e) => setSynchronizedUrl(e.target.value)}
                                placeholder="Nhập URL cho SynchronizedData"
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => handleSave(EWebhookType.SynchronizedData, synchronizedUrl)}
                                disabled={synchronizedLoading || !synchronizedUrl}
                            >
                                {synchronizedLoading ? "Đang lưu..." : "Save"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="executeUrl">Webhook URL cho ExecuteProduct</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="executeUrl"
                                value={executeUrl}
                                onChange={(e) => setExecuteUrl(e.target.value)}
                                placeholder="Nhập URL cho ExecuteProduct"
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => handleSave(EWebhookType.ExecuteProduct, executeUrl)}
                                disabled={executeLoading || !executeUrl}
                            >
                                {executeLoading ? "Đang lưu..." : "Save"}
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