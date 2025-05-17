import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { EWorkflowStepType, EWorkflowStepTypeViMap } from "@/enum/workflow"
import type { WorkflowStep } from "@/interfaces/workflow"
import {
    Cpu,
    Repeat,
    Settings,
    MoveRight,
    Grip,
    Trash2,
    RefreshCw,
    AlertTriangle,
    Coffee,
    Droplets,
    Snowflake,
    Bell,
    XCircle,
    CheckCircle,
    ShoppingCart,
    RotateCcw,
    CheckSquare,
    Calendar,
} from "lucide-react"

// Map step types to icons
const stepTypeIcons: Record<EWorkflowStepType, React.ReactNode> = {
    [EWorkflowStepType.MoveArmCommand]: <MoveRight className="h-5 w-5 text-blue-500" />,
    [EWorkflowStepType.CloseGripperCommand]: <Grip className="h-5 w-5 text-purple-500" />,
    [EWorkflowStepType.DiscardCupCommand]: <Trash2 className="h-5 w-5 text-red-500" />,
    [EWorkflowStepType.ResetArmCommand]: <RefreshCw className="h-5 w-5 text-green-500" />,
    [EWorkflowStepType.MoveFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.OpenFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.CloseFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.OpenGripperCommand]: <Grip className="h-5 w-5 text-purple-500" />,
    [EWorkflowStepType.MakeDrinkCommand]: <Coffee className="h-5 w-5 text-brown-500" />,
    [EWorkflowStepType.MakeFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.DropCupCommand]: <Droplets className="h-5 w-5 text-blue-400" />,
    [EWorkflowStepType.DropFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.TakeIceCommand]: <Snowflake className="h-5 w-5 text-blue-300" />,
    [EWorkflowStepType.TakeFailCommand]: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    [EWorkflowStepType.AlertCancellationCommand]: <Bell className="h-5 w-5 text-yellow-500" />,
    [EWorkflowStepType.CancelOrderCommand]: <XCircle className="h-5 w-5 text-red-500" />,
    [EWorkflowStepType.CompleteOrderCommand]: <CheckCircle className="h-5 w-5 text-green-500" />,
    [EWorkflowStepType.CreateOrderCommand]: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    [EWorkflowStepType.CancelPaymentCommand]: <XCircle className="h-5 w-5 text-red-500" />,
    [EWorkflowStepType.RefundCommand]: <RotateCcw className="h-5 w-5 text-green-500" />,
    [EWorkflowStepType.ValidatePaymentCommand]: <CheckSquare className="h-5 w-5 text-green-500" />,
}

interface WorkflowStepCardProps {
    step: WorkflowStep & {
        device?: {
            deviceId: string
            name: string
            description?: string
            status?: string
            createdDate?: string
        }
    }
    index: number
}

export function WorkflowStepCard({ step, index }: WorkflowStepCardProps) {
    const stepIcon = stepTypeIcons[step.type as EWorkflowStepType] || <Settings className="h-5 w-5 text-gray-500" />

    // Format date if available
    const formatDate = (dateString?: string) => {
        if (!dateString) return null
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
        } catch (e) {
            return null
        }
    }

    return (
        <Card className="border-[#e1f9f9] dark:border-[#1a3333] shadow-sm hover:shadow-md transition-shadow bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e1f9f9] dark:bg-[#1a3333] mr-3">
                            {stepIcon}
                        </div>
                        <div>
                            <h3 className="font-medium text-[#295959] dark:text-[#68e0df]">
                                Bước {index + 1}: {step.name || EWorkflowStepTypeViMap[step.type as EWorkflowStepType] || step.type}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {EWorkflowStepTypeViMap[step.type as EWorkflowStepType] || step.type}
                                {step.device && ` - ${step.device.name}`}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-[#e1f9f9] text-[#295959] dark:bg-[#1a3333] dark:text-[#68e0df] hover:bg-[#a5edec] dark:hover:bg-[#295959]">
                        {step.type}
                    </Badge>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <Cpu className="h-4 w-4 mr-2 text-[#68e0df]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thiết bị:</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {step.device ? `${step.device.name} (WF-${step.device.deviceId.substring(0, 8)})` : step.device || "Không có"}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <Repeat className="h-4 w-4 mr-2 text-[#68e0df]" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lần thử lại tối đa:</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{step.maxRetries}</span>
                    </div>

                    {step.device && step.device.status && (
                        <div className="flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái thiết bị:</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{step.device.status}</span>
                        </div>
                    )}

                    {step.device && step.device.createdDate && (
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày tạo thiết bị:</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(step.device.createdDate)}
                            </span>
                        </div>
                    )}

                    {step.callbackWorkflowId && (
                        <div className="flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quy trình gọi lại:</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{step.callbackWorkflowId}</span>
                        </div>
                    )}

                    {step.parameters && (
                        <div className="flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-[#68e0df]" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tham số:</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{step.parameters}</span>
                        </div>
                    )}

                    {step.device && step.device.description && (
                        <div className="flex items-center col-span-2">
                            <Settings className="h-4 w-4 mr-2 text-[#68e0df] shrink-0" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">Mô tả thiết bị:</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 truncate">{step.device.description}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
