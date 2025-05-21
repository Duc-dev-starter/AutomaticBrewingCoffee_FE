import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EDeviceStatus, EDeviceStatusViMap } from "@/enum/device"
import { cn } from "@/lib/utils"
import { InfoIcon } from "lucide-react"

// Status color and description mapping
export const deviceStatusConfig = {
    [EDeviceStatus.Working]: {
        color: "bg-green-500 text-white",
        hoverColor: "hover:bg-green-600",
        icon: "🟢",
        description: "Thiết bị đang hoạt động bình thường và sẵn sàng sử dụng.",
    },
    [EDeviceStatus.Maintain]: {
        color: "bg-amber-500 text-white",
        hoverColor: "hover:bg-amber-600",
        icon: "🟠",
        description: "Thiết bị đang được bảo trì hoặc sửa chữa.",
    },
    [EDeviceStatus.Stock]: {
        color: "bg-blue-500 text-white",
        hoverColor: "hover:bg-blue-600",
        icon: "🔵",
        description: "Thiết bị đang trong kho và chưa được sử dụng.",
    },
}

export const getDeviceStatusColor = (status: string) => {
    return deviceStatusConfig[status as EDeviceStatus]?.color || "bg-gray-500 text-white"
}

export const getDeviceStatusHoverColor = (status: string) => {
    return deviceStatusConfig[status as EDeviceStatus]?.hoverColor || "hover:bg-gray-600"
}

export const getDeviceStatusIcon = (status: string) => {
    return deviceStatusConfig[status as EDeviceStatus]?.icon || "⚪"
}

export const DeviceStatusLegend = () => {
    return (
        <Card className="mb-4">
            <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                    <InfoIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Chú thích trạng thái thiết bị</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    {Object.values(EDeviceStatus).map((status) => (
                        <div key={status} className="flex items-center">
                            <Badge className={cn("mr-2", getDeviceStatusColor(status))}>{getDeviceStatusIcon(status)}</Badge>
                            <div>
                                <div className="font-medium text-sm">{EDeviceStatusViMap[status]}</div>
                                <div className="text-xs text-muted-foreground">{deviceStatusConfig[status]?.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
