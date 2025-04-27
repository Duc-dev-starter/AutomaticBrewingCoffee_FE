import { ColumnDef } from "@tanstack/react-table";
import { MenuProductMapping } from "@/interfaces/menu"; // Import MenuProductMapping thay vì ProductInMenu
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const columns = ({
    onDelete,
}: {
    onDelete: (mapping: MenuProductMapping) => void;
}): ColumnDef<MenuProductMapping>[] => [
        {
            id: "image",
            header: "Hình ảnh",
            cell: ({ row }) => (
                <img
                    src={row.original.product?.imageUrl || "/placeholder.svg"}
                    alt={row.original.product?.name || "Không có tên"}
                    className="h-10 w-10 rounded-md object-cover"
                />
            ),
            enableHiding: true,
        },
        {
            id: "name",
            header: "Tên sản phẩm",
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.product?.name || "Không có tên"}
                </div>
            ),
            enableHiding: true,
        },
        {
            id: "price",
            header: "Giá (VNĐ)",
            cell: ({ row }) => (
                <div className="text-right">
                    {row.original.product?.price?.toLocaleString() || "0"}
                </div>
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
                        value={row.original.displayOrder ?? ""}
                        onChange={(e) => {
                            const newOrder = Number(e.target.value);
                            row.original.displayOrder = newOrder;
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