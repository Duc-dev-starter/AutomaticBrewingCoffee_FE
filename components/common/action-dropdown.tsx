import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

type ActionDropdownProps<T> = {
    item: T;
    onCopy?: (item: T) => void;
    onViewDetails?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

export function ActionDropdown<T>({
    item,
    onCopy,
    onViewDetails,
    onEdit,
    onDelete,
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
