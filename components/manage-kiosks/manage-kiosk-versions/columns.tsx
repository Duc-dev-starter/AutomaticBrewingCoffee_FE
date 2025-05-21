import { Calendar, Cpu, MoreHorizontal, Power } from "lucide-react";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { KioskVersion } from "@/interfaces/kiosk"; // Đảm bảo import đúng interface
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { Badge } from "@/components/ui/badge";
import { ActionDropdown, BaseFilterBadgesTable } from "@/components/common";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (kioskVersion: KioskVersion) => void;
    onEdit: (kioskVersion: KioskVersion) => void;
    onDelete: (kioskVersion: KioskVersion) => void;
}): ColumnDef<KioskVersion>[] => [
        {
            id: "kioskVersionId",
            header: "Mã phiên bản",
            cell: ({ row }) => {
                const kioskVersionId = row.original.kioskVersionId || "";
                const shortId = kioskVersionId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">KIV-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "versionTitle",
            accessorKey: "versionTitle",
            header: "Tiêu đề phiên bản",
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.versionTitle}</span>
                </div>
            ),
        },
        {
            id: "versionNumber",
            accessorKey: "versionNumber",
            header: "Số phiên bản",
            cell: ({ row }) => (
                <div className="text-center">{row.original.versionNumber}</div>
            ),
        },
        {
            id: "kioskTypeName",
            header: "Tên loại kiosk",
            cell: ({ row }) => (
                <div className="text-center">{row.original.kioskType?.name || "Không có"}</div>
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
                    onCopy={(item) => navigator.clipboard.writeText(item.kioskVersionId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];