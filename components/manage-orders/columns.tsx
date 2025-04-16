import { MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { truncateText } from "@/utils/text";
import { Order } from "@/types/order";
import { EOrderStatus, EOrderStatusViMap } from "@/enum/order";
import OrderDetailDialog from "../dialog/order";

// Định nghĩa cột cho bảng
export const columns: ColumnDef<Order>[] = [
    {
        id: "orderId",
        header: "Mã đơn hàng",
        cell: ({ row }) => {
            const orderId = row.original.orderId || "";
            return <div className="font-medium text-center">ORD-{orderId.substring(0, 8)}</div>;
        },
        enableSorting: false,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status: EOrderStatus = row.original.status;
            const statusText = EOrderStatusViMap[status] ?? "Không rõ";

            return (
                <div className="flex justify-center items-center w-full">
                    <Badge
                        className={clsx(
                            "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                            {
                                "bg-green-500": status === EOrderStatus.Completed,
                                "bg-yellow-500": status === EOrderStatus.Preparing,
                                "bg-blue-500": status === EOrderStatus.Ready,
                                "bg-gray-500": status === EOrderStatus.Pending,
                                "bg-red-500": status === EOrderStatus.Cancelled || status === EOrderStatus.Failed,
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
        id: "totalAmount",
        header: "Tổng số tiền",
        cell: ({ row }) => {
            const totalAmount = row.original.totalAmount;
            return <div className="text-center">{totalAmount.toLocaleString()} VND</div>;
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
                            <DropdownMenuItem onClick={() => openDetailDialog(row.original)}>
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa đơn hàng</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        enableSorting: false,
    },
];

const openDetailDialog = (order: Order) => {
    <div className="flex justify-center">
        <OrderDetailDialog order={order} />
    </div>
};
