
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatDate } from "@/utils/date"

export interface OnhubData {
    status: string
    connectionState: string
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

export const KioskOnhubDialog = ({
    open,
    onOpenChange,
    loading,
    onhubData,
    deviceName,
}: OnhubDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thông tin OnHub</DialogTitle>
                    <DialogDescription>
                        Thông tin kết nối của thiết bị "{deviceName}".
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : onhubData ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium">Trạng thái</h4>
                            <p>{onhubData.status}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Trạng thái kết nối</h4>
                            <p>{onhubData.connectionState}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Thời gian cập nhật trạng thái kết nối</h4>
                            <p>{formatDate(onhubData.connectionStateUpdatedTime)}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Số lượng tin nhắn từ cloud đến thiết bị</h4>
                            <p>{onhubData.cloudToDeviceMessageCount}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Chuỗi kết nối</h4>
                            <p className="break-all">{onhubData.connectionString}</p>
                        </div>
                    </div>
                ) : (
                    <p>Chưa có thông tin OnHub cho thiết bị này.</p>
                )}
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
