"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Droplet, AlertTriangle, CheckCircle, Clock, Recycle, Star } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DeviceIngredientStatesDialogProps } from "@/types/dialog"
import { formatDate } from "@/utils/date"
import { DeviceIngredientStates } from "@/interfaces/device"
import { cn } from "@/lib/utils"

const CapacityIndicator = ({ current, max, unit, warningPercent }: { current: number, max: number, unit: string, warningPercent: number }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const isLow = percentage <= warningPercent;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isLow ? "bg-red-500" : "bg-green-500"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs text-center text-muted-foreground font-medium">
                {current} / {max} ({unit})
            </div>
        </div>
    );
};

export default function KioskDeviceIngredientStatesDialog({
    open,
    onOpenChange,
    deviceIngredientStates,
    deviceName = "Thiết bị",
}: DeviceIngredientStatesDialogProps) {

    const getCapacityLevelBadge = (level: DeviceIngredientStates['capacityLevel']) => {
        switch (level) {
            case "High": return <Badge variant="default">Đầy</Badge>;
            case "Medium": return <Badge variant="default">Trung bình</Badge>;
            case "Low": return <Badge variant="destructive">Thấp</Badge>;
            case "Empty": return <Badge variant="outline">Hết</Badge>;
            default: return <Badge variant="secondary">{level}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Trạng thái Nguyên liệu</VisuallyHidden>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Bảng chi tiết trạng thái nguyên liệu hiện tại của thiết bị {deviceName}.
                </DialogDescription>

                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <Droplet className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Trạng thái Nguyên liệu</h1>
                                <p className="text-gray-500 text-sm">Thiết bị: <span className="font-medium">{deviceName}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                    <div className="py-6">
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-0">
                                <div className="relative w-full overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[200px]">Loại nguyên liệu</TableHead>
                                                <TableHead className="min-w-[200px]">Mức hiện tại</TableHead>
                                                <TableHead className="text-center min-w-[180px]">Trạng thái</TableHead>
                                                <TableHead className="min-w-[180px]">Lần nạp cuối</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {deviceIngredientStates.length > 0 ? (
                                                deviceIngredientStates.map((state) => (
                                                    <TableRow key={state.deviceIngredientStateId}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span>{state.ingredientType}</span>
                                                                {state.isPrimary ? <Badge variant="outline" className="border-yellow-400 text-yellow-600"><Star className="h-3 w-3 mr-1" />Nguyên liệu chính</Badge> : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <CapacityIndicator
                                                                current={state.currentCapacity}
                                                                max={state.maxCapacity}
                                                                unit={state.unit}
                                                                warningPercent={state.warningPercent}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                {getCapacityLevelBadge(state.capacityLevel)}
                                                                {state.isWarning && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Cảnh báo</Badge>}
                                                                {state.isRenewable && <Badge variant="secondary"><Recycle className="h-3 w-3 mr-1" />Tự làm đầy</Badge>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>{formatDate(state.lastRefilledDate || "")}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        Không có thông tin trạng thái nguyên liệu.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}