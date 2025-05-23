import { Device } from "@/interfaces/device";
import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { EDeviceStatus, EDeviceStatusViMap } from '@/enum/device';
import { formatDate } from "@/utils/date";
import { ActionDropdown } from "../common";
import DeviceFilterBadgesTable from "./device-filter-badges-table";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete
}: {
    onViewDetails: (device: Device) => void;
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
}): ColumnDef<Device>[] => [
        {
            id: "deviceId",
            header: "Mã thiết bị",
            cell: ({ row }) => {
                const deviceId = row.original.deviceId || "";
                const shortId = deviceId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">DEV-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Tên thiết bị",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.name}</span>
                </div>
            ),
        },
        {
            id: "serialNumber",
            accessorKey: "serialNumber",
            header: "Mã serial",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <span>{row.original.serialNumber}</span>
                </div>
            ),
        },
        {
            id: "deviceInfo",
            header: "Thông tin thiết bị",
            cell: ({ row }) => {
                const modelName = row.original.deviceModel?.modelName || "N/A";
                const deviceTypeName = row.original.deviceModel?.deviceType?.name || "N/A";

                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="font-medium">{modelName}</span>
                        <span className="text-muted-foreground text-xs">{deviceTypeName}</span>
                    </div>
                );
            },
        }
        ,
        {
            id: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status: EDeviceStatus = row.original.status;
                const statusText = EDeviceStatusViMap[status] ?? "Không rõ";
                return (
                    <div className="flex justify-center items-center w-full">
                        <DeviceFilterBadgesTable status={status} statusText={statusText} />
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
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.deviceId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];