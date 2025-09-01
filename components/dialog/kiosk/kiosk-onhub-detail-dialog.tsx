"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Signal, CheckCircle, XCircle, Clock, MessagesSquare, KeyRound, Copy, Info, Power, TerminalSquare } from "lucide-react"
import { formatDate } from "@/utils/date"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InfoField } from "@/components/common"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { images } from "@/public/assets"

export interface OnhubData {
    status: OnhubStatus;
    connectionState: OnhubConnectionState;
    connectionStateUpdatedTime: string
    cloudToDeviceMessageCount: number
    connectionString: string
}

interface OnhubDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    onhubData: OnhubData | null
    deviceName: string
}

type OnhubStatus = "Enabled" | "Disabled"
type OnhubConnectionState = "Connected" | "Disconnected"

const onhubStatusMap: Record<OnhubStatus, string> = {
    Enabled: "Đã bật",
    Disabled: "Đã tắt",
};

const onhubConnectionStateMap: Record<OnhubConnectionState, string> = {
    Connected: "Đang kết nối",
    Disconnected: "Mất kết nối",
};


const getStatusBadge = (status: OnhubStatus) => {
    const isEnabled = status === "Enabled";
    return (
        <Badge variant={isEnabled ? "default" : "destructive"} className="px-3 py-1">
            {isEnabled ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
            {onhubStatusMap[status]}
        </Badge>
    );
};

const getConnectionStateBadge = (connectionState: OnhubConnectionState) => {
    const isConnected = connectionState === "Connected";
    return (
        <Badge variant={isConnected ? "default" : "secondary"} className="px-3 py-1">
            <Signal className={cn("mr-1 h-3 w-3", isConnected && "animate-pulse")} />
            {onhubConnectionStateMap[connectionState]}
        </Badge>
    );
};



export const KioskOnhubDialog = ({
    open,
    onOpenChange,
    loading,
    onhubData,
    deviceName,
}: OnhubDialogProps) => {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Đã sao chép!",
            description: "Chuỗi kết nối đã được sao chép vào clipboard.",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Thông tin Kết nối OnHub</VisuallyHidden>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Chi tiết trạng thái kết nối thiết bị "{deviceName}".
                </DialogDescription>

                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <Image src={images.azureIotHub} alt="azureIoT" height={40} width={40} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800"> Chi tiết trạng thái kết nối thiết bị</h1>
                                <p className="text-gray-500 text-sm">Thiết bị: <span className="font-medium">{deviceName}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center p-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : onhubData ? (
                        <div className="space-y-6 py-6">
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Info className="w-5 h-5 mr-2 text-primary-500" />
                                        Trạng thái Hiện tại
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField
                                            label="Trạng thái định danh"
                                            value={getStatusBadge(onhubData.status)}
                                            icon={<Power className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Trạng thái kết nối"
                                            value={getConnectionStateBadge(onhubData.connectionState)}
                                            icon={<Signal className="w-4 h-4 text-primary-500" />}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Chi tiết Kỹ thuật */}
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <TerminalSquare className="w-5 h-5 mr-2 text-primary-500" />
                                        Chi tiết Kỹ thuật
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField
                                            label="Thời gian cập nhật kết nối"
                                            value={formatDate(onhubData.connectionStateUpdatedTime)}
                                            icon={<Clock className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Tin nhắn từ mấy chủ đến thiết bị"
                                            value={onhubData.cloudToDeviceMessageCount.toString()}
                                            icon={<MessagesSquare className="w-4 h-4 text-primary-500" />}
                                        />
                                        <div className="col-span-2">
                                            <InfoField
                                                label="Chuỗi kết nối (Connection String)"
                                                value={
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-mono break-all text-muted-foreground bg-gray-50 p-2 rounded-md flex-1">
                                                            {onhubData.connectionString}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleCopy(onhubData.connectionString)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                }
                                                icon={<KeyRound className="w-4 h-4 text-primary-500" />}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>Chưa có thông tin kết nối OnHub cho thiết bị này.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}