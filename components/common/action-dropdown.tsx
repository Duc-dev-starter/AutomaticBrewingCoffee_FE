import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useAppStore } from "@/stores/use-app-store";

type ActionDropdownProps<T> = {
    item: T;
    onCopy?: (item: T) => void;
    onViewDetails?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onSync?: (item: T) => void;
    onWebhook?: (item: T) => void;
    onClone?: (item: T) => void;
    onExport?: (item: T) => void;
    onSyncOverride?: (item: T) => void;
    onRefund?: (item: T) => void;
    onMenuClone?: (item: T) => void;
}

export function ActionDropdown<T>({
    item,
    onCopy,
    onViewDetails,
    onEdit,
    onDelete,
    onSync,
    onWebhook,
    onClone,
    onExport,
    onSyncOverride,
    onRefund,
    onMenuClone
}: ActionDropdownProps<T>) {
    const { account } = useAppStore();
    return (
        <div className="flex justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    {onCopy && (
                        <DropdownMenuItem onClick={() => onCopy(item)}>
                            Sao chép
                        </DropdownMenuItem>
                    )}
                    {onSync && (
                        <DropdownMenuItem onClick={() => onSync(item)}>
                            Đồng bộ
                        </DropdownMenuItem>
                    )}
                    {onSyncOverride && (
                        <DropdownMenuItem onClick={() => onSyncOverride(item)}>
                            Đồng bộ ghi đè
                        </DropdownMenuItem>
                    )}
                    {onWebhook && (
                        <DropdownMenuItem onClick={() => onWebhook(item)}>
                            Liên kết web
                        </DropdownMenuItem>
                    )}
                    {onClone && account?.roleName === "Admin" && (
                        <DropdownMenuItem onClick={() => onClone(item)}>
                            Nhân bản sản phẩm
                        </DropdownMenuItem>
                    )}
                    {onMenuClone && (
                        <DropdownMenuItem onClick={() => onMenuClone(item)}>
                            Nhân bản menu
                        </DropdownMenuItem>
                    )}
                    {onExport && (
                        <DropdownMenuItem onClick={() => onExport(item)}>
                            Xuất file
                        </DropdownMenuItem>
                    )}
                    {onRefund && (
                        <DropdownMenuItem onClick={() => onRefund(item)}>
                            Hoàn tiền
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(item)}>
                            Xem chi tiết
                        </DropdownMenuItem>
                    )}
                    {onEdit && account?.roleName === "Admin" && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            Chỉnh sửa
                        </DropdownMenuItem>
                    )}
                    {onDelete && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(item)}
                        >
                            Xóa
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
