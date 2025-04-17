import { Device } from "@/interfaces/device";
import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { EDeviceStatus, EDeviceStatusViMap } from '@/enum/device';
import { truncateText } from "@/utils/text";

// Định nghĩa cột cho bảng, nhận các callback
export const columns = ({
    onViewDetails,
    onEdit,
    onDelete
}: {
    onViewDetails: (device: Device) => void;
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
}): ColumnDef<Device>[] => [
        {
            id: "deviceId",
            header: "Mã thiết bị",
            cell: ({ row }) => {
                const deviceId = row.original.deviceId || "";
                const shortId = deviceId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">DEV-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên thiết bị",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            ),
        },
        {
            id: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-center">
                    {truncateText(row.original.description, 10)}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EDeviceStatus = row.original.status;
                const statusText = EDeviceStatusViMap[status] ?? "Không rõ";
                return (
                    <div className="flex justify-center items-center w-full">
                        <Badge
                            className={clsx(
                                "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                                {
                                    "bg-green-500": status === EDeviceStatus.Idle,
                                    "bg-blue-500": status === EDeviceStatus.Working,
                                    "bg-yellow-500": status === EDeviceStatus.Repair,
                                    "bg-red-500": status === EDeviceStatus.Broken,
                                }
                            )}
                        >
                            <Power className="w-3 h-3 mr-1" />
                            {statusText}
                        </Badge>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "createdDate",
            accessorKey: "createdDate",
            header: "Ngày tạo",
            cell: ({ row }) => {
                const date = new Date(row.original.createdDate);
                return (
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(date, "dd/MM/yyyy")}</span>
                    </div>
                );
            },
        },
        {
            id: "updatedDate",
            accessorKey: "updatedDate",
            header: "Ngày cập nhật",
            cell: ({ row }) => {
                const updatedDate = row.original.updatedDate;
                const renderCentered = (text: string) => (
                    <div className="flex items-center justify-center text-muted-foreground">
                        <span>{text}</span>
                    </div>
                );
                if (!updatedDate) return renderCentered("Chưa cập nhật");
                try {
                    const date = new Date(updatedDate);
                    if (isNaN(date.getTime())) return renderCentered("Ngày không hợp lệ");
                    return (
                        <div className="flex items-center justify-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{format(date, "dd/MM/yyyy")}</span>
                        </div>
                    );
                } catch (error) {
                    return renderCentered("Ngày không hợp lệ");
                }
            },
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <div className="flex justify-center">
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
                            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => onDelete(row.original)}
                            >
                                Xóa thiết bị
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            enableSorting: false,
        },
    ];