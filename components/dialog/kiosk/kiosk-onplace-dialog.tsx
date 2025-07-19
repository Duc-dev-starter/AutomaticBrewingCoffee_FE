"use client"

import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface OnplaceDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    data: any | null
    loading: boolean
    deviceName: string
}

const formatKey = (key: string) => {
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
};

export const OnplaceDialog = ({ isOpen, onOpenChange, data, loading, deviceName }: OnplaceDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thông tin OnPlace</DialogTitle>
                    <DialogDescription>
                        Thông tin onPlace của thiết bị "{deviceName}".
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : data ? (
                    <div className="space-y-4">

                        <div>
                            <h4 className="font-medium">Working Status</h4>
                            <p>{data.workingStatus}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Status</h4>
                            {data.status ? (
                                <div className="space-y-2">
                                    <p><strong>Current System Status:</strong> {data.status.CurrentSystemStatus}</p>
                                    <div>
                                        <h5 className="font-medium mt-2">Device Status Details:</h5>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {Object.entries(data.status as Record<string, any>).map(([key, value]) => (
                                                <li key={key}>
                                                    <span className="font-medium">{formatKey(key)}:</span> {String(value)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p>Không có thông tin trạng thái.</p>
                            )}
                        </div>

                    </div>
                ) : (
                    <p>Không có thông tin OnPlace cho thiết bị này.</p>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}