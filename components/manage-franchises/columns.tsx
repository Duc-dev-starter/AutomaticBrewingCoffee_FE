import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { truncateText } from "@/utils/text";
import { Franchise } from "@/interfaces/franchise";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown } from "../common";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (franchise: Franchise) => void;
    onEdit: (franchise: Franchise) => void;
    onDelete: (franchise: Franchise) => void;
}): ColumnDef<Franchise>[] => [
        {
            id: "franchiseId",
            header: "Mã chi nhánh",
            cell: ({ row }) => {
                const franchiseId = row.original.franchiseId || "";
                const shortId = franchiseId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">FRA-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên chi nhánh",
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
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EBaseStatus = row.original.status;
                const statusText = EBaseStatusViMap[status] ?? "Không rõ";
                return (
                    <div className="flex justify-center items-center w-full">
                        <Badge
                            className={clsx(
                                "flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs",
                                {
                                    "bg-green-500": status === EBaseStatus.Active,
                                    "bg-red-500": status === EBaseStatus.Inactive,
                                }
                            )}
                        >
                            <Power className="w-3 h-3 mr-1" />
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
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(date, "dd/MM/yyyy")}</span>
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
                try {
                    const date = new Date(updatedDate);
                    if (isNaN(date.getTime())) return renderCentered("Ngày không hợp lệ");
                    return (
                        <div className="flex items-center justify-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{format(date, "dd/MM/yyyy")}</span>
                        </div>
                    );
                } catch (error) {
                    return renderCentered("Ngày không hợp lệ");
                }
            },
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.franchiseId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];