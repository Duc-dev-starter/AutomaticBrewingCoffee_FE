import { SyncEvent, SyncTask } from "@/interfaces/sync";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/utils/date";
import { ActionDropdown } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export const syncEventColumns = ({
    onViewDetails,
}: {
    onViewDetails: (syncEvent: SyncEvent) => void;
}): ColumnDef<SyncEvent>[] => [
        {
            id: "syncEventId",
            header: "Mã sự kiện",
            cell: ({ row }) => {
                const syncEventId = row.original.syncEventId || "";
                const shortId = syncEventId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">SE-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "syncEventType",
            accessorKey: "syncEventType",
            header: "Loại sự kiện",
            cell: ({ row }) => (
                <div className="text-center">{row.original.syncEventType}</div>
            ),
        },
        {
            id: "entityType",
            accessorKey: "entityType",
            header: "Loại thực thể",
            cell: ({ row }) => (
                <div className="text-center">{row.original.entityType}</div>
            ),
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
            id: "syncTasks",
            header: "Số tác vụ",
            cell: ({ row }) => (
                <div className="text-center">{row.original.syncTasks.length}</div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onViewDetails={(item) => onViewDetails(item)}
                />
            ),
            enableSorting: false,
        },
    ];

export const syncTaskColumns = ({
    onViewDetails,
}: {
    onViewDetails: (syncTask: SyncTask) => void;
}): ColumnDef<SyncTask>[] => [
        {
            id: "syncTaskId",
            header: "Mã tác vụ",
            cell: ({ row }) => {
                const syncTaskId = row.original.syncTaskId || "";
                const shortId = syncTaskId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">ST-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "kioskId",
            accessorKey: "kioskId",
            header: "Mã kiosk",
            cell: ({ row }) => (
                <div className="text-center">{row.original.kioskId}</div>
            ),
        },
        {
            id: "createdDate",
            accessorKey: "createdDate",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatDate(row.original.createdAt)}</span>
                </div>
            ),
        },
        {
            id: "isSynced",
            accessorKey: "isSynced",
            header: "Trạng thái",
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Badge
                        className={row.original.isSynced ? "bg-green-500" : "bg-red-500"}
                    >
                        {row.original.isSynced ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {row.original.isSynced ? "Đã đồng bộ" : "Chưa đồng bộ"}
                    </Badge>
                </div>
            ),
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onViewDetails={(item) => onViewDetails(item)}
                />
            ),
            enableSorting: false,
        },
    ];