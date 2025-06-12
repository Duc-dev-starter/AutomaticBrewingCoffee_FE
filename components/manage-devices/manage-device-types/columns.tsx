import { DeviceType } from "@/interfaces/device";
import { Calendar, Check, Cpu, Power, X } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { formatDate, formatTime } from "@/utils/date";
import { ActionDropdown } from "@/components/common";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { Badge } from "@/components/ui/badge";
import { truncateText } from "@/utils/text";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete
}: {
    onViewDetails: (deviceType: DeviceType) => void;
    onEdit: (deviceType: DeviceType) => void;
    onDelete: (deviceType: DeviceType) => void;
}): ColumnDef<DeviceType>[] => [
        {
            id: "deviceTypeId",
            header: "Mã loại thiết bị",
            cell: ({ row }) => {
                const deviceTypeId = row.original.deviceTypeId || "";
                const shortId = deviceTypeId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">DVT-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên thiết bị",
            cell: ({ row }) => (
                <div className="max-w-[200px] flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    {truncateText(row.original.name, 15)}
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
            id: "isMobileDevice",
            header: "Thiết bị di động",
            cell: ({ row }) => (
                <div className="flex justify-center items-center h-full">
                    {row.original.isMobileDevice ? (
                        <Check className="text-green-500" />
                    ) : (
                        <X className="text-red-500" />
                    )}
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
                const createdDate = new Date(row.original.createdDate);
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
                if (isNaN(date.getTime())) return renderCentered("Ngày không hợp lệ");
                return (
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatDate(updatedDate)}</span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.deviceTypeId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];