"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { History, ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"
import { DeviceIngredientHistory } from "@/interfaces/device"
import { DeviceIngredientHistoryDialogProps } from "@/types/dialog"


const ITEMS_PER_PAGE = 10;

export default function DeviceIngredientHistoryDialog({
    open,
    onOpenChange,
    deviceIngredientHistory,
    deviceName = "Thiết bị"
}: DeviceIngredientHistoryDialogProps) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (open) {
            setCurrentPage(1);
        }
    }, [open, deviceIngredientHistory]);

    const { currentItems, totalPages } = useMemo(() => {
        const totalItems = deviceIngredientHistory.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentItems = deviceIngredientHistory.slice(startIndex, endIndex);

        return { currentItems, totalPages };
    }, [currentPage, deviceIngredientHistory]);

    const getActionBadge = (action: DeviceIngredientHistory['action']) => {
        const isConsumed = action === "Consumed";
        return (
            <div className={cn(
                "flex items-center justify-center gap-2",
                isConsumed ? "text-red-600" : "text-green-600"
            )}>
                {isConsumed ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                <span>{action === "Consumed" ? "Tiêu thụ" : "Nạp đầy"}</span>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                <DialogTitle asChild>
                    <VisuallyHidden>Lịch sử Nguyên liệu</VisuallyHidden>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Bảng chi tiết lịch sử thay đổi nguyên liệu của thiết bị {deviceName}.
                </DialogDescription>

                {/* Header */}
                <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-100">
                                <History className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">Lịch sử Nguyên liệu</h1>
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
                                                <TableHead className="text-center min-w-[150px]">Hành động</TableHead>
                                                <TableHead className="text-center min-w-[150px]">Nguyên liệu</TableHead>
                                                <TableHead className="text-center min-w-[100px]">Thay đổi</TableHead>
                                                <TableHead className="text-center min-w-[100px]">Trước đó</TableHead>
                                                <TableHead className="text-center min-w-[100px]">Sau đó</TableHead>
                                                <TableHead className="text-center min-w-[150px]">Người thực hiện</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.length > 0 ? (
                                                currentItems.map((item) => (
                                                    <TableRow key={item.deviceIngredientHistoryId}>
                                                        <TableCell className="font-medium">{getActionBadge(item.action)}</TableCell>
                                                        <TableCell className="text-center">{item.ingredientType || "Không xác định"}</TableCell>
                                                        <TableCell className={cn(
                                                            "text-center font-semibold",
                                                            item.deltaAmount < 0 ? "text-red-600" : "text-green-600"
                                                        )}>
                                                            {item.deltaAmount > 0 ? `+${item.deltaAmount}` : item.deltaAmount}
                                                        </TableCell>
                                                        <TableCell className="text-center">{item.oldCapacity}</TableCell>
                                                        <TableCell className="text-center">{item.newCapacity}</TableCell>
                                                        <TableCell className="text-center">{item.performedBy}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        Không có lịch sử để hiển thị.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-end space-x-2 p-4 border-t">
                                    <span className="text-sm text-muted-foreground">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <div className="space-x-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}