import { Calendar, LocateIcon } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { ActionDropdown } from "../common";
import { LocationType } from "@/interfaces/location";
import { truncateText } from "@/utils/text";
import { formatDate } from "@/utils/date";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
                    <LocateIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            ),
        },
        {
            id: "createdDate",
            accessorKey: "createdDate",
            header: "Ngày tạo",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDate(row.original.createdDate)}</span>
                    </div>
                );
            },
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

                if (!updatedDate) return renderCentered("Chưa cập nhật");

                const date = new Date(updatedDate);

                if (isNaN(date.getTime())) {
                    return renderCentered("Ngày không hợp lệ");
                }

                return (
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDate(updatedDate)}</span>
                    </div>
                );
            },
        },
        {
            id: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer">
                                {truncateText(row.original.description, 10)}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black">
                            <p className="font-mono ">{row.original.description}</p>
                        </TooltipContent>
                    </Tooltip>
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