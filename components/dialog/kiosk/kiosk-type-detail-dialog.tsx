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
import { Info, Monitor, Calendar, FileText } from "lucide-react";
import clsx from "clsx";
import { getBaseStatusColor } from "@/utils/color";
import { KioskDialogProps } from "@/types/dialog";
import { EBaseStatusViMap } from "@/enum/base";


const KioskTypeDetailDialog = ({
    kioskType,
    open,
    onOpenChange,
}: KioskDialogProps) => {
    if (!kioskType) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Monitor className="mr-2 h-5 w-5" />
                            Chi tiết loại kiosk
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(kioskType.status))}>
                            {EBaseStatusViMap[kioskType.status] || "Không rõ"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã loại kiosk: <span className="font-medium ml-1">{kioskType.kioskTypeId}</span>
                        </div>
                        {kioskType.createdDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(kioskType.createdDate), "dd/MM/yyyy HH:mm")}
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
                                    Thông tin kiosk
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên kiosk</span>
                                        <span className="font-medium">{kioskType.name}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{kioskType.description || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Thời gian
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày tạo</span>
                                        <span className="font-medium">
                                            {kioskType.createdDate
                                                ? format(new Date(kioskType.createdDate), "dd/MM/yyyy HH:mm")
                                                : "Không có"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày cập nhật</span>
                                        <span className="font-medium">
                                            {kioskType.updatedDate
                                                ? format(new Date(kioskType.updatedDate), "dd/MM/yyyy HH:mm")
                                                : "Chưa cập nhật"}
                                        </span>
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

export default KioskTypeDetailDialog;
