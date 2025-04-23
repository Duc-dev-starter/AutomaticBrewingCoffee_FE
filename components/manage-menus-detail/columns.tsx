import { ColumnDef } from "@tanstack/react-table";
import { Product, ProductInMenu } from "@/interfaces/product";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const columns = ({
    onDelete,
}: {
    onDelete: (product: ProductInMenu) => void;
}): ColumnDef<ProductInMenu>[] => [
        {
            id: "image",
            header: "Hình ảnh",
            cell: ({ row }) => (
                <img
                    src={row.original.imageUrl || "/placeholder.svg"}
                    alt={row.original.name}
                    className="h-10 w-10 rounded-md object-cover"
                />
            ),
            enableHiding: true,
        },
        {
            id: "name",
            header: "Tên sản phẩm",
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
            enableHiding: true,
        },
        {
            id: "price",
            header: "Giá (VNĐ)",
            cell: ({ row }) => (
                <div className="text-right">{row.original.price.toLocaleString()}</div>
            ),
            enableHiding: true,
        },
        {
            id: "order",
            header: "Thứ tự",
            cell: ({ row }) => (
                <div className="text-center">
                    <input
                        type="number"
                        className="w-16 px-2 py-1 border rounded text-center"
                        value={row.original.menuProductMappings?.[0]?.displayOrder ?? ''}
                        onChange={(e) => {
                            const newOrder = Number(e.target.value);
                            if (row.original.menuProductMappings?.[0]) {
                                row.original.menuProductMappings[0].displayOrder = newOrder;
                            }
                        }}
                    />
                </div>
            ),
            enableHiding: true,
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            enableHiding: true,
        },
    ];