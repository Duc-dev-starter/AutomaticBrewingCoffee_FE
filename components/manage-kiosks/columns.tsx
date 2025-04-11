import { Kiosk } from "@/types/kiosk"
import { Calendar, Laptop, MapPin, MoreHorizontal, Power, Store } from "lucide-react"
import { Badge } from "../ui/badge"
import { format, parseISO } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import {
    type ColumnDef
} from "@tanstack/react-table"

// Định nghĩa cột cho bảng
export const columns: ColumnDef<Kiosk>[] = [
    {
        id: "kioskId",
        header: "Mã Kiosk",
        cell: ({ row }) => <div className="font-medium">{row.original.kioskId.substring(0, 8)}...</div>,
    },
    {
        id: "location",
        header: "Vị trí",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.location}</span>
                </div>
            )
        },
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <div className="flex items-center">
                    {status === "Online" ? (
                        <Badge className="bg-green-500">
                            <Power className="h-3 w-3 mr-1" /> Hoạt động
                        </Badge>
                    ) : status === "Offline" ? (
                        <Badge variant="outline" className="border-gray-300 text-gray-500">
                            <Power className="h-3 w-3 mr-1" /> Không hoạt động
                        </Badge>
                    ) : status === "Maintenance" ? (
                        <Badge className="bg-blue-500">
                            <Power className="h-3 w-3 mr-1" /> Bảo trì
                        </Badge>
                    ) : (
                        <Badge className="bg-red-500">
                            <Power className="h-3 w-3 mr-1" /> Lỗi
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        id: "devices",
        header: "Thiết bị",
        cell: ({ row }) => {
            const devices = row.original.devices
            return (
                <div className="flex items-center">
                    <Laptop className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{devices.length} thiết bị</span>
                </div>
            )
        },
    },
    {
        id: "franchise",
        header: "Nhượng quyền",
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <Store className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{row.original.franchiseId.substring(0, 8)}...</span>
                </div>
            )
        },
    },
    {
        id: "installedDate",
        header: "Ngày lắp đặt",
        cell: ({ row }) => {
            const date = parseISO(row.original.installedDate)
            return (
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{format(date, "dd/MM/yyyy")}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.kioskId)}>
                                Sao chép mã Kiosk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Quản lý thiết bị</DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa thông tin</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa Kiosk</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]