import { type ColumnDef } from "@tanstack/react-table";
import { ActionDropdown, BaseFilterBadgesTable } from "../common";
import { truncateText } from "@/utils/text";
import { Package } from "lucide-react";
import { IngredientType } from "@/interfaces/ingredient";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";

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
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EBaseStatus = row.original.status;
                const statusText = EBaseStatusViMap[status] ?? "Không rõ";
                return (
                    <BaseFilterBadgesTable status={status} statusText={statusText} />
                );
            },
            enableSorting: false,
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