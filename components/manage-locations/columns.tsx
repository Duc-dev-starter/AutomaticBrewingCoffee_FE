import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown } from "../common";
import { Menu } from "@/interfaces/menu";
import { LocationType } from "@/interfaces/location";
import { truncateText } from "@/utils/text";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (locationType: LocationType) => void;
    onEdit: (locationType: LocationType) => void;
    onDelete: (locationType: LocationType) => void;
}): ColumnDef<LocationType>[] => [
        {
            id: "locationTypeId",
            header: "Mã location",
            cell: ({ row }) => {
                const locationId = row.original.locationTypeId || "";
                const shortId = locationId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">LOC-{shortId}</div>;
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
                    onCopy={(item) => navigator.clipboard.writeText(item.locationTypeId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];