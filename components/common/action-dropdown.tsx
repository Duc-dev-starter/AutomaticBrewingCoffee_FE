import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

type ActionDropdownProps<T> = {
    item: T;
    onCopy?: (item: T) => void;
    onViewDetails?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onSync?: (item: T) => void;
    onWebhook?: (item: T) => void;
}

export function ActionDropdown<T>({
    item,
    onCopy,
    onViewDetails,
    onEdit,
    onDelete,
    onSync,
    onWebhook,
}: ActionDropdownProps<T>) {
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
                    {onWebhook && (
                        <DropdownMenuItem onClick={() => onWebhook(item)}>
                            Liên kết web
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(item)}>
                            Xem chi tiết
                        </DropdownMenuItem>
                    )}
                    {onEdit && (
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
