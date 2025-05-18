import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { Kiosk } from "@/interfaces/kiosk";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown } from "../common";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
    onSync,
    onWebhook
}: {
    onViewDetails: (kiosk: Kiosk) => void;
    onEdit: (kiosk: Kiosk) => void;
    onDelete: (kiosk: Kiosk) => void;
    onSync: (kiosk: Kiosk) => void;
    onWebhook: (kiosk: Kiosk) => void;
}): ColumnDef<Kiosk>[] => [
        {
            id: "kioskId",
            header: "Mã kiosk",
            cell: ({ row }) => {
                const kioskId = row.original.kioskId || "";
                const shortId = kioskId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">KIO-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "location",
            accessorKey: "location",
            header: "Địa chỉ",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.location}</span>
                </div>
            ),
        },
        {
            id: "store",
            header: "Tên cửa hàng",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.store?.name || "Không có"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "devices",
            header: "Thiết bị",
            cell: ({ row }) => {
                const devices = row.original.devices || [];
                return (
                    <div className="text-center">
                        {devices.length > 0 ? `${devices.length} thiết bị` : "Không có thiết bị"}
                    </div>
                );
            },
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
            id: "installedDate",
            accessorKey: "installedDate",
            header: "Ngày lắp đặt",
            cell: ({ row }) => {
                const date = new Date(row.original.installedDate);
                return (
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{format(date, "dd/MM/yyyy")}</span>
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
                    onCopy={(item) => navigator.clipboard.writeText(item.kioskId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                    onSync={(item) => onSync(item)}
                    onWebhook={(item) => onWebhook(item)}
                />
            ),
            enableSorting: false,
        },
    ];