import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { EWorkflowTypeViMap } from "@/enum/workflow";

type FilterBadgesProps = {
    searchValue: string;
    setSearchValue: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    hasActiveFilters: boolean;
};

export const FilterBadges = ({
    searchValue,
    setSearchValue,
    typeFilter,
    setTypeFilter,
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
            {typeFilter && (
                <Badge variant="secondary" className="px-2 py-1">
                    Loại: {EWorkflowTypeViMap[typeFilter as keyof typeof EWorkflowTypeViMap]}
                    <X
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={() => setTypeFilter("")}
                    />
                </Badge>
            )}
        </div>
    );
};