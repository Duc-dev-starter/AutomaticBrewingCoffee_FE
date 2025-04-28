import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { EWorkflowTypeViMap } from "@/enum/workflow";
import { EBaseStatusViMap } from "@/enum/base";

type FilterBadgesProps = {
    searchValue: string;
    setSearchValue: (value: string) => void;
    statusFilter: string,
    setStatusFilter: (value: string) => void;
    hasActiveFilters: boolean;
};

export const BaseFilterBadges = ({
    searchValue,
    statusFilter,
    setSearchValue,
    setStatusFilter,
    hasActiveFilters,
}: FilterBadgesProps) => {
    if (!hasActiveFilters) return null;

    return (
        <div className="flex gap-2 flex-wrap">
            {searchValue && (
                <Badge variant="secondary" className="px-2 py-1">
                    Tìm kiếm: {searchValue}
                    <X
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={() => setSearchValue("")}
                    />
                </Badge>
            )}
            {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <span>Trạng thái: {EBaseStatusViMap[statusFilter]}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
                </Badge>
            )}
        </div>
    );
};