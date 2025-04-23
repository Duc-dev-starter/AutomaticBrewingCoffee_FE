import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EWorkflowType, EWorkflowTypeViMap } from "@/enum/workflow";

type WorkflowFilterProps = {
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    clearAllFilters: () => void;
    hasActiveFilters: boolean;
    loading: boolean;
};

export const WorkflowFilter = ({
    typeFilter,
    setTypeFilter,
    clearAllFilters,
    hasActiveFilters,
    loading,
}: WorkflowFilterProps) => {
    return (
        <div className="flex items-center gap-2">
            <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                disabled={loading}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Loại quy trình" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {Object.values(EWorkflowType).map((type) => (
                        <SelectItem key={type} value={type}>
                            {EWorkflowTypeViMap[type]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    disabled={loading}
                >
                    Xóa bộ lọc
                </Button>
            )}
        </div>
    );
};