import { Calendar, Cpu } from "lucide-react";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { KioskType } from "@/interfaces/kiosk";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { truncateText } from "@/utils/text";
import { ActionDropdown, BaseFilterBadgesTable } from "@/components/common";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (kioskType: KioskType) => void;
    onEdit: (kioskType: KioskType) => void;
    onDelete: (kioskType: KioskType) => void;
}): ColumnDef<KioskType>[] => [
        {
            id: "kioskTypeId",
            header: "Mã loại kiosk",
            cell: ({ row }) => {
                const kioskTypeId = row.original.kioskTypeId || "";
                const shortId = kioskTypeId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">KIT-{shortId}</div>;
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
                    onCopy={(item) => navigator.clipboard.writeText(item.kioskTypeId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];