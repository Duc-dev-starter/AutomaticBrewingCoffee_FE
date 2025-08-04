"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { FC } from "react"
import { Device } from "@/interfaces/device"
import { KioskDevice } from "@/interfaces/kiosk"

interface ReplaceDeviceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedKioskDevice: KioskDevice | null
    replacementDevices: Device[]
    selectedReplacementDeviceId: string
    setSelectedReplacementDeviceId: (id: string) => void
    loadingReplacements: boolean
    processingAction: boolean
    handleReplaceDevice: () => void
    onCancel: () => void
}

const KioskReplaceDeviceDialog: FC<ReplaceDeviceDialogProps> = ({
    open,
    onOpenChange,
    selectedKioskDevice,
    replacementDevices,
    selectedReplacementDeviceId,
    setSelectedReplacementDeviceId,
    loadingReplacements,
    processingAction,
    handleReplaceDevice,
    onCancel,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thay thế thiết bị</DialogTitle>
                    <DialogDescription>
                        Chọn thiết bị mới để thay thế cho &quot;{selectedKioskDevice?.device.name}&quot;.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select
                        value={selectedReplacementDeviceId}
                        onValueChange={setSelectedReplacementDeviceId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn thiết bị thay thế" />
                        </SelectTrigger>
                        <SelectContent>
                            {loadingReplacements ? (
                                <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span>Đang tải...</span>
                                </div>
                            ) : replacementDevices.length > 0 ? (
                                replacementDevices.map((device) => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.name} - {device.serialNumber}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-devices" disabled>
                                    Không có thiết bị khả dụng để thay thế
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={processingAction}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleReplaceDevice}
                        disabled={!selectedReplacementDeviceId || processingAction}
                    >
                        {processingAction ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Thay thế
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default KioskReplaceDeviceDialog
