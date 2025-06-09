import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar, FileText } from "lucide-react";
import { SyncEvent } from "@/interfaces/sync";

interface SyncEventDetailDialogProps {
    syncEvent: SyncEvent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SyncEventDetailDialog = ({
    syncEvent,
    open,
    onOpenChange,
}: SyncEventDetailDialogProps) => {
    if (!syncEvent) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Chi tiết sự kiện đồng bộ
                    </DialogTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã sự kiện: <span className="font-medium ml-1">{syncEvent.syncEventId}</span>
                        </div>
                        {syncEvent.createdDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(syncEvent.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin sự kiện
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại sự kiện</span>
                                        <span className="font-medium">{syncEvent.syncEventType}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mã thực thể</span>
                                        <span className="font-medium">{syncEvent.entityId}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại thực thể</span>
                                        <span className="font-medium">{syncEvent.entityType}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Danh sách tác vụ
                                </h3>
                                {syncEvent.syncTasks.length > 0 ? (
                                    <ul className="space-y-2">
                                        {syncEvent.syncTasks.map((task) => (
                                            <li key={task.syncTaskId} className="flex justify-between items-center">
                                                <span>{task.syncTaskId}</span>
                                                <Badge className={task.isSynced ? "bg-green-500" : "bg-red-500"}>
                                                    {task.isSynced ? "Đã đồng bộ" : "Chưa đồng bộ"}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Không có tác vụ</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default SyncEventDetailDialog;