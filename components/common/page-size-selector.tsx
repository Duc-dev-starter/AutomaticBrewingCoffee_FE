import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PageSizeSelectorProps {
    pageSize: number;
    setPageSize: (size: number) => void;
    setCurrentPage: (page: number) => void;
    loading: boolean;
}

export const PageSizeSelector = ({ pageSize, setPageSize, setCurrentPage, loading }: PageSizeSelectorProps) => {
    return (
        <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
            }}
            disabled={loading}
        >
            <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
                {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                        {size}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};