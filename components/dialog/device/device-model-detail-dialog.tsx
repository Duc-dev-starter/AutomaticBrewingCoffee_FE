"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Monitor, Settings, Zap, Type, FileText, Calendar, Factory, Tag, Copy, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import clsx from "clsx"
import { getBaseStatusColor } from "@/utils/color"
import type { DeviceDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const DeviceModelDetailDialog = ({ deviceModel, open, onOpenChange }: DeviceDialogProps) => {
    const [copiedText, setCopiedText] = useState<string | null>(null)

    if (!deviceModel) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Lỗi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Không tìm thấy thông tin mẫu thiết bị.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const getParameterTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "text":
                return <Type className="h-3 w-3" />
            default:
                return <FileText className="h-3 w-3" />
        }
    }

    const getParameterTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "text":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopiedText(label)
        setTimeout(() => setCopiedText(null), 2000)
    }

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto hide-scrollbar">
                    <DialogHeader className="pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold flex items-center">
                                <Monitor className="mr-2 h-5 w-5 text-primary" />
                                Chi tiết mẫu thiết bị
                            </DialogTitle>
                            <Badge className={clsx("mr-4", getBaseStatusColor(deviceModel.status))}>
                                {EBaseStatusViMap[deviceModel.status] || "Không rõ"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">{deviceModel.modelName}</p>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 mt-2">
                        <div className="space-y-6 py-2">
                            {/* Basic Information */}
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center text-blue-700">
                                        <Info className="mr-2 h-4 w-4" />
                                        Thông tin cơ bản
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-muted-foreground">
                                                <Tag className="h-3.5 w-3.5 mr-1.5" />
                                                <span>Tên mẫu thiết bị</span>
                                            </div>
                                            <p className="font-medium pl-5">{deviceModel.modelName}</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-muted-foreground">
                                                <Factory className="h-3.5 w-3.5 mr-1.5" />
                                                <span>Nhà sản xuất</span>
                                            </div>
                                            <p className="font-medium pl-5">{deviceModel.manufacturer || "Không có"}</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-muted-foreground">
                                                <Monitor className="h-3.5 w-3.5 mr-1.5" />
                                                <span>Loại thiết bị</span>
                                            </div>
                                            <p className="font-medium pl-5">{deviceModel.deviceType?.name || "Không có"}</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                <span>Ngày tạo</span>
                                            </div>
                                            <p className="font-medium pl-5">
                                                {deviceModel.createdDate
                                                    ? format(new Date(deviceModel.createdDate), "dd/MM/yyyy HH:mm")
                                                    : "Không có"}
                                            </p>
                                        </div>

                                        <div className="col-span-2 mt-2 pt-2 border-t flex items-center">
                                            <span className="text-xs text-muted-foreground mr-2">ID:</span>
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                {deviceModel.deviceModelId}
                                            </code>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 ml-1"
                                                        onClick={() => copyToClipboard(deviceModel.deviceModelId, "ID")}
                                                    >
                                                        {copiedText === "ID" ? (
                                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p>{copiedText === "ID" ? "Đã sao chép!" : "Sao chép ID"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Device Functions */}
                            {deviceModel.deviceFunctions && deviceModel.deviceFunctions.length > 0 && (
                                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center text-purple-700">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Chức năng thiết bị
                                            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                {deviceModel.deviceFunctions.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {deviceModel.deviceFunctions.map((func, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-transparent hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-purple-100 p-1.5 rounded-full">
                                                                <Zap className="h-4 w-4 text-purple-700" />
                                                            </div>
                                                            <h4 className="font-semibold">{func.name || `Chức năng ${index + 1}`}</h4>
                                                        </div>
                                                        <Badge className={clsx("text-xs", getBaseStatusColor(func.status))}>
                                                            {EBaseStatusViMap[func.status] || func.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center mb-3 text-xs text-muted-foreground">
                                                        <span className="mr-1">ID:</span>
                                                        <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{func.deviceFunctionId}</code>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 ml-1"
                                                                    onClick={() => copyToClipboard(func.deviceFunctionId, `func-${index}`)}
                                                                >
                                                                    {copiedText === `func-${index}` ? (
                                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                    ) : (
                                                                        <Copy className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right">
                                                                <p>{copiedText === `func-${index}` ? "Đã sao chép!" : "Sao chép ID"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>

                                                    {func.functionParameters && func.functionParameters.length > 0 && (
                                                        <>
                                                            <Separator className="my-3" />
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium flex items-center">
                                                                        <FileText className="h-3.5 w-3.5 mr-1.5 text-purple-700" />
                                                                        Tham số ({func.functionParameters.length})
                                                                    </span>
                                                                </div>

                                                                <div className="grid gap-3">
                                                                    {func.functionParameters.map((param, paramIndex) => (
                                                                        <div
                                                                            key={paramIndex}
                                                                            className="border rounded-md p-3 bg-white hover:border-purple-200 transition-colors"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-medium text-sm">{param.name}</span>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={clsx("text-xs", getParameterTypeColor(param.type))}
                                                                                    >
                                                                                        <span className="mr-1">{getParameterTypeIcon(param.type)}</span>
                                                                                        {param.type}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Giá trị mặc định:</span>
                                                                                    <div className="font-mono bg-muted px-2 py-1 rounded mt-1 flex items-center justify-between">
                                                                                        <span className="truncate">{param.default || "Không có"}</span>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="icon"
                                                                                                    className="h-5 w-5 ml-1"
                                                                                                    onClick={() =>
                                                                                                        copyToClipboard(param.default || "", `param-${paramIndex}`)
                                                                                                    }
                                                                                                >
                                                                                                    {copiedText === `param-${paramIndex}` ? (
                                                                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                                                    ) : (
                                                                                                        <Copy className="h-3 w-3" />
                                                                                                    )}
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent side="right">
                                                                                                <p>
                                                                                                    {copiedText === `param-${paramIndex}`
                                                                                                        ? "Đã sao chép!"
                                                                                                        : "Sao chép giá trị"}
                                                                                                </p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                </div>

                                                                                {param.options && param.options.length > 0 && (
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Tùy chọn:</span>
                                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                                            {param.options.map((option, optionIndex) => (
                                                                                                <Badge key={optionIndex} variant="outline" className="text-xs">
                                                                                                    {option}
                                                                                                </Badge>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t flex items-center">
                                                                                <span className="mr-1">ID:</span>
                                                                                <code className="bg-muted px-1 py-0.5 rounded font-mono">
                                                                                    {param.functionParameterId}
                                                                                </code>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* No Functions Message */}
                            {(!deviceModel.deviceFunctions || deviceModel.deviceFunctions.length === 0) && (
                                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                                    <CardContent className="p-6 text-center">
                                        <div className="bg-purple-50 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Settings className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">Không có chức năng</h3>
                                        <p className="text-muted-foreground">Mẫu thiết bị này chưa có chức năng nào được định nghĩa.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t pt-4 mt-2">
                        <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}

export default DeviceModelDetailDialog
