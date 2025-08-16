"use client"

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Monitor, Settings, Zap, Type, FileText, Calendar, Factory, Copy, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import clsx from "clsx"
import { format } from "date-fns"
import { useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { getBaseStatusColor } from "@/utils/color"
import type { DeviceDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"
import { InfoField } from "@/components/common/info-field"
import { Button } from "@/components/ui/button"


const DeviceModelDetailDialog = ({ deviceModel, open, onOpenChange }: DeviceDialogProps) => {
    const [copiedText, setCopiedText] = useState<string | null>(null)

    if (!deviceModel) return null

    const copyToClipboard = (text: string | undefined | null, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text)
        setCopiedText(label)
        setTimeout(() => setCopiedText(null), 2000)
    }

    const ParameterBadge = ({ type }: { type: string }) => {
        const isText = type.toLowerCase() === 'text'
        return (
            <Badge variant="outline" className={clsx(isText ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-300 bg-gray-50 text-gray-700")}>
                {isText ? <Type className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                {type}
            </Badge>
        )
    }

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white rounded-lg">
                    <DialogTitle asChild>
                        <VisuallyHidden>Chi tiết Mẫu Thiết bị</VisuallyHidden>
                    </DialogTitle>
                    {/* Header */}
                    <div className="bg-primary-100 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-primary-200">
                                    <Monitor className="w-8 h-8 text-primary-500" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-800">{deviceModel.modelName}</h1>
                                    <p className="text-gray-500 text-sm">{deviceModel.deviceType?.name || "Mẫu thiết bị"}</p>
                                </div>
                            </div>
                            <Badge className={clsx("px-3 py-1", getBaseStatusColor(deviceModel.status))}>
                                <FileText className="mr-1 h-3 w-3" />
                                {EBaseStatusViMap[deviceModel.status]}
                            </Badge>
                        </div>
                    </div>
                    {/* Body */}
                    <ScrollArea className="flex-1 px-8 bg-white overflow-y-auto hide-scrollbar">
                        <div className="space-y-6 py-6">
                            {/* Thông tin cơ bản */}
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Info className="w-5 h-5 mr-2 text-primary-500" />
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField
                                            label="Tên mẫu"
                                            value={deviceModel.modelName}
                                            icon={<Monitor className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Nhà sản xuất"
                                            value={deviceModel.manufacturer || "Không có"}
                                            icon={<Factory className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Loại thiết bị"
                                            value={deviceModel.deviceType?.name || "Không có"}
                                            icon={<FileText className="w-4 h-4 text-primary-500" />}
                                        />
                                        <InfoField
                                            label="Ngày tạo"
                                            value={deviceModel.createdDate ? format(new Date(deviceModel.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                            icon={<Calendar className="w-4 h-4 text-primary-500" />}
                                        />
                                    </div>
                                    <div className="border-t pt-4 flex items-center text-sm text-gray-500">
                                        ID:
                                        <code className="mx-2 bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{deviceModel.deviceModelId}</code>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => copyToClipboard(deviceModel.deviceModelId, "model_id")}
                                                >
                                                    {copiedText === 'model_id' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{copiedText === "model_id" ? "Đã sao chép!" : "Sao chép ID"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chức năng thiết bị */}
                            <Card className="border border-gray-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center">
                                        <Settings className="w-5 h-5 mr-2 text-primary-500" />
                                        Chức năng thiết bị
                                        <Badge variant="secondary" className="ml-2">{deviceModel.deviceFunctions?.length || 0}</Badge>
                                    </h3>

                                    <div className="space-y-4">
                                        {(deviceModel.deviceFunctions && deviceModel.deviceFunctions.length > 0) ? (
                                            deviceModel.deviceFunctions.map((func, index) => (
                                                <div key={func.deviceFunctionId} className="border border-gray-200 bg-gray-50/50 rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                                            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                                                            {func.name}
                                                        </h4>
                                                        <Badge className={clsx("px-2 py-0.5 text-xs", getBaseStatusColor(func.status))}>
                                                            {EBaseStatusViMap[func.status] || "N/A"}
                                                        </Badge>
                                                    </div>

                                                    {(func.functionParameters && func.functionParameters.length > 0) && (
                                                        <div className="mt-2 pl-6 space-y-3">
                                                            {func.functionParameters.map((param, pIndex) => (
                                                                <div key={pIndex}>
                                                                    <div className="flex items-center space-x-2">
                                                                        <p className="text-sm font-medium">{param.name}</p>
                                                                        <ParameterBadge type={param.type} />
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Giá trị mặc định:
                                                                        <code className="ml-1 bg-gray-200 text-gray-700 px-1 rounded">{param.default || 'N/A'}</code>
                                                                    </p>
                                                                    {param.options && param.options.length > 0 && (
                                                                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                                            <span>Tùy chọn:</span>
                                                                            {param.options.map(opt => <Badge key={opt} variant="outline">{opt}</Badge>)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">Không có chức năng nào được định nghĩa.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}

export default DeviceModelDetailDialog