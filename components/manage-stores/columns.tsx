import { Store } from "@/interfaces/store";
import { MapPin, Phone, Store as StoreIcon } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { EBaseStatus, EBaseStatusViMap } from '@/enum/base';
import { ActionDropdown, BaseFilterBadgesTable } from "../common";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete
}: {
    onViewDetails: (store: Store) => void;
    onEdit: (store: Store) => void;
    onDelete: (store: Store) => void;
}): ColumnDef<Store>[] => [
        {
            id: "storeId",
            header: "Mã cửa hàng",
            cell: ({ row }) => {
                const storeId = row.original.storeId || "";
                const shortId = storeId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">STR-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên cửa hàng",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <StoreIcon className="h-4 w-4 text-muted-foreground" />
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
            id: "locationAddress",
            accessorKey: "locationAddress",
            header: "Địa chỉ",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.locationAddress}</span>
                </div>
            ),
        },
        {
            id: "contactPhone",
            accessorKey: "contactPhone",
            header: "Số điện thoại",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.contactPhone}</span>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.storeId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];