import { Device } from "@/types/device"
import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react"
import { Badge } from "../ui/badge"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import {
    type ColumnDef
} from "@tanstack/react-table"

// Định nghĩa cột cho bảng
export const columns: ColumnDef<Device>[] = [
    {
        id: "deviceId",
        header: "Mã thiết bị",
        cell: ({ row }) => {
            const deviceId = row.original.deviceId || "";
            const shortId = deviceId.replace(/-/g, "").substring(0, 8);
            return <div className="font-medium">DEV-{shortId}</div>;
        },
        enableSorting: false,
    },
    {
        id: "name",
        accessorKey: "name",
        header: "Tên thiết bị",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            )
        },
    },
    {
        id: "description",
        header: "Mô tả",
        cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.description}</div>,
        enableSorting: false,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <div className="flex items-center">
                    {status === "Active" ? (
                        <Badge className="bg-green-500">
                            <Power className="h-3 w-3 mr-1" /> Hoạt động
                        </Badge>
                    ) : status === "Inactive" ? (
                        <Badge variant="outline" className="border-gray-300 text-gray-500">
                            <Power className="h-3 w-3 mr-1" /> Không hoạt động
                        </Badge>
                    ) : (
                        <Badge className="bg-red-500">
                            <Power className="h-3 w-3 mr-1" /> Đã xóa
                        </Badge>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        id: "createdDate",
        accessorKey: "createdDate",
        header: "Ngày tạo",
        cell: ({ row }) => {
            const date = new Date(row.original.createdDate)
            return (
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{format(date, "dd/MM/yyyy")}</span>
                </div>
            )
        },
    },
    {
        id: "updatedDate",
        accessorKey: "updatedDate",
        header: "Ngày cập nhật",
        cell: ({ row }) => {
            const updatedDate = row.original.updatedDate;

            if (!updatedDate) {
                return <span className="text-muted-foreground">Chưa cập nhật</span>;
            }

            try {
                const date = new Date(updatedDate);

                if (isNaN(date.getTime())) {
                    return <span className="text-muted-foreground">Ngày không hợp lệ</span>;
                }

                return (
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(date, "dd/MM/yyyy")}</span>
                    </div>
                );
            } catch (error) {
                return <span className="text-muted-foreground">Ngày không hợp lệ</span>;
            }
        },
    },
    {
        id: "actions",
        header: "Hành động",
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.deviceId)}>
                                Sao chép mã thiết bị
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa thiết bị</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        enableSorting: false,
    },
]