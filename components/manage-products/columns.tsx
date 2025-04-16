import { MoreHorizontal } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";
import clsx from "clsx";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { EProductStatus } from "@/enum/product";

// Cột cho bảng sản phẩm
export const columns = (onViewDetails: (product: Product) => void): ColumnDef<Product>[] => [
    {
        id: "productId",
        header: "Mã sản phẩm",
        cell: ({ row }) => {
            const productId = row.original.productId || "";
            return <div className="font-medium text-center">PRO-{productId.substring(0, 8)}</div>;
        },
        enableSorting: false,
    },
    {
        id: "name",
        header: "Tên sản phẩm",
        accessorKey: "name",
        cell: ({ row }) => <div className="text-center">{row.original.name}</div>,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.original.status;

            return (
                <div className="flex justify-center">
                    <Badge
                        className={clsx(
                            "mr-2 flex items-center justify-center !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                            {
                                "bg-green-500": status === EProductStatus.Selling,
                                "bg-red-500": status === EProductStatus.UnSelling,
                            }
                        )}
                    >
                        {status === EProductStatus.Selling ? "Đang bán" : "Ngừng bán"}
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
                <div className="flex justify-center items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{format(date, "dd/MM/yyyy")}</span>
                </div>
            );
        },
        enableSorting: false,
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
                            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Xóa sản phẩm</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        enableSorting: false,
    },
];