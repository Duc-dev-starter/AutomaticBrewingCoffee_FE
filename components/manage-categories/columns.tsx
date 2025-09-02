import { type ColumnDef } from "@tanstack/react-table";
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base";
import { ActionDropdown } from "../common";
import BaseFilterBadgesTable from "../common/base-filter-badges-table";
import { Category } from "@/interfaces/category";
import { truncateText } from "@/utils/text";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const columns = ({
    onViewDetails,
    onEdit,
    onDelete,
}: {
    onViewDetails: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}): ColumnDef<Category>[] => [
        {
            id: "productCategoryId",
            header: "Mã danh mục",
            cell: ({ row }) => {
                const productCategoryId = row.original.productCategoryId || "";
                const shortId = productCategoryId.replace(/-/g, "").substring(0, 8);
                return <div className="font-medium text-center">CAT-{shortId}</div>;
            },
            enableSorting: false,
        },
        {
            id: "imageUrl",
            header: "Hình ảnh",
            cell: ({ row }) => {
                const logoUrl = row.original.imageUrl;
                return (
                    <div className="flex justify-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Danh mục"
                                className="w-10 h-10 object-contain rounded"
                            />
                        ) : (
                            <span className="text-muted-foreground">Chưa có</span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: "name",
            header: "Tên danh mục",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.name || "Chưa có"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "displayOrder",
            header: "Thứ tự",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.displayOrder || "Chưa có"}
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
            id: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate text-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer">
                                {truncateText(row.original.description, 10)}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black">
                            <p className="font-mono ">{row.original.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Hành động",
            cell: ({ row }) => (
                <ActionDropdown
                    item={row.original}
                    onCopy={(item) => navigator.clipboard.writeText(item.productCategoryId)}
                    onViewDetails={(item) => onViewDetails(item)}
                    onEdit={(item) => onEdit(item)}
                    onDelete={(item) => onDelete(item)}
                />
            ),
            enableSorting: false,
        },
    ];