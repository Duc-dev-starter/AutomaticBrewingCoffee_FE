"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Info, Tag, Hash, Landmark, CheckCircle, XCircle } from "lucide-react"
import { InfoField } from "@/components/common"
import { SyncEventDialogProps } from "@/types/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { formatDate } from "@/utils/date"


const SyncEventDetailDialog = ({
    syncEvent,
    open,
    onOpenChange,
}: SyncEventDialogProps) => {
    if (!syncEvent) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Chi tiết</VisuallyHidden>
                </DialogTitle>
                {/* Header */}
                <div className="bg-primary-100 px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-primary-200">
                                <FileText className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-800">Chi tiết sự kiện đồng bộ</h1>
                                <p className="text-gray-500 text-sm">Thông tin chi tiết về sự kiện đang chọn</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-6 bg-white overflow-y-auto hide-scrollbar">
                    <div className="space-y-6 py-6">
                        {/* Event Info */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Thông tin sự kiện
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField
                                        label="Loại sự kiện"
                                        value={syncEvent.syncEventType}
                                        icon={<Tag className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Mã thực thể"
                                        value={syncEvent.entityId}
                                        icon={<Hash className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Loại thực thể"
                                        value={syncEvent.entityType}
                                        icon={<Landmark className="w-4 h-4 text-primary-500" />}
                                    />
                                    <InfoField
                                        label="Ngày tạo"
                                        value={formatDate(syncEvent.createdDate)}
                                        icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sync Tasks */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-primary-500" />
                                    Danh sách tác vụ ({syncEvent.syncTasks.length})
                                </h3>
                                {syncEvent.syncTasks.length > 0 ? (
                                    <ul className="space-y-3 text-sm">
                                        {syncEvent.syncTasks.map((task) => (
                                            <li
                                                key={task.syncTaskId}
                                                className="flex justify-between items-center px-4 py-2 border rounded-md bg-gray-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{task.syncTaskId}</span>
                                                </div>
                                                <Badge className={task.isSynced ? "bg-green-500" : "bg-red-500"}>
                                                    {task.isSynced ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {task.isSynced ? "Đã đồng bộ" : "Chưa đồng bộ"}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Chưa có tác vụ</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default SyncEventDetailDialog
