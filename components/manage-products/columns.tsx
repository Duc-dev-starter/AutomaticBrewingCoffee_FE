import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/interfaces/product";
import clsx from "clsx";
import { format } from "date-fns";
import { EProductStatus, EProductStatusViMap, EProductTypeViMap } from "@/enum/product";
import { formatCurrency } from "@/utils";
import { ActionDropdown } from "../common";
import { SizeBadge } from "./product-badge";

// Cột cho bảng sản phẩm
export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}): ColumnDef<Product>[] => [
        {
            id: "productId",
            header: "Mã sản phẩm",
            cell: ({ row }) => {
                const productId = row.original.productId || "";
                const shortId = productId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">PRO-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "image",
            header: "Hình ảnh",
            cell: ({ row }) => {
                const imageUrl = row.original.imageUrl;
                return (
                    <div className="flex justify-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="product"
                                className="w-16 h-16 object-cover rounded-md border"
                            />
                        ) : (
                            <span className="text-muted-foreground">Không có ảnh</span>
                        )}
                    </div>
                );
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
            id: "size",
            header: "Size",
            cell: ({ row }) => {
                const size = row.original.size;
                return <SizeBadge size={size} />
            },
            enableSorting: false,
        },
        {
            id: "type",
            header: "Loại sản phẩm",
            cell: ({ row }) => {
                const type = row.original.type;
                return <div className="text-center">{EProductTypeViMap[type] ?? "Không rõ"}</div>;
            },
            enableSorting: false,
        },
        {
            id: "price",
            header: "Giá",
            cell: ({ row }) => {
                return <div className="text-center">{formatCurrency(row.original.price)}</div>;
            },
            enableSorting: false,
        },
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EProductStatus = row.original.status;
                const statusText = EProductStatusViMap[status] ?? "Không rõ";
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
                    <div className="flex justify-center items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(date, "dd/MM/yyyy")}</span>
                    </div>
                );
            },
            enableSorting: true,
        },
        {
            id: "updatedDate",
            accessorKey: "updatedDate",
            header: "Ngày cập nhật",
            cell: ({ row }) => {
                const updatedDate = row.original.updatedDate;
                if (!updatedDate) {
                    return <div className="flex items-center justify-center text-muted-foreground">Chưa cập nhật</div>;
                }
                try {
                    const date = new Date(updatedDate);
                    if (isNaN(date.getTime())) {
                        return <div className="flex items-center justify-center text-muted-foreground">Ngày không hợp lệ</div>;
                    }
                    return (
                        <div className="flex items-center justify-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{format(date, "dd/MM/yyyy")}</span>
                        </div>
                    );
                } catch {
                    return <div className="flex items-center justify-center text-muted-foreground">Ngày không hợp lệ</div>;
                }
            },
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.productId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];