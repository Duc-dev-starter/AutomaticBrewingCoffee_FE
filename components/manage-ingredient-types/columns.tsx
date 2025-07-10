import { type ColumnDef } from "@tanstack/react-table";
import { ActionDropdown } from "../common";
import { truncateText } from "@/utils/text";
import { formatDate } from "@/utils/date";
import { Calendar, Package } from "lucide-react";
import { IngredientType } from "@/interfaces/ingredient";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (ingredientType: IngredientType) => void;
    onEdit: (ingredientType: IngredientType) => void;
    onDelete: (ingredientType: IngredientType) => void;
}): ColumnDef<IngredientType>[] => [
        {
            id: "ingredientTypeId",
            header: "Mã loại nguyên liệu",
            cell: ({ row }) => {
                const ingredientId = row.original.ingredientTypeId || "";
                const shortId = ingredientId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">ING-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
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
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {row.original.status}
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.ingredientTypeId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];