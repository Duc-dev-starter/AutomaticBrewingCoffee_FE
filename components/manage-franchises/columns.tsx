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
import clsx from "clsx"
import { truncateText } from "@/utils/text"
import { Franchise } from "@/types/franchise"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"

// Định nghĩa cột cho bảng
export const columns: ColumnDef<Franchise>[] = [
    {
        id: "deviceId",
        header: "Mã chi nhánh",
        cell: ({ row }) => {
            const deviceId = row.original.franchiseId || "";
            const shortId = deviceId.replace(/-/g, "").substring(0, 8);
            return <div className="font-medium text-center">FRA-{shortId}</div>;
        },
        enableSorting: false,
    },
    {
        id: "name",
        accessorKey: "name",
        header: "Tên chi nhánh",
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            )
        },
    },
    {
        id: "description",
        header: "Mô tả",
        cell: ({ row }) => <div className="max-w-[300px] truncate text-center">
            {truncateText(row.original.description, 10)}
        </div>,
        enableSorting: false,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status: EBaseStatus = row.original.status;
            const statusText = EBaseStatusViMap[status] ?? "Không rõ";

            return (
                <div className="flex justify-center items-center w-full">
                    <Badge
                        className={clsx(
                            "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                            {
                                "bg-green-500": status === EBaseStatus.Active,
                                "bg-red-500": status === EBaseStatus.Inactive,
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
            const date = new Date(row.original.createdDate)
            return (
                <div className="flex items-center justify-center">
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

            const renderCentered = (text: string) => (
                <div className="flex items-center justify-center text-muted-foreground">
                    <span>{text}</span>
                </div>
            );

            if (!updatedDate) {
                return renderCentered("Chưa cập nhật");
            }

            try {
                const date = new Date(updatedDate);

                if (isNaN(date.getTime())) {
                    return renderCentered("Ngày không hợp lệ");
                }

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
        cell: ({ row }) => {
            return (
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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.franchiseId)}>
                                Sao chép mã chi nhánh
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa chi nhánh</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        enableSorting: false,
    },
]