"use client";

import {
    ColumnDef,
} from "@tanstack/react-table";
import { Cpu, Power, Calendar } from "lucide-react";
import { DeviceModel } from "@/interfaces/device";
import { ActionDropdown } from "@/components/common";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { formatDate } from "@/utils/date";
export const columns = ({
    onViewDetails,
    onEdit,
    onDelete
}: {
    onViewDetails: (deviceModel: DeviceModel) => void;
    onEdit: (deviceModel: DeviceModel) => void;
    onDelete: (deviceModel: DeviceModel) => void;
}): ColumnDef<DeviceModel>[] => [
        {
            id: "deviceModelId",
            header: "Mã mẫu thiết bị",
            cell: ({ row }) => {
                const deviceModelId = row.original.deviceModelId || "";
                const shortId = deviceModelId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">DVM-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "modelName",
            accessorKey: "modelName",
            header: "Tên mẫu thiết bị",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.modelName}</span>
                </div>
            ),
        },
        {
            id: "manufacturer",
            accessorKey: "manufacturer",
            header: "Nhà sản xuất",
            cell: ({ row }) => (
                <div className="text-center">{row.original.manufacturer || "Chưa xác định"}</div>
            ),
        },
        {
            id: "deviceTypeId",
            accessorKey: "deviceTypeId",
            header: "Loại thiết bị",
            cell: ({ row }) => (
                <div className="text-center">{row.original.deviceType?.name || "Không rõ"}</div>
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
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatDate(row.original.createdDate)}</span>
                </div>
            ),
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
                    onCopy={(item) => navigator.clipboard.writeText(item.deviceModelId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];

