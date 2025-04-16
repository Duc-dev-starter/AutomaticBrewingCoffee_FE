import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";  // Import interface Product
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import ProductDetailDialog from "../dialog/product";

// Cột cho bảng sản phẩm
export const columns: ColumnDef<Product>[] = [
    {
        id: "productId",
        header: "Mã sản phẩm",
        accessorKey: "productId",
        cell: ({ row }) => {
            return <div className="font-medium text-center">{row.original.productId}</div>;
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
        id: "description",
        header: "Mô tả",
        cell: ({ row }) => <div className="max-w-[300px] truncate text-center">{row.original.description}</div>,
        enableSorting: false,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex justify-center">
                    <Badge className={clsx("flex items-center justify-center !px-2 !py-[2px] !rounded-full !text-white !text-xs", {
                        "bg-green-500": isActive,
                        "bg-red-500": !isActive
                    })}>
                        {isActive ? "Active" : "Inactive"}
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
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex justify-center">
                    <ProductDetailDialog product={product} />
                </div>
            );
        },
        enableSorting: false,
    },
];
