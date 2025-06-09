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
import { SyncTask } from "@/interfaces/sync";

interface SyncTaskDetailDialogProps {
    syncTask: SyncTask | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SyncTaskDetailDialog = ({
    syncTask,
    open,
    onOpenChange,
}: SyncTaskDetailDialogProps) => {
    if (!syncTask) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Chi tiết tác vụ đồng bộ
                    </DialogTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã tác vụ: <span className="font-medium ml-1">{syncTask.syncTaskId}</span>
                        </div>
                        {syncTask.createdAt && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(syncTask.createdAt), "dd/MM/yyyy HH:mm")}
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
                                    Thông tin tác vụ
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mã sự kiện</span>
                                        <span className="font-medium">{syncTask.syncEventId}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Mã kiosk</span>
                                        <span className="font-medium">{syncTask.kioskId}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <Badge className={syncTask.isSynced ? "bg-green-500" : "bg-red-500"}>
                                            {syncTask.isSynced ? "Đã đồng bộ" : "Chưa đồng bộ"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default SyncTaskDetailDialog;