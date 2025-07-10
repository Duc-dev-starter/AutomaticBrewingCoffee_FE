import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Monitor, Calendar, FileText, Smartphone } from 'lucide-react';
import { format } from "date-fns";
import { DeviceDialogProps } from "@/types/dialog";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";

const DeviceTypeDetailDialog = ({
    deviceType,
    open,
    onOpenChange,
}: DeviceDialogProps) => {
    if (!deviceType) return null;

    const getStatusBadge = (status: EBaseStatus) => {
        const isActive = status?.toLowerCase() === 'active'
        return (
            <Badge className={isActive
                ? "bg-primary-100 text-primary-600 border-primary-200 hover:bg-primary-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }>
                {EBaseStatusViMap[status] || status}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center text-primary-600">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <Monitor className="h-5 w-5 text-primary-500" />
                            </div>
                            Chi tiết loại thiết bị
                        </DialogTitle>
                        {getStatusBadge(deviceType.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg border border-primary-100">
                        <div className="flex items-center text-primary-600">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Mã loại thiết bị:</span>
                            <span className="font-mono font-semibold ml-2">{deviceType.deviceTypeId}</span>
                        </div>
                        {deviceType.createdDate && (
                            <div className="flex items-center text-primary-500">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-5 py-2">
                        {/* Basic Information */}
                        <Card className="border-primary-200 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-100 rounded-md mr-2">
                                        <Info className="h-4 w-4 text-primary-500" />
                                    </div>
                                    Thông tin thiết bị
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Monitor className="mr-1.5 h-4 w-4" />
                                            <span>Tên thiết bị</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 pl-5">{deviceType.name}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Smartphone className="mr-1.5 h-4 w-4" />
                                            <span>Thiết bị di động</span>
                                        </div>
                                        <div className="pl-5">
                                            <Badge className={deviceType.isMobileDevice
                                                ? "bg-primary-200 text-primary-700 border-primary-300"
                                                : "bg-gray-100 text-gray-600 border-gray-200"
                                            }>
                                                {deviceType.isMobileDevice ? "Có" : "Không"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {deviceType.description && (
                                        <div className="col-span-2 space-y-1 pt-2">
                                            <div className="flex items-center text-primary-400">
                                                <FileText className="mr-1.5 h-4 w-4" />
                                                <span>Mô tả</span>
                                            </div>
                                            <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 ml-5">
                                                <p className="text-sm text-gray-700 leading-relaxed">{deviceType.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Time Information */}
                        <Card className="border-primary-300 shadow-sm">
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-base flex items-center mb-4 text-primary-600">
                                    <div className="p-1.5 bg-primary-200 rounded-md mr-2">
                                        <Calendar className="h-4 w-4 text-primary-600" />
                                    </div>
                                    Thông tin thời gian
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Calendar className="mr-1.5 h-4 w-4" />
                                            <span>Ngày tạo</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">
                                            {deviceType.createdDate ? format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-primary-400">
                                            <Calendar className="mr-1.5 h-4 w-4" />
                                            <span>Ngày cập nhật</span>
                                        </div>
                                        <p className="font-medium text-gray-700 pl-5">
                                            {deviceType.updatedDate ? format(new Date(deviceType.updatedDate), "dd/MM/yyyy HH:mm") : "Chưa cập nhật"}
                                        </p>
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

export default DeviceTypeDetailDialog;