import { Badge } from "@/components/ui/badge"
import { type EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deviceStatusConfig, getDeviceStatusColor, getDeviceStatusIcon } from "./device-status-legend"

interface DeviceStatusBadgeProps {
    status: string
    showIcon?: boolean
    showTooltip?: boolean
    className?: string
}

export const DeviceStatusBadge = ({
    status,
    showIcon = true,
    showTooltip = true,
    className,
}: DeviceStatusBadgeProps) => {
    const statusText = EDeviceStatusViMap[status] || status
    const statusColor = getDeviceStatusColor(status)
    const statusIcon = showIcon ? getDeviceStatusIcon(status) : null

    const badge = (
        <Badge className={cn(statusColor, className)}>
            {statusIcon && <span className="mr-1">{statusIcon}</span>}
            {statusText}
        </Badge>
    )

    if (showTooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>{badge}</TooltipTrigger>
                    <TooltipContent>
                        <p>{deviceStatusConfig[status as EDeviceStatus]?.description || "Trạng thái không xác định"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return badge
}
