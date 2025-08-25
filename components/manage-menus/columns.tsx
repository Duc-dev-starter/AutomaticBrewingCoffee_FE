import { Cpu, } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown, BaseFilterBadgesTable } from "../common";
import { Menu } from "@/interfaces/menu";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
    onMenuClone,
}: {
    onViewDetails: (menu: Menu) => void;
    onEdit: (menu: Menu) => void;
    onDelete: (menu: Menu) => void;
    onMenuClone: (menu: Menu) => void;
}): ColumnDef<Menu>[] => [
        {
            id: "menuId",
            header: "Mã menu",
            cell: ({ row }) => {
                const menuId = row.original.menuId || "";
                const shortId = menuId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">MEN-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            ),
        },
        {
            id: "organizationName",
            header: "Tên tổ chức",
            cell: ({ row }) => (
                <div className="text-center">{row.original.organization?.name || "Chưa có"}</div>
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
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.menuId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                    onMenuClone={(item) => onMenuClone(item)}
                />
            ),
            enableSorting: false,
        },
    ];